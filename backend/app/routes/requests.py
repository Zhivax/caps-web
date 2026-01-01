"""
Fabric request management routes
"""
from typing import List
from fastapi import APIRouter, HTTPException, Depends, status
from app.models import FabricRequest, RequestStatusUpdate
from app.core import TokenData, InputSanitizer, AuditLogger, get_current_active_user
from app.database import REQUESTS, FABRICS

router = APIRouter(prefix="/api/requests", tags=["requests"])

@router.get("", response_model=List[FabricRequest])
async def get_requests(current_user: TokenData = Depends(get_current_active_user)):
    """Get fabric requests filtered by user role"""
    if current_user.role == "UMKM":
        # UMKM users see only their own requests
        return [r for r in REQUESTS if r.umkmId == current_user.user_id]
    elif current_user.role == "SUPPLIER":
        # Suppliers see only requests for their fabrics
        return [r for r in REQUESTS if r.supplierId == current_user.user_id]
    else:
        return []

@router.post("")
async def create_request(
    request_data: FabricRequest,
    current_user: TokenData = Depends(get_current_active_user)
):
    """Create new fabric request (UMKM only)"""
    if current_user.role != "UMKM":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only UMKM users can create requests"
        )
    
    # Validate ownership: request must be from current user
    if request_data.umkmId != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only create requests for yourself"
        )
    
    request_data.umkmName = InputSanitizer.sanitize_string(request_data.umkmName, 100)
    request_data.supplierName = InputSanitizer.sanitize_string(request_data.supplierName, 100)
    request_data.fabricName = InputSanitizer.sanitize_string(request_data.fabricName, 100)
    
    REQUESTS.insert(0, request_data)
    AuditLogger.log_sensitive_operation(current_user.user_id, "CREATE_REQUEST", request_data.id)
    
    return {"message": "Request created successfully", "request": request_data}

@router.patch("/{request_id}/status")
async def update_request_status(
    request_id: str, 
    update: RequestStatusUpdate,
    current_user: TokenData = Depends(get_current_active_user)
):
    """Update request status with backend stock validation"""
    request = next((r for r in REQUESTS if r.id == request_id), None)
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")
    
    # Permission checks
    if current_user.role == "SUPPLIER":
        if update.status not in ["APPROVED", "REJECTED", "SHIPPED"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Suppliers can only approve, reject, or ship requests"
            )
        if request.supplierId != current_user.user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only update requests for your fabrics"
            )
        
        # Backend validation for approval
        if update.status == "APPROVED":
            fabric = next((f for f in FABRICS if f.id == request.fabricId), None)
            if not fabric:
                raise HTTPException(status_code=404, detail="Fabric not found")
            
            if fabric.stock < request.quantity:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Insufficient fabric stock. Available: {fabric.stock}m, Requested: {request.quantity}m"
                )
            
            # Backend calculation - deduct stock
            fabric.stock -= request.quantity
            AuditLogger.log_sensitive_operation(
                current_user.user_id, 
                "DEDUCT_FABRIC_STOCK", 
                f"{fabric.id}:{request.quantity}"
            )
    
    elif current_user.role == "UMKM":
        if update.status not in ["COMPLETED", "CANCELLED"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="UMKM can only complete or cancel requests"
            )
        if request.umkmId != current_user.user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only update your own requests"
            )
    
    request.status = update.status
    AuditLogger.log_sensitive_operation(
        current_user.user_id, 
        "UPDATE_REQUEST_STATUS", 
        f"{request_id}:{update.status}"
    )
    
    return {"message": "Request status updated successfully", "request": request}
