# Security module placeholders for future implementation (JWT tokens, password hashing, etc.)

def hash_password(password: str) -> str:
    """
    Hash a password. Placeholder for future hashing library (like passlib/bcrypt).
    """
    raise NotImplementedError("Password hashing is not implemented in Phase 1.")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a plain password against its hash. Placeholder.
    """
    raise NotImplementedError("Password verification is not implemented in Phase 1.")


def create_access_token(data: dict) -> str:
    """
    Create a JWT access token. Placeholder for future jwt library.
    """
    raise NotImplementedError("JWT creation is not implemented in Phase 1.")


def get_current_user() -> dict:
    """
    Retrieve current authenticated user. Placeholder dependency.
    """
    raise NotImplementedError("User authentication is not implemented in Phase 1.")
