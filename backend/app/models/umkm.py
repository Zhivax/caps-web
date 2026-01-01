"""
UMKM fabric storage models
"""
from pydantic import BaseModel, Field


class UMKMFabric(BaseModel):
    """UMKM fabric storage (local warehouse)"""
    id: str
    umkmId: str
    fabricId: str
    fabricName: str = Field(..., min_length=1, max_length=100)
    fabricColor: str = Field(..., min_length=1, max_length=50)
    quantity: float = Field(..., ge=0)
