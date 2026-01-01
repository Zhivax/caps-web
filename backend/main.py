"""
Supply Chain Dashboard API - Main Application
Refactored for better maintainability following best practices
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

from app.core.config import (
    API_TITLE, API_VERSION, ALLOWED_ORIGINS, 
    DOCS_URL, REDOC_URL
)
from app.routes import (
    auth_router,
    fabric_router,
    request_router,
    hijab_router,
    production_router
)

# Initialize FastAPI app
app = FastAPI(
    title=API_TITLE,
    version=API_VERSION,
    docs_url=DOCS_URL,
    redoc_url=REDOC_URL
)

# Initialize rate limiter
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router)
app.include_router(fabric_router)
app.include_router(request_router)
app.include_router(hijab_router)
app.include_router(production_router)

# Root endpoints
@app.get("/")
def read_root():
    """API root endpoint"""
    return {
        "message": "Supply Chain Dashboard API - Secure",
        "version": API_VERSION,
        "security": "JWT-based authentication with RBAC"
    }


@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "version": API_VERSION}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
