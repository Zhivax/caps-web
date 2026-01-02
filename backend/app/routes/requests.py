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
    """Get fabric requests"""
    return REQUESTS

@router.post("")
async def create_request(
    request_data: FabricRequest,
    current_user: TokenData = Depends(get_current_active_user)
):
    """Create new fabric request (UMKM only)"""
    if current_user.role != "UMKM":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Hanya pengguna UMKM yang dapat membuat permintaan"
        )
    
    request_data.umkmName = InputSanitizer.sanitize_string(request_data.umkmName, 100)
    request_data.supplierName = InputSanitizer.sanitize_string(request_data.supplierName, 100)
    request_data.fabricName = InputSanitizer.sanitize_string(request_data.fabricName, 100)
    
    REQUESTS.insert(0, request_data)
    AuditLogger.log_sensitive_operation(current_user.user_id, "CREATE_REQUEST", request_data.id)
    
    return {"message": "Permintaan berhasil dibuat", "request": request_data}

@router.patch("/{request_id}/status")
async def update_request_status(
    request_id: str, 
    update: RequestStatusUpdate,
    current_user: TokenData = Depends(get_current_active_user)
):
    """Update request status with backend stock validation"""
    request = next((r for r in REQUESTS if r.id == request_id), None)
    if not request:
        raise HTTPException(status_code=404, detail="Permintaan tidak ditemukan")
    
    # Permission checks
    if current_user.role == "SUPPLIER":
        if update.status not in ["APPROVED", "REJECTED", "SHIPPED"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Supplier hanya dapat menyetujui, menolak, atau mengirim permintaan"
            )
        if request.supplierId != current_user.user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Anda hanya dapat memperbarui permintaan untuk kain Anda"
            )
        
        # Backend validation for approval
        if update.status == "APPROVED":
            fabric = next((f for f in FABRICS if f.id == request.fabricId), None)
            if not fabric:
                raise HTTPException(status_code=404, detail="Kain tidak ditemukan")
            
            if fabric.stock < request.quantity:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Stok kain tidak mencukupi. Tersedia: {fabric.stock}m, Diminta: {request.quantity}m"
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
                detail="UMKM hanya dapat menyelesaikan atau membatalkan permintaan"
            )
        if request.umkmId != current_user.user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Anda hanya dapat memperbarui permintaan Anda sendiri"
            )
    
    request.status = update.status
    AuditLogger.log_sensitive_operation(
        current_user.user_id, 
        "UPDATE_REQUEST_STATUS", 
        f"{request_id}:{update.status}"
    )
    
    return {"message": "Status permintaan berhasil diperbarui", "request": request}
