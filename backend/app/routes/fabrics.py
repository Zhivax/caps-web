"""
Fabric management routes
"""
from typing import List
from fastapi import APIRouter, HTTPException, Depends, status
from app.models import Fabric, FabricUpdate
from app.core import TokenData, InputSanitizer, AuditLogger, get_current_active_user
from app.database import FABRICS

router = APIRouter(prefix="/api/fabrics", tags=["fabrics"])

@router.get("", response_model=List[Fabric])
async def get_fabrics(current_user: TokenData = Depends(get_current_active_user)):
    """Get all fabrics"""
    return FABRICS

@router.post("")
async def add_fabric(fabric: Fabric, current_user: TokenData = Depends(get_current_active_user)):
    """Add new fabric (SUPPLIER only)"""
    if current_user.role != "SUPPLIER":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only suppliers can add fabrics"
        )
    
    # Validate ownership: fabric must belong to current user
    if fabric.supplierId != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only add fabrics for yourself"
        )
    
    fabric.name = InputSanitizer.sanitize_string(fabric.name, 100)
    fabric.type = InputSanitizer.sanitize_string(fabric.type, 50)
    fabric.color = InputSanitizer.sanitize_string(fabric.color, 50)
    
    FABRICS.append(fabric)
    AuditLogger.log_sensitive_operation(current_user.user_id, "ADD_FABRIC", fabric.id)
    
    return {"message": "Fabric added successfully", "fabric": fabric}

@router.get("/{fabric_id}", response_model=Fabric)
async def get_fabric(fabric_id: str, current_user: TokenData = Depends(get_current_active_user)):
    """Get single fabric by ID"""
    fabric = next((f for f in FABRICS if f.id == fabric_id), None)
    if not fabric:
        raise HTTPException(status_code=404, detail="Fabric not found")
    return fabric

@router.patch("/{fabric_id}")
async def update_fabric(
    fabric_id: str, 
    updates: FabricUpdate,
    current_user: TokenData = Depends(get_current_active_user)
):
    """Update fabric stock/price (SUPPLIER only, must own fabric)"""
    if current_user.role != "SUPPLIER":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only suppliers can update fabrics"
        )
    
    fabric = next((f for f in FABRICS if f.id == fabric_id), None)
    if not fabric:
        raise HTTPException(status_code=404, detail="Fabric not found")
    
    if fabric.supplierId != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update your own fabrics"
        )
    
    if updates.stock is not None:
        fabric.stock = updates.stock
    if updates.pricePerUnit is not None:
        fabric.pricePerUnit = updates.pricePerUnit
    
    AuditLogger.log_sensitive_operation(current_user.user_id, "UPDATE_FABRIC", fabric.id)
    
    return {"message": "Fabric updated successfully", "fabric": fabric}
