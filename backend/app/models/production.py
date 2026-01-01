"""
Production and usage tracking models
"""
from pydantic import BaseModel, Field


class ProductionRequest(BaseModel):
    """Request to produce hijab products"""
    productId: str
    quantity: int = Field(..., gt=0)
    fabricUsed: float = Field(..., gt=0)


class UsageLog(BaseModel):
    """Fabric usage log model"""
    id: str
    productId: str
    productName: str = Field(..., min_length=1, max_length=100)
    fabricId: str
    fabricName: str = Field(..., min_length=1, max_length=100)
    fabricUsed: float = Field(..., gt=0)
    quantityProduced: int = Field(..., gt=0)
    timestamp: str
