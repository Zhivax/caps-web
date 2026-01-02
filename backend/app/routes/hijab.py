"""
Hijab product and sales management routes
"""
from typing import List
from fastapi import APIRouter, HTTPException, Depends, status
from datetime import datetime
from app.models import HijabProduct, HijabSale, HijabSaleRequest, UsageLog
from app.core import TokenData, InputSanitizer, AuditLogger, get_current_active_user
from app.database import HIJAB_PRODUCTS, SALES, USAGE_HISTORY
import uuid

router = APIRouter(prefix="/api", tags=["hijab"])

@router.get("/hijab-products", response_model=List[HijabProduct])
async def get_hijab_products(current_user: TokenData = Depends(get_current_active_user)):
    """Get all hijab products"""
    return HIJAB_PRODUCTS

@router.post("/hijab-products")
async def upsert_hijab_product(
    product: HijabProduct,
    current_user: TokenData = Depends(get_current_active_user)
):
    """Create or update hijab product (UMKM only)"""
    if current_user.role != "UMKM":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Hanya pengguna UMKM yang dapat mengelola produk"
        )
    
    product.name = InputSanitizer.sanitize_string(product.name, 100)
    product.color = InputSanitizer.sanitize_string(product.color, 50)
    
    existing = next((p for p in HIJAB_PRODUCTS if p.id == product.id), None)
    if existing:
        idx = HIJAB_PRODUCTS.index(existing)
        HIJAB_PRODUCTS[idx] = product
        AuditLogger.log_sensitive_operation(current_user.user_id, "UPDATE_PRODUCT", product.id)
        return {"message": "Produk berhasil diperbarui", "product": product}
    else:
        HIJAB_PRODUCTS.append(product)
        AuditLogger.log_sensitive_operation(current_user.user_id, "CREATE_PRODUCT", product.id)
        return {"message": "Produk berhasil dibuat", "product": product}

@router.get("/sales", response_model=List[HijabSale])
async def get_sales(current_user: TokenData = Depends(get_current_active_user)):
    """Get hijab sales (UMKM role only)"""
    if current_user.role != "UMKM":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Hanya pengguna UMKM yang dapat melihat penjualan"
        )
    return SALES

@router.post("/sales")
async def record_sale(
    sale_request: HijabSaleRequest,
    current_user: TokenData = Depends(get_current_active_user)
):
    """Record sale with backend validation"""
    if current_user.role != "UMKM":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Hanya pengguna UMKM yang dapat mencatat penjualan"
        )
    
    # Backend validation
    product = next((p for p in HIJAB_PRODUCTS if p.id == sale_request.productId), None)
    if not product:
        raise HTTPException(status_code=404, detail="Produk tidak ditemukan")
    
    if product.stock < sale_request.quantity:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Stok tidak mencukupi. Tersedia: {product.stock}, Diminta: {sale_request.quantity}"
        )
    
    # Backend calculation
    product.stock -= sale_request.quantity
    
    # Create sale
    sale = HijabSale(
        id=f"sale-{uuid.uuid4()}",
        productId=sale_request.productId,
        productName=InputSanitizer.sanitize_string(sale_request.productName, 100),
        quantity=sale_request.quantity,
        trackingNumber=InputSanitizer.sanitize_string(sale_request.trackingNumber, 100),
        date=sale_request.date,
        timestamp=datetime.now().isoformat()
    )
    
    SALES.insert(0, sale)
    AuditLogger.log_sensitive_operation(current_user.user_id, "RECORD_SALE", sale.id)
    
    return {
        "message": "Sale recorded successfully", 
        "sale": sale,
        "updated_stock": product.stock
    }

@router.get("/usage-history", response_model=List[UsageLog])
async def get_usage_history(current_user: TokenData = Depends(get_current_active_user)):
    """Get fabric usage history (UMKM only)"""
    if current_user.role != "UMKM":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only UMKM users can view usage history"
        )
    return USAGE_HISTORY

@router.post("/usage-history")
async def record_usage(
    log: UsageLog,
    current_user: TokenData = Depends(get_current_active_user)
):
    """Record fabric usage (UMKM only)"""
    if current_user.role != "UMKM":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only UMKM users can record usage"
        )
    
    log.productName = InputSanitizer.sanitize_string(log.productName, 100)
    log.fabricName = InputSanitizer.sanitize_string(log.fabricName, 100)
    
    USAGE_HISTORY.insert(0, log)
    AuditLogger.log_sensitive_operation(current_user.user_id, "RECORD_USAGE", log.id)
    
    return {"message": "Usage recorded successfully", "log": log}
