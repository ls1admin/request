"""Cryptographic utilities for password generation."""

import secrets
import string

from passlib.hash import sha512_crypt  # type: ignore[import-untyped]

# Configure SHA-512 crypt with 5000 rounds
_sha512_hasher = sha512_crypt.using(rounds=5000)


def generate_sha512_password(length: int = 16) -> str:
    """
    Generate a random password and return it as a SHA-512 crypt hash.

    Args:
        length: Length of the random password to generate before hashing.

    Returns:
        SHA-512 crypt hash of a randomly generated password.
    """
    alphabet = string.ascii_letters + string.digits + "!@#$%^&*"
    password = "".join(secrets.choice(alphabet) for _ in range(length))
    return _sha512_hasher.hash(password)
