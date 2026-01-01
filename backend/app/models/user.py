"""
User-related data models
"""
from typing import Optional
from pydantic import BaseModel, Field, field_validator


class UserBase(BaseModel):
    """Base user model"""
    name: str = Field(..., min_length=1, max_length=100)
    email: str = Field(..., min_length=5, max_length=100)
    role: str = Field(..., pattern="^(UMKM|SUPPLIER)$")
    avatar: Optional[str] = Field(None, max_length=500)
    phone: Optional[str] = Field(None, max_length=20)
    location: Optional[str] = Field(None, max_length=200)
    description: Optional[str] = Field(None, max_length=500)
    
    @field_validator('email')
    @classmethod
    def validate_email(cls, v):
        from app.core.security import InputSanitizer
        if not InputSanitizer.validate_email(v):
            raise ValueError('Invalid email format')
        return v.lower()


class User(UserBase):
    """User model with ID"""
    id: str
    hashed_password: Optional[str] = None
    
    class Config:
        exclude = {'hashed_password'}


class UserResponse(BaseModel):
    """User response model (without sensitive data)"""
    id: str
    name: str
    email: str
    role: str
    avatar: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    description: Optional[str] = None


class LoginRequest(BaseModel):
    """Login request with email and password"""
    email: str = Field(..., min_length=5, max_length=100)
    password: str = Field(..., min_length=6, max_length=100)
    
    @field_validator('email')
    @classmethod
    def validate_email(cls, v):
        from app.core.security import InputSanitizer
        if not InputSanitizer.validate_email(v):
            raise ValueError('Invalid email format')
        return v.lower()


class RefreshTokenRequest(BaseModel):
    """Refresh token request"""
    refresh_token: str
