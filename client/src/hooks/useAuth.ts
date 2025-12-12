import { useMemo } from "react";
import { useAuth as useOidcAuth } from "react-oidc-context";
import { ADMIN_ROLE, KEYCLOAK_CLIENT_ID } from "@/config/auth";
import type { KeycloakTokenPayload, UserInfo, UserRole } from "@/types/auth";

function parseJwt(token: string): KeycloakTokenPayload | null {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join(""),
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

function extractRole(tokenPayload: KeycloakTokenPayload | null): UserRole {
  if (!tokenPayload) return "user";

  // Check client-scoped roles only
  const clientRoles =
    tokenPayload.resource_access?.[KEYCLOAK_CLIENT_ID]?.roles ?? [];
  if (clientRoles.includes(ADMIN_ROLE)) {
    return "admin";
  }

  return "user";
}

export function useAuth() {
  const auth = useOidcAuth();

  const tokenPayload = useMemo(() => {
    if (!auth.user?.access_token) return null;
    return parseJwt(auth.user.access_token);
  }, [auth.user?.access_token]);

  const userInfo: UserInfo | null = useMemo(() => {
    if (!auth.isAuthenticated || !auth.user) return null;

    const role = extractRole(tokenPayload);

    return {
      id: tokenPayload?.sub ?? "",
      email: tokenPayload?.email ?? null,
      emailVerified: tokenPayload?.email_verified ?? false,
      username: tokenPayload?.preferred_username ?? null,
      firstName: tokenPayload?.given_name ?? null,
      lastName: tokenPayload?.family_name ?? null,
      fullName: tokenPayload?.name ?? null,
      role,
      isAdmin: role === "admin",
      rawToken: tokenPayload,
    };
  }, [auth.isAuthenticated, auth.user, tokenPayload]);

  return {
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.isLoading,
    error: auth.error,
    user: userInfo,
    accessToken: auth.user?.access_token ?? null,
    login: () => auth.signinRedirect(),
    logout: () => auth.signoutRedirect(),
    silentLogin: () => auth.signinSilent(),
  };
}
