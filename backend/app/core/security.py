from functools import lru_cache

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.config import settings

bearer_scheme = HTTPBearer()


@lru_cache(maxsize=1)
def _get_supabase_client():
    """Create a single reusable Supabase admin client (cached after first call)."""
    from supabase import create_client
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)


async def verify_token(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
) -> dict:
    """Validate the Supabase JWT sent by the add-in.

    Uses Supabase's auth.get_user() with the service-role key so the server
    can verify any user's token without needing the user's own session.

    Returns a dict with 'sub' (Supabase user UUID) and 'email'.
    Raises HTTP 401 if the token is missing, invalid, or expired.
    """
    if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_ROLE_KEY:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Auth service not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
        )

    token = credentials.credentials

    try:
        supabase = _get_supabase_client()
        user_response = supabase.auth.get_user(token)
        if user_response and user_response.user:
            return {
                "sub": user_response.user.id,
                "email": user_response.user.email,
            }
    except Exception as exc:
        # Log in development so we can see what went wrong
        if settings.APP_ENV == "development":
            print(f"[auth] Token verification failed: {exc}")

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired token",
        headers={"WWW-Authenticate": "Bearer"},
    )
