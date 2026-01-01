"""
Application configuration
"""
import os

# Security Configuration
# Use fixed key for development, environment variable for production
if os.getenv("ENVIRONMENT") == "production":
    SECRET_KEY = os.getenv("SECRET_KEY")
    if not SECRET_KEY:
        raise ValueError("SECRET_KEY must be set via environment variable in production")
else:
    # Fixed key for development to maintain sessions across restarts
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key-change-in-production-12345678901234567890")

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
