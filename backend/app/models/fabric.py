"""
Fabric-related data models
"""
from typing import Optional
from pydantic import BaseModel, Field


class Fabric(BaseModel):
    """Fabric model"""
    id: str
    supplierId: str
    supplierName: str
    name: str = Field(..., min_length=1, max_length=100)
    type: str = Field(..., min_length=1, max_length=50)
    color: str = Field(..., min_length=1, max_length=50)
    pricePerUnit: float = Field(..., gt=0)
    stock: float = Field(..., ge=0)


class FabricUpdate(BaseModel):
    """Fabric update model for partial updates"""
    stock: Optional[float] = Field(None, ge=0)
    pricePerUnit: Optional[float] = Field(None, gt=0)
