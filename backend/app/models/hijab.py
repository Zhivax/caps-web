"""
Hijab product and sales related models
"""
from pydantic import BaseModel, Field


class HijabProduct(BaseModel):
    """Hijab product model"""
    id: str
    umkmId: str
    name: str = Field(..., min_length=1, max_length=100)
    color: str = Field(..., min_length=1, max_length=50)
    stock: int = Field(..., ge=0)
    threshold: int = Field(..., ge=0)
    fabricId: str


class HijabSaleRequest(BaseModel):
    """Request to record a sale (without id and timestamp)"""
    productId: str
    productName: str = Field(..., min_length=1, max_length=100)
    quantity: int = Field(..., gt=0)
    trackingNumber: str = Field(..., min_length=1, max_length=100)
    date: str


class HijabSale(BaseModel):
    """Hijab sale model with complete information"""
    id: str
    productId: str
    productName: str = Field(..., min_length=1, max_length=100)
    quantity: int = Field(..., gt=0)
    trackingNumber: str = Field(..., min_length=1, max_length=100)
    date: str
    timestamp: str
