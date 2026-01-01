"""
Routes module initialization
"""
from .auth import router as auth_router
from .fabrics import router as fabric_router
from .requests import router as request_router
from .hijab import router as hijab_router
from .production import router as production_router

__all__ = [
    "auth_router",
    "fabric_router",
    "request_router",
    "hijab_router",
    "production_router",
]
