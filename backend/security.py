"""
Security utilities for authentication, authorization, and protection.
Implements JWT tokens, password hashing, RBAC, and security middleware.
"""
from datetime import datetime, timedelta
from typing import Optional, List
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel
import secrets
import logging
from functools import wraps

# Security Configuration
SECRET_KEY = secrets.token_urlsafe(32)  # Generate secure random key
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
REFRESH_TOKEN_EXPIRE_DAYS = 7

# Password hashing context with bcrypt
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# HTTP Bearer token scheme
security = HTTPBearer()

# Logging
logger = logging.getLogger(__name__)


class TokenData(BaseModel):
    """Token payload data structure"""
    user_id: str
    email: str
    role: str
    exp: Optional[datetime] = None


class Token(BaseModel):
    """Token response model"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class PasswordHash:
    """Password hashing utilities"""
    
    @staticmethod
    def hash_password(password: str) -> str:
        """Hash a password using bcrypt"""
        return pwd_context.hash(password)
    
    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """Verify a password against its hash"""
        return pwd_context.verify(plain_password, hashed_password)


class JWTHandler:
    """JWT token creation and validation"""
    
    @staticmethod
    def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
        """Create a JWT access token"""
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        
        to_encode.update({
            "exp": expire,
            "iat": datetime.utcnow(),
            "type": "access"
        })
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        return encoded_jwt
    
    @staticmethod
    def create_refresh_token(data: dict) -> str:
        """Create a JWT refresh token"""
        to_encode = data.copy()
        expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
        
        to_encode.update({
            "exp": expire,
            "iat": datetime.utcnow(),
            "type": "refresh"
        })
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        return encoded_jwt
    
    @staticmethod
    def decode_token(token: str) -> TokenData:
        """Decode and validate a JWT token"""
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            user_id: str = payload.get("user_id")
            email: str = payload.get("email")
            role: str = payload.get("role")
            
            if user_id is None or email is None or role is None:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid token payload",
                    headers={"WWW-Authenticate": "Bearer"},
                )
            
            return TokenData(user_id=user_id, email=email, role=role)
        
        except JWTError as e:
            logger.error(f"JWT decode error: {e}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )


class AuthMiddleware:
    """Authentication middleware for protected endpoints"""
    
    @staticmethod
    async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> TokenData:
        """Validate token and return current user data"""
        token = credentials.credentials
        return JWTHandler.decode_token(token)
    
    @staticmethod
    async def get_current_active_user(current_user: TokenData = Depends(get_current_user)) -> TokenData:
        """Get current active user (can be extended with user status checks)"""
        return current_user


class RBACHandler:
    """Role-Based Access Control handler"""
    
    @staticmethod
    def require_role(allowed_roles: List[str]):
        """
        Decorator to restrict endpoint access to specific roles.
        Usage: @RBACHandler.require_role(["UMKM", "SUPPLIER"])
        """
        def decorator(func):
            @wraps(func)
            async def wrapper(*args, current_user: TokenData = Depends(AuthMiddleware.get_current_active_user), **kwargs):
                if current_user.role not in allowed_roles:
                    logger.warning(f"Unauthorized access attempt by user {current_user.email} with role {current_user.role}")
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail=f"Access denied. Required roles: {', '.join(allowed_roles)}"
                    )
                return await func(*args, current_user=current_user, **kwargs)
            return wrapper
        return decorator


class SecurityHeaders:
    """Security headers middleware"""
    
    @staticmethod
    def add_security_headers(request: Request, call_next):
        """Add security headers to all responses"""
        async def middleware(request: Request):
            response = await call_next(request)
            
            # Security headers
            response.headers["X-Content-Type-Options"] = "nosniff"
            response.headers["X-Frame-Options"] = "DENY"
            response.headers["X-XSS-Protection"] = "1; mode=block"
            response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
            response.headers["Content-Security-Policy"] = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
            response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
            response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
            
            return response
        
        return middleware(request)


class InputSanitizer:
    """Input validation and sanitization utilities"""
    
    @staticmethod
    def sanitize_string(input_str: str, max_length: int = 500) -> str:
        """Sanitize string input to prevent injection attacks"""
        if not input_str:
            return ""
        
        # Remove null bytes
        sanitized = input_str.replace('\x00', '')
        
        # Limit length
        sanitized = sanitized[:max_length]
        
        # Strip leading/trailing whitespace
        sanitized = sanitized.strip()
        
        return sanitized
    
    @staticmethod
    def validate_email(email: str) -> bool:
        """Basic email validation"""
        import re
        email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return bool(re.match(email_regex, email))


class AuditLogger:
    """Audit logging for security events"""
    
    @staticmethod
    def log_authentication(user_id: str, email: str, success: bool, ip_address: str = None):
        """Log authentication attempts"""
        status = "SUCCESS" if success else "FAILED"
        logger.info(f"AUTH_{status}: User {email} (ID: {user_id}) from IP: {ip_address}")
    
    @staticmethod
    def log_authorization_failure(user_id: str, email: str, role: str, endpoint: str, ip_address: str = None):
        """Log authorization failures"""
        logger.warning(f"AUTHZ_FAILED: User {email} (Role: {role}) attempted to access {endpoint} from IP: {ip_address}")
    
    @staticmethod
    def log_sensitive_operation(user_id: str, operation: str, resource: str):
        """Log sensitive operations"""
        logger.info(f"SENSITIVE_OP: User {user_id} performed {operation} on {resource}")
