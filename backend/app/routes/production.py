"""
Production and UMKM fabric storage routes
"""
from typing import List
from fastapi import APIRouter, HTTPException, Depends, status
from datetime import datetime
from app.models import ProductionRequest, UMKMFabric, UsageLog
from app.core import TokenData, AuditLogger, get_current_active_user
from app.database import HIJAB_PRODUCTS, UMKM_FABRICS, USAGE_HISTORY
import uuid

router = APIRouter(prefix="/api", tags=["production"])

@router.get("/umkm-fabrics", response_model=List[UMKMFabric])
async def get_umkm_fabrics(current_user: TokenData = Depends(get_current_active_user)):
    """Get UMKM fabric storage"""
    if current_user.role != "UMKM":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only UMKM users can view fabric storage"
        )
    return [f for f in UMKM_FABRICS if f.umkmId == current_user.user_id]

@router.post("/umkm-fabrics/add")
async def add_umkm_fabric(
    fabric: UMKMFabric,
    current_user: TokenData = Depends(get_current_active_user)
):
    """Add fabric to UMKM storage"""
    if current_user.role != "UMKM":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only UMKM users can add fabric to storage"
        )
    
    if fabric.umkmId != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only add fabric to your own storage"
        )
    
    existing = next((f for f in UMKM_FABRICS if f.umkmId == fabric.umkmId and f.fabricId == fabric.fabricId), None)
    if existing:
        existing.quantity += fabric.quantity
    else:
        fabric.id = f"uf-{uuid.uuid4()}"
        UMKM_FABRICS.append(fabric)
    
    AuditLogger.log_sensitive_operation(current_user.user_id, "ADD_UMKM_FABRIC", fabric.fabricId)
    
    return {"message": "Fabric added to storage successfully", "fabric": fabric}

@router.post("/production/produce")
async def produce_hijab(
    production: ProductionRequest,
    current_user: TokenData = Depends(get_current_active_user)
):
    """Produce hijab products with backend validation"""
    if current_user.role != "UMKM":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only UMKM users can produce products"
        )
    
    # Backend validation
    product = next((p for p in HIJAB_PRODUCTS if p.id == production.productId), None)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    if product.umkmId != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only produce your own products"
        )
    
    # Check fabric availability
    umkm_fabric = next(
        (f for f in UMKM_FABRICS if f.umkmId == current_user.user_id and f.fabricId == product.fabricId), 
        None
    )
    
    if not umkm_fabric or umkm_fabric.quantity < production.fabricUsed:
        available = umkm_fabric.quantity if umkm_fabric else 0
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Insufficient raw materials. Available: {available}m, Required: {production.fabricUsed}m"
        )
    
    # Backend calculation
    umkm_fabric.quantity -= production.fabricUsed
    product.stock += production.quantity
    
    # Create usage log
    usage_log = UsageLog(
        id=f"uh-{uuid.uuid4()}",
        productId=product.id,
        productName=product.name,
        fabricId=product.fabricId,
        fabricName=umkm_fabric.fabricName,
        fabricUsed=production.fabricUsed,
        quantityProduced=production.quantity,
        timestamp=datetime.now().isoformat()
    )
    USAGE_HISTORY.insert(0, usage_log)
    
    AuditLogger.log_sensitive_operation(
        current_user.user_id, 
        "PRODUCE_HIJAB", 
        f"{product.id}:{production.quantity}"
    )
    
    return {
        "message": "Production recorded successfully",
        "product": product,
        "usage_log": usage_log,
        "remaining_fabric": umkm_fabric.quantity
    }
