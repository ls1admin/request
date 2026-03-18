from typing import Annotated

import httpx
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from pydantic import BaseModel

from request_server.core.config import settings

security = HTTPBearer(auto_error=not settings.auth_bypass)
optional_security = HTTPBearer(auto_error=False)

# Cache for JWKS
_jwks_cache: dict | None = None

# Fixed user returned when auth_bypass is enabled (E2E testing)
_BYPASS_USER: "CurrentUser | None" = None


class TokenPayload(BaseModel):
    sub: str
    email: str | None = None
    preferred_username: str | None = None
    given_name: str | None = None
    family_name: str | None = None
    realm_access: dict | None = None


class CurrentUser(BaseModel):
    id: str
    username: str
    email: str | None = None
    first_name: str | None = None
    last_name: str | None = None
    roles: list[str] = []

    @property
    def is_admin(self) -> bool:
        return "admin" in self.roles

    @property
    def full_name(self) -> str | None:
        """Get the user's full name from first and last name."""
        if self.first_name and self.last_name:
            return f"{self.first_name} {self.last_name}"
        elif self.first_name:
            return self.first_name
        elif self.last_name:
            return self.last_name
        return None


def _get_bypass_user() -> "CurrentUser":
    global _BYPASS_USER
    if _BYPASS_USER is None:
        _BYPASS_USER = CurrentUser(
            id="test-user-001",
            username="testuser",
            email="test@tum.de",
            first_name="Test",
            last_name="User",
            roles=["admin"],
        )
    return _BYPASS_USER


async def get_jwks() -> dict:
    """Fetch and cache JWKS from Keycloak."""
    global _jwks_cache
    if _jwks_cache is None:
        async with httpx.AsyncClient() as client:
            response = await client.get(settings.keycloak_jwks_url)
            response.raise_for_status()
            _jwks_cache = response.json()
    return _jwks_cache


async def verify_token(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(security)],
) -> TokenPayload:
    """Verify JWT token from Keycloak."""
    if settings.auth_bypass:
        return TokenPayload(
            sub="test-user-001",
            email="test@tum.de",
            preferred_username="testuser",
            given_name="Test",
            family_name="User",
            realm_access={"roles": ["admin"]},
        )

    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )

    token = credentials.credentials

    try:
        jwks = await get_jwks()

        # Get the signing key
        unverified_header = jwt.get_unverified_header(token)
        kid = unverified_header.get("kid")

        key = None
        for jwk in jwks.get("keys", []):
            if jwk.get("kid") == kid:
                key = jwk
                break

        if key is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Unable to find appropriate key",
            )

        payload = jwt.decode(
            token,
            key,
            algorithms=["RS256"],
            audience=settings.keycloak_client_id,
            issuer=settings.keycloak_issuer,
        )

        return TokenPayload(**payload)

    except JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Could not validate credentials: {e}",
        ) from e


async def get_current_user(
    token: Annotated[TokenPayload, Depends(verify_token)],
) -> CurrentUser:
    """Extract current user from verified token."""
    if settings.auth_bypass:
        return _get_bypass_user()

    roles = []
    if token.realm_access:
        roles = token.realm_access.get("roles", [])

    return CurrentUser(
        id=token.sub,
        username=token.preferred_username or token.sub,
        email=token.email,
        first_name=token.given_name,
        last_name=token.family_name,
        roles=roles,
    )


async def get_current_admin_user(
    user: Annotated[CurrentUser, Depends(get_current_user)],
) -> CurrentUser:
    """Ensure the current user is an admin."""
    if not user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )
    return user


async def get_optional_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(optional_security)],
) -> CurrentUser | None:
    """
    Get the current user if authenticated, or None if anonymous.

    This allows endpoints to handle both authenticated and anonymous requests.
    """
    if settings.auth_bypass:
        # In bypass mode, return the bypass user if a token header is present, else None
        if credentials is not None:
            return _get_bypass_user()
        return None

    if credentials is None:
        return None

    try:
        token = credentials.credentials
        jwks = await get_jwks()

        # Get the signing key
        unverified_header = jwt.get_unverified_header(token)
        kid = unverified_header.get("kid")

        key = None
        for jwk in jwks.get("keys", []):
            if jwk.get("kid") == kid:
                key = jwk
                break

        if key is None:
            return None

        payload = jwt.decode(
            token,
            key,
            algorithms=["RS256"],
            audience=settings.keycloak_client_id,
            issuer=settings.keycloak_issuer,
        )

        token_payload = TokenPayload(**payload)

        roles = []
        if token_payload.realm_access:
            roles = token_payload.realm_access.get("roles", [])

        return CurrentUser(
            id=token_payload.sub,
            username=token_payload.preferred_username or token_payload.sub,
            email=token_payload.email,
            first_name=token_payload.given_name,
            last_name=token_payload.family_name,
            roles=roles,
        )
    except (JWTError, Exception):
        # If token validation fails, treat as anonymous
        return None
