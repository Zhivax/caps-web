"""
Application configuration
"""
import os
import secrets

# Security Configuration
SECRET_KEY = os.getenv("SECRET_KEY", secrets.token_urlsafe(32))
if os.getenv("ENVIRONMENT") == "production" and not os.getenv("SECRET_KEY"):
    raise ValueError("SECRET_KEY must be set via environment variable in production")

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
REFRESH_TOKEN_EXPIRE_DAYS = 7

# CORS Configuration
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:8080").split(",")

# API Configuration
API_TITLE = "Supply Chain Dashboard API - Secure"
API_VERSION = "2.0.0"
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")

# Documentation
DOCS_URL = None if ENVIRONMENT == "production" else "/docs"
REDOC_URL = None if ENVIRONMENT == "production" else "/redoc"
