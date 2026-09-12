"""Authentication & Authorization endpoints (OAuth2 / JWT)."""

from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, HTTPException, status
from app.schemas.auth import LoginRequest, Token, UserProfile
from app.core.security import create_access_token
from app.core.config import settings

router = APIRouter()


@router.post("/login", response_model=Token)
async def login(request: LoginRequest) -> Token:
    """
    Mock/Scaffold authentication endpoint for multi-tenant users:
    - Farmers (Farmer PWA)
    - FPO Admins (FPO Portal)
    - Underwriters (Lender Dashboard)
    """
    # Scaffold credentials validation
    if not request.phone_or_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Phone or Email is required",
        )

    mock_user_id = f"usr_{abs(hash(request.phone_or_email)) % 1000000:06d}"
    role = request.role if request.role in ["farmer", "fpo_admin", "lender_underwriter"] else "farmer"

    access_token = create_access_token(
        subject=mock_user_id,
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
        extra_claims={"role": role, "identifier": request.phone_or_email},
    )

    return Token(
        access_token=access_token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user_id=mock_user_id,
        roles=[role],
    )


@router.get("/me", response_model=UserProfile)
async def get_current_user_profile() -> UserProfile:
    """Return profile of authenticated session (scaffold)."""
    return UserProfile(
        id="usr_001928",
        name="Rameshwar Patel",
        phone="+91-9876543210",
        role="farmer",
        organization_id="fpo_nashik_grapes_01",
    )
