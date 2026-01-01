"""
Fabric request related models
"""
from typing import Optional
from pydantic import BaseModel, Field


class FabricRequest(BaseModel):
    """Fabric request model"""
    id: str
    umkmId: str
    umkmName: str = Field(..., min_length=1, max_length=100)
    supplierId: str
    supplierName: str = Field(..., min_length=1, max_length=100)
    fabricId: str
    fabricName: str = Field(..., min_length=1, max_length=100)
    fabricColor: str = Field(..., min_length=1, max_length=50)
    quantity: float = Field(..., gt=0)
    status: str = Field(..., pattern="^(PENDING|WAITING_VERIFICATION|APPROVED|SHIPPED|REJECTED|CANCELLED|COMPLETED)$")
    timestamp: str
    notes: Optional[str] = Field(None, max_length=1000)
    paymentProof: Optional[str] = Field(None, max_length=100000)  # Base64 image string


class RequestStatusUpdate(BaseModel):
    """Request status update model"""
    status: str = Field(..., pattern="^(PENDING|WAITING_VERIFICATION|APPROVED|SHIPPED|REJECTED|CANCELLED|COMPLETED)$")
