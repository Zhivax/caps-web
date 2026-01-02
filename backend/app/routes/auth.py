"""
Authentication routes
"""
from typing import Dict
from fastapi import APIRouter, HTTPException, Request, Depends, status
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.models import LoginRequest, RefreshTokenRequest, UserResponse
from app.core import (
    JWTHandler, PasswordHash, Token, TokenData, 
    AuditLogger, get_current_active_user
)
from app.database import USERS
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/auth", tags=["authentication"])
limiter = Limiter(key_func=get_remote_address)


@router.post("/login", response_model=Dict)
@limiter.limit("5/minute")
async def login(request: Request, login_data: LoginRequest):
    """
    Secure login endpoint with JWT tokens.
    Rate limited to 5 attempts per minute.
    """
    try:
        # Find user by email
        user = next((u for u in USERS if u.email.lower() == login_data.email.lower()), None)
        
        if not user:
            AuditLogger.log_authentication("unknown", login_data.email, False, request.client.host)
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Email atau kata sandi tidak valid"
            )
        
        # Verify password
        if not PasswordHash.verify_password(login_data.password, user.hashed_password):
            AuditLogger.log_authentication(user.id, user.email, False, request.client.host)
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Email atau kata sandi tidak valid"
            )
        
        # Create tokens
        token_data = {
            "user_id": user.id,
            "email": user.email,
            "role": user.role
        }
        
        access_token = JWTHandler.create_access_token(token_data)
        refresh_token = JWTHandler.create_refresh_token(token_data)
        
        AuditLogger.log_authentication(user.id, user.email, True, request.client.host)
        
        # Return tokens and user info
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "user": UserResponse(
                id=user.id,
                name=user.name,
                email=user.email,
                role=user.role,
                avatar=user.avatar,
                phone=user.phone,
                location=user.location,
                description=user.description
            ).dict()
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Kesalahan server internal saat login"
        )


@router.post("/refresh", response_model=Token)
@limiter.limit("10/minute")
async def refresh_token(request: Request, refresh_data: RefreshTokenRequest):
    """
    Refresh access token using refresh token.
    Rate limited to 10 attempts per minute.
    """
    try:
        # Decode refresh token
        token_data = JWTHandler.decode_token(refresh_data.refresh_token)
        
        # Create new access token
        new_token_data = {
            "user_id": token_data.user_id,
            "email": token_data.email,
            "role": token_data.role
        }
        
        access_token = JWTHandler.create_access_token(new_token_data)
        new_refresh_token = JWTHandler.create_refresh_token(new_token_data)
        
        return Token(
            access_token=access_token,
            refresh_token=new_refresh_token,
            token_type="bearer"
        )
    
    except Exception as e:
        logger.error(f"Token refresh error: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token refresh tidak valid"
        )


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: TokenData = Depends(get_current_active_user)):
    """Get current authenticated user information"""
    user = next((u for u in USERS if u.id == current_user.user_id), None)
    if not user:
        raise HTTPException(status_code=404, detail="Pengguna tidak ditemukan")
    
    return UserResponse(
        id=user.id,
        name=user.name,
        email=user.email,
        role=user.role,
        avatar=user.avatar,
        phone=user.phone,
        location=user.location,
        description=user.description
    )
