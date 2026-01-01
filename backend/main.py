from fastapi import FastAPI, HTTPException, Depends, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from pydantic import BaseModel, Field, validator
from typing import List, Optional, Dict
from datetime import datetime, timedelta
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import json
import os
import logging

from security import (
    JWTHandler, PasswordHash, AuthMiddleware, RBACHandler,
    Token, TokenData, InputSanitizer, AuditLogger
)

# Logging configuration
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Rate limiter configuration
limiter = Limiter(key_func=get_remote_address)

app = FastAPI(
    title="Supply Chain Dashboard API - Secure",
    version="2.0.0",
    docs_url=None if os.getenv("ENVIRONMENT") == "production" else "/docs",
    redoc_url=None if os.getenv("ENVIRONMENT") == "production" else "/redoc"
)

# Add rate limiter to app state
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Enable CORS with specific origins for production
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:8080").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "DELETE"],
    allow_headers=["Content-Type", "Authorization"],
    expose_headers=["Content-Length"],
    max_age=600,
)

# Add trusted host middleware
if os.getenv("ENVIRONMENT") == "production":
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=["*.example.com", "localhost"]
    )


# Security headers middleware
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    """Add security headers to all responses"""
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
    return response

# ===== Models =====

class UserBase(BaseModel):
    """Base user model"""
    name: str = Field(..., min_length=1, max_length=100)
    email: str = Field(..., min_length=5, max_length=100)
    role: str = Field(..., pattern="^(UMKM|SUPPLIER)$")
    avatar: Optional[str] = Field(None, max_length=500)
    phone: Optional[str] = Field(None, max_length=20)
    location: Optional[str] = Field(None, max_length=200)
    description: Optional[str] = Field(None, max_length=500)
    
    @validator('email')
    def validate_email(cls, v):
        if not InputSanitizer.validate_email(v):
            raise ValueError('Invalid email format')
        return v.lower()


class User(UserBase):
    """User model with ID"""
    id: str
    hashed_password: Optional[str] = None
    
    class Config:
        exclude = {'hashed_password'}


class UserResponse(BaseModel):
    """User response model (without sensitive data)"""
    id: str
    name: str
    email: str
    role: str
    avatar: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    description: Optional[str] = None


class LoginRequest(BaseModel):
    """Login request with email and password"""
    email: str = Field(..., min_length=5, max_length=100)
    password: str = Field(..., min_length=6, max_length=100)
    
    @validator('email')
    def validate_email(cls, v):
        if not InputSanitizer.validate_email(v):
            raise ValueError('Invalid email format')
        return v.lower()


class RefreshTokenRequest(BaseModel):
    """Refresh token request"""
    refresh_token: str


class Fabric(BaseModel):
    id: str
    supplierId: str
    supplierName: str
    name: str = Field(..., min_length=1, max_length=100)
    type: str = Field(..., min_length=1, max_length=50)
    color: str = Field(..., min_length=1, max_length=50)
    pricePerUnit: float = Field(..., gt=0)
    stock: float = Field(..., ge=0)

class FabricUpdate(BaseModel):
    stock: Optional[float] = Field(None, ge=0)
    pricePerUnit: Optional[float] = Field(None, gt=0)

class HijabProduct(BaseModel):
    id: str
    umkmId: str
    name: str = Field(..., min_length=1, max_length=100)
    color: str = Field(..., min_length=1, max_length=50)
    stock: int = Field(..., ge=0)
    threshold: int = Field(..., ge=0)
    fabricId: str

class HijabSale(BaseModel):
    id: str
    productId: str
    productName: str = Field(..., min_length=1, max_length=100)
    quantity: int = Field(..., gt=0)
    trackingNumber: str = Field(..., min_length=1, max_length=100)
    date: str
    timestamp: str

class UsageLog(BaseModel):
    id: str
    productId: str
    productName: str = Field(..., min_length=1, max_length=100)
    fabricId: str
    fabricName: str = Field(..., min_length=1, max_length=100)
    fabricUsed: float = Field(..., gt=0)
    quantityProduced: int = Field(..., gt=0)
    timestamp: str

class FabricRequest(BaseModel):
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
    status: str = Field(..., pattern="^(PENDING|WAITING_VERIFICATION|APPROVED|SHIPPED|REJECTED|CANCELLED|COMPLETED)$")

# ===== In-memory database =====
# Initialize with extensive mock data
# Default password for all demo users: "password123"
HASHED_PASSWORD = PasswordHash.hash_password("password123")

USERS = [
    User(
        id='u1', name='Zahra Hijab', email='umkm@example.com', role='UMKM',
        avatar='https://placehold.co/200x200/6366f1/ffffff?text=UMKM',
        hashed_password=HASHED_PASSWORD
    ),
    User(
        id='u2', name='Aisha Fashion', email='umkm2@example.com', role='UMKM',
        avatar='https://placehold.co/200x200/6366f1/ffffff?text=Aisha',
        hashed_password=HASHED_PASSWORD
    ),
    User(
        id='u3', name='Hijabku Store', email='umkm3@example.com', role='UMKM',
        avatar='https://placehold.co/200x200/6366f1/ffffff?text=Hijabku',
        hashed_password=HASHED_PASSWORD
    ),
    User(
        id='s1', name='Mitra Tekstil Solo', email='supplier@example.com', role='SUPPLIER',
        avatar='https://placehold.co/200x200/4f46e5/ffffff?text=Supplier+1',
        phone='082232316323', location='Solo, Jawa Tengah',
        description='Spesialis kain voal dan katun premium sejak 2010.',
        hashed_password=HASHED_PASSWORD
    ),
    User(
        id='s2', name='Bandung Fabric Hub', email='supplier2@example.com', role='SUPPLIER',
        avatar='https://placehold.co/200x200/4f46e5/ffffff?text=Supplier+2',
        phone='081299887766', location='Bandung, Jawa Barat',
        description='Pusat kain silk dan satin kualitas ekspor.',
        hashed_password=HASHED_PASSWORD
    ),
    User(
        id='s3', name='Surabaya Tekstil Utama', email='supplier3@example.com', role='SUPPLIER',
        avatar='https://placehold.co/200x200/4f46e5/ffffff?text=Supplier+3',
        phone='085711223344', location='Surabaya, Jawa Timur',
        description='Penyedia kain jersey dan spandex terlengkap.',
        hashed_password=HASHED_PASSWORD
    ),
    User(
        id='s4', name='Cigondewah Jaya', email='supplier4@example.com', role='SUPPLIER',
        avatar='https://placehold.co/200x200/4f46e5/ffffff?text=Supplier+4',
        phone='089944556677', location='Cimahi, Jawa Barat',
        description='Grosir kain kerudung harga kompetitif.',
        hashed_password=HASHED_PASSWORD
    ),
    User(
        id='s5', name='Pekalongan Batik & Silk', email='supplier5@example.com', role='SUPPLIER',
        avatar='https://placehold.co/200x200/4f46e5/ffffff?text=Supplier+5',
        phone='082122334455', location='Pekalongan, Jawa Tengah',
        description='Kain sutra dan corak etnik berkualitas tinggi.',
        hashed_password=HASHED_PASSWORD
    ),
    User(
        id='s6', name='Jakarta Textile Center', email='supplier6@example.com', role='SUPPLIER',
        avatar='https://placehold.co/200x200/4f46e5/ffffff?text=Supplier+6',
        phone='081388990011', location='Jakarta Pusat',
        description='Distributor kain import dan lokal terpercaya.',
        hashed_password=HASHED_PASSWORD
    ),
    User(
        id='s7', name='Yogya Kain Modern', email='supplier7@example.com', role='SUPPLIER',
        avatar='https://placehold.co/200x200/4f46e5/ffffff?text=Supplier+7',
        phone='087766554433', location='Yogyakarta',
        description='Kain modern dengan desain trendy dan eksklusif.',
        hashed_password=HASHED_PASSWORD
    ),
]

FABRICS = [
    # Supplier 1 - Mitra Tekstil Solo
    Fabric(id='f1', supplierId='s1', supplierName='Mitra Tekstil Solo', name='Voal Premium', type='Voal', color='Dusty Rose', pricePerUnit=25000, stock=120),
    Fabric(id='f2', supplierId='s1', supplierName='Mitra Tekstil Solo', name='Voal Ultrafine', type='Voal', color='Soft Sand', pricePerUnit=28000, stock=90),
    Fabric(id='f3', supplierId='s1', supplierName='Mitra Tekstil Solo', name='Voal Classic', type='Voal', color='Pearl White', pricePerUnit=24000, stock=150),
    Fabric(id='f4', supplierId='s1', supplierName='Mitra Tekstil Solo', name='Katun Jepang', type='Katun', color='Navy Blue', pricePerUnit=30000, stock=80),
    Fabric(id='f5', supplierId='s1', supplierName='Mitra Tekstil Solo', name='Katun Premium', type='Katun', color='Charcoal Gray', pricePerUnit=32000, stock=70),
    
    # Supplier 2 - Bandung Fabric Hub
    Fabric(id='f6', supplierId='s2', supplierName='Bandung Fabric Hub', name='Satin Silk', type='Silk', color='Champagne', pricePerUnit=35000, stock=85),
    Fabric(id='f7', supplierId='s2', supplierName='Bandung Fabric Hub', name='Armany Silk', type='Silk', color='Silver Gray', pricePerUnit=42000, stock=60),
    Fabric(id='f8', supplierId='s2', supplierName='Bandung Fabric Hub', name='Satin Glossy', type='Satin', color='Emerald Green', pricePerUnit=38000, stock=95),
    Fabric(id='f9', supplierId='s2', supplierName='Bandung Fabric Hub', name='Silk Matte', type='Silk', color='Burgundy', pricePerUnit=45000, stock=50),
    Fabric(id='f10', supplierId='s2', supplierName='Bandung Fabric Hub', name='Satin Premium', type='Satin', color='Rose Gold', pricePerUnit=40000, stock=75),
    
    # Supplier 3 - Surabaya Tekstil Utama
    Fabric(id='f11', supplierId='s3', supplierName='Surabaya Tekstil Utama', name='Jersey Ity', type='Jersey', color='Midnight Blue', pricePerUnit=18000, stock=200),
    Fabric(id='f12', supplierId='s3', supplierName='Surabaya Tekstil Utama', name='Jersey Super', type='Jersey', color='Deep Black', pricePerUnit=20000, stock=150),
    Fabric(id='f13', supplierId='s3', supplierName='Surabaya Tekstil Utama', name='Jersey Premium', type='Jersey', color='Maroon', pricePerUnit=22000, stock=180),
    Fabric(id='f14', supplierId='s3', supplierName='Surabaya Tekstil Utama', name='Spandex Rayon', type='Spandex', color='Forest Green', pricePerUnit=25000, stock=120),
    Fabric(id='f15', supplierId='s3', supplierName='Surabaya Tekstil Utama', name='Jersey Lycra', type='Jersey', color='Steel Gray', pricePerUnit=23000, stock=160),
    
    # Supplier 4 - Cigondewah Jaya
    Fabric(id='f16', supplierId='s4', supplierName='Cigondewah Jaya', name='Cerruti Baby Doll', type='Cerruti', color='Mauve', pricePerUnit=22000, stock=45),
    Fabric(id='f17', supplierId='s4', supplierName='Cigondewah Jaya', name='Chiffon Arab', type='Chiffon', color='Nude', pricePerUnit=15000, stock=300),
    Fabric(id='f18', supplierId='s4', supplierName='Cigondewah Jaya', name='Cerruti Premium', type='Cerruti', color='Lilac', pricePerUnit=24000, stock=65),
    Fabric(id='f19', supplierId='s4', supplierName='Cigondewah Jaya', name='Chiffon Ceruti', type='Chiffon', color='Peach', pricePerUnit=16000, stock=250),
    Fabric(id='f20', supplierId='s4', supplierName='Cigondewah Jaya', name='Cerruti Silk', type='Cerruti', color='Mint Green', pricePerUnit=26000, stock=55),
    
    # Supplier 5 - Pekalongan Batik & Silk
    Fabric(id='f21', supplierId='s5', supplierName='Pekalongan Batik & Silk', name='Sutra Satin Corak', type='Silk', color='Golden Flower', pricePerUnit=55000, stock=30),
    Fabric(id='f22', supplierId='s5', supplierName='Pekalongan Batik & Silk', name='Batik Sutra', type='Batik', color='Traditional Brown', pricePerUnit=48000, stock=40),
    Fabric(id='f23', supplierId='s5', supplierName='Pekalongan Batik & Silk', name='Silk Etnik', type='Silk', color='Royal Blue Pattern', pricePerUnit=52000, stock=35),
    Fabric(id='f24', supplierId='s5', supplierName='Pekalongan Batik & Silk', name='Batik Premium', type='Batik', color='Maroon Pattern', pricePerUnit=50000, stock=38),
    
    # Supplier 6 - Jakarta Textile Center
    Fabric(id='f25', supplierId='s6', supplierName='Jakarta Textile Center', name='Organza Premium', type='Organza', color='Crystal White', pricePerUnit=33000, stock=100),
    Fabric(id='f26', supplierId='s6', supplierName='Jakarta Textile Center', name='Tulle Soft', type='Tulle', color='Baby Pink', pricePerUnit=28000, stock=110),
    Fabric(id='f27', supplierId='s6', supplierName='Jakarta Textile Center', name='Organza Glitter', type='Organza', color='Silver Sparkle', pricePerUnit=35000, stock=90),
    Fabric(id='f28', supplierId='s6', supplierName='Jakarta Textile Center', name='Lace French', type='Lace', color='Ivory', pricePerUnit=45000, stock=60),
    Fabric(id='f29', supplierId='s6', supplierName='Jakarta Textile Center', name='Tulle Premium', type='Tulle', color='Lavender', pricePerUnit=30000, stock=105),
    
    # Supplier 7 - Yogya Kain Modern
    Fabric(id='f30', supplierId='s7', supplierName='Yogya Kain Modern', name='Wolfis Premium', type='Wolfis', color='Teal', pricePerUnit=27000, stock=130),
    Fabric(id='f31', supplierId='s7', supplierName='Yogya Kain Modern', name='Maxmara Lux', type='Maxmara', color='Caramel', pricePerUnit=34000, stock=85),
    Fabric(id='f32', supplierId='s7', supplierName='Yogya Kain Modern', name='Bella Square', type='Bella', color='Coral', pricePerUnit=29000, stock=95),
    Fabric(id='f33', supplierId='s7', supplierName='Yogya Kain Modern', name='Diamond Italiano', type='Diamond', color='Graphite', pricePerUnit=31000, stock=78),
    Fabric(id='f34', supplierId='s7', supplierName='Yogya Kain Modern', name='Wolfis Super', type='Wolfis', color='Olive', pricePerUnit=28000, stock=115),
]

HIJAB_PRODUCTS = [
    HijabProduct(id='h1', umkmId='u1', name='Segiempat Voal', color='Dusty Rose', stock=50, threshold=20, fabricId='f1'),
    HijabProduct(id='h2', umkmId='u1', name='Pashmina Silk', color='Champagne', stock=15, threshold=20, fabricId='f6'),
    HijabProduct(id='h3', umkmId='u1', name='Segiempat Jersey', color='Midnight Blue', stock=35, threshold=15, fabricId='f11'),
    HijabProduct(id='h4', umkmId='u1', name='Khimar Chiffon', color='Nude', stock=28, threshold=15, fabricId='f17'),
    HijabProduct(id='h5', umkmId='u1', name='Bergo Cerruti', color='Mauve', stock=12, threshold=10, fabricId='f16'),
    HijabProduct(id='h6', umkmId='u2', name='Pashmina Voal', color='Soft Sand', stock=40, threshold=15, fabricId='f2'),
    HijabProduct(id='h7', umkmId='u2', name='Segiempat Satin', color='Rose Gold', stock=22, threshold=12, fabricId='f10'),
    HijabProduct(id='h8', umkmId='u2', name='Bergo Jersey', color='Deep Black', stock=45, threshold=20, fabricId='f12'),
    HijabProduct(id='h9', umkmId='u3', name='Khimar Batik', color='Traditional Brown', stock=18, threshold=10, fabricId='f22'),
    HijabProduct(id='h10', umkmId='u3', name='Segiempat Organza', color='Crystal White', stock=25, threshold=12, fabricId='f25'),
]

REQUESTS = [
    FabricRequest(
        id='r1', umkmId='u1', umkmName='Zahra Hijab', supplierId='s1', supplierName='Mitra Tekstil Solo',
        fabricId='f1', fabricName='Voal Premium', fabricColor='Dusty Rose', quantity=10,
        status='APPROVED', timestamp=(datetime.now()).isoformat()
    ),
    FabricRequest(
        id='r2', umkmId='u1', umkmName='Zahra Hijab', supplierId='s2', supplierName='Bandung Fabric Hub',
        fabricId='f6', fabricName='Satin Silk', fabricColor='Champagne', quantity=15,
        status='COMPLETED', timestamp=(datetime.now()).isoformat()
    ),
    FabricRequest(
        id='r3', umkmId='u2', umkmName='Aisha Fashion', supplierId='s3', supplierName='Surabaya Tekstil Utama',
        fabricId='f11', fabricName='Jersey Ity', fabricColor='Midnight Blue', quantity=20,
        status='SHIPPED', timestamp=(datetime.now()).isoformat()
    ),
    FabricRequest(
        id='r4', umkmId='u2', umkmName='Aisha Fashion', supplierId='s4', supplierName='Cigondewah Jaya',
        fabricId='f17', fabricName='Chiffon Arab', fabricColor='Nude', quantity=25,
        status='WAITING_VERIFICATION', timestamp=(datetime.now()).isoformat()
    ),
    FabricRequest(
        id='r5', umkmId='u3', umkmName='Hijabku Store', supplierId='s5', supplierName='Pekalongan Batik & Silk',
        fabricId='f22', fabricName='Batik Sutra', fabricColor='Traditional Brown', quantity=8,
        status='PENDING', timestamp=(datetime.now()).isoformat()
    ),
]

SALES: List[HijabSale] = []
USAGE_HISTORY: List[UsageLog] = []

# ===== API Endpoints =====

@app.get("/")
def read_root():
    """Root endpoint - API information"""
    return {
        "message": "Supply Chain Dashboard API - Secure", 
        "version": "2.0.0",
        "security": "JWT-based authentication with RBAC"
    }


@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}


@app.post("/api/auth/login", response_model=Dict)
@limiter.limit("5/minute")
async def login(request: Request, login_data: LoginRequest):
    """
    Secure login endpoint with JWT tokens.
    Rate limited to 5 attempts per minute.
    """
    try:
        # Find user by email
        user = next((u for u in USERS if u.email.lower() == login_data.email.lower()), None)
        
        if not user:
            AuditLogger.log_authentication("unknown", login_data.email, False, request.client.host)
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        # Verify password
        if not PasswordHash.verify_password(login_data.password, user.hashed_password):
            AuditLogger.log_authentication(user.id, user.email, False, request.client.host)
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        # Create tokens
        token_data = {
            "user_id": user.id,
            "email": user.email,
            "role": user.role
        }
        
        access_token = JWTHandler.create_access_token(token_data)
        refresh_token = JWTHandler.create_refresh_token(token_data)
        
        AuditLogger.log_authentication(user.id, user.email, True, request.client.host)
        
        # Return tokens and user info (without sensitive data)
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "user": UserResponse(
                id=user.id,
                name=user.name,
                email=user.email,
                role=user.role,
                avatar=user.avatar,
                phone=user.phone,
                location=user.location,
                description=user.description
            ).dict()
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error during login"
        )


@app.post("/api/auth/refresh", response_model=Token)
@limiter.limit("10/minute")
async def refresh_token(request: Request, refresh_data: RefreshTokenRequest):
    """
    Refresh access token using refresh token.
    Rate limited to 10 attempts per minute.
    """
    try:
        # Decode refresh token
        token_data = JWTHandler.decode_token(refresh_data.refresh_token)
        
        # Create new access token
        new_token_data = {
            "user_id": token_data.user_id,
            "email": token_data.email,
            "role": token_data.role
        }
        
        access_token = JWTHandler.create_access_token(new_token_data)
        new_refresh_token = JWTHandler.create_refresh_token(new_token_data)
        
        return Token(
            access_token=access_token,
            refresh_token=new_refresh_token,
            token_type="bearer"
        )
    
    except Exception as e:
        logger.error(f"Token refresh error: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )


@app.get("/api/auth/me", response_model=UserResponse)
async def get_current_user_info(current_user: TokenData = Depends(AuthMiddleware.get_current_active_user)):
    """Get current authenticated user information"""
    user = next((u for u in USERS if u.id == current_user.user_id), None)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return UserResponse(
        id=user.id,
        name=user.name,
        email=user.email,
        role=user.role,
        avatar=user.avatar,
        phone=user.phone,
        location=user.location,
        description=user.description
    )


@app.get("/api/fabrics", response_model=List[Fabric])
async def get_fabrics(current_user: TokenData = Depends(AuthMiddleware.get_current_active_user)):
    """Get all fabrics from all suppliers (authenticated users only)"""
    return FABRICS

@app.post("/api/fabrics")
async def add_fabric(
    fabric: Fabric, 
    current_user: TokenData = Depends(AuthMiddleware.get_current_active_user)
):
    """Add a new fabric to the catalog (SUPPLIER role only)"""
    if current_user.role != "SUPPLIER":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only suppliers can add fabrics"
        )
    
    # Verify the supplier is adding their own fabric
    if fabric.supplierId != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only add fabrics for your own account"
        )
    
    # Sanitize inputs
    fabric.name = InputSanitizer.sanitize_string(fabric.name, 100)
    fabric.type = InputSanitizer.sanitize_string(fabric.type, 50)
    fabric.color = InputSanitizer.sanitize_string(fabric.color, 50)
    
    FABRICS.append(fabric)
    AuditLogger.log_sensitive_operation(current_user.user_id, "ADD_FABRIC", fabric.id)
    
    return {"message": "Fabric added successfully", "fabric": fabric}

@app.get("/api/fabrics/{fabric_id}", response_model=Fabric)
async def get_fabric(
    fabric_id: str,
    current_user: TokenData = Depends(AuthMiddleware.get_current_active_user)
):
    """Get a specific fabric by ID (authenticated users only)"""
    fabric = next((f for f in FABRICS if f.id == fabric_id), None)
    if not fabric:
        raise HTTPException(status_code=404, detail="Fabric not found")
    return fabric

@app.patch("/api/fabrics/{fabric_id}")
async def update_fabric(
    fabric_id: str, 
    update: FabricUpdate,
    current_user: TokenData = Depends(AuthMiddleware.get_current_active_user)
):
    """Update fabric stock or price (SUPPLIER role only, own fabrics only)"""
    if current_user.role != "SUPPLIER":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only suppliers can update fabrics"
        )
    
    fabric = next((f for f in FABRICS if f.id == fabric_id), None)
    if not fabric:
        raise HTTPException(status_code=404, detail="Fabric not found")
    
    # Verify the supplier owns this fabric
    if fabric.supplierId != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update your own fabrics"
        )
    
    if update.stock is not None:
        fabric.stock = update.stock
    if update.pricePerUnit is not None:
        fabric.pricePerUnit = update.pricePerUnit
    
    AuditLogger.log_sensitive_operation(current_user.user_id, "UPDATE_FABRIC", fabric_id)
    
    return {"message": "Fabric updated successfully", "fabric": fabric}


@app.get("/api/requests", response_model=List[FabricRequest])
async def get_requests(current_user: TokenData = Depends(AuthMiddleware.get_current_active_user)):
    """Get all fabric requests (filtered by user role)"""
    if current_user.role == "UMKM":
        # UMKM users see only their own requests
        return [r for r in REQUESTS if r.umkmId == current_user.user_id]
    elif current_user.role == "SUPPLIER":
        # Suppliers see requests for their fabrics
        return [r for r in REQUESTS if r.supplierId == current_user.user_id]
    return []

@app.post("/api/requests")
async def create_request(
    request: FabricRequest,
    current_user: TokenData = Depends(AuthMiddleware.get_current_active_user)
):
    """Create a new fabric request (UMKM role only)"""
    if current_user.role != "UMKM":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only UMKM users can create fabric requests"
        )
    
    # Verify the UMKM is creating request for themselves
    if request.umkmId != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only create requests for your own account"
        )
    
    # Sanitize inputs
    request.umkmName = InputSanitizer.sanitize_string(request.umkmName, 100)
    request.supplierName = InputSanitizer.sanitize_string(request.supplierName, 100)
    request.fabricName = InputSanitizer.sanitize_string(request.fabricName, 100)
    request.fabricColor = InputSanitizer.sanitize_string(request.fabricColor, 50)
    if request.notes:
        request.notes = InputSanitizer.sanitize_string(request.notes, 1000)
    
    REQUESTS.append(request)
    AuditLogger.log_sensitive_operation(current_user.user_id, "CREATE_REQUEST", request.id)
    
    return {"message": "Request created successfully", "request": request}

@app.patch("/api/requests/{request_id}/status")
async def update_request_status(
    request_id: str, 
    update: RequestStatusUpdate,
    current_user: TokenData = Depends(AuthMiddleware.get_current_active_user)
):
    """Update request status (role-based permissions)"""
    request = next((r for r in REQUESTS if r.id == request_id), None)
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")
    
    # Permission checks based on role and status
    if current_user.role == "SUPPLIER":
        # Suppliers can approve, reject, or mark as shipped
        if update.status not in ["APPROVED", "REJECTED", "SHIPPED"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Suppliers can only approve, reject, or ship requests"
            )
        # Verify the supplier owns this request
        if request.supplierId != current_user.user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only update requests for your fabrics"
            )
    
    elif current_user.role == "UMKM":
        # UMKM can only mark as completed or cancelled
        if update.status not in ["COMPLETED", "CANCELLED"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="UMKM can only complete or cancel requests"
            )
        # Verify the UMKM owns this request
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


@app.get("/api/hijab-products", response_model=List[HijabProduct])
async def get_hijab_products(current_user: TokenData = Depends(AuthMiddleware.get_current_active_user)):
    """Get hijab products (UMKM sees own, SUPPLIER sees all)"""
    if current_user.role == "UMKM":
        return [p for p in HIJAB_PRODUCTS if p.umkmId == current_user.user_id]
    return HIJAB_PRODUCTS

@app.post("/api/hijab-products")
async def create_or_update_hijab_product(
    product: HijabProduct,
    current_user: TokenData = Depends(AuthMiddleware.get_current_active_user)
):
    """Create or update hijab product (UMKM role only)"""
    if current_user.role != "UMKM":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only UMKM users can manage hijab products"
        )
    
    # Verify ownership
    if product.umkmId != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only manage your own products"
        )
    
    # Sanitize inputs
    product.name = InputSanitizer.sanitize_string(product.name, 100)
    product.color = InputSanitizer.sanitize_string(product.color, 50)
    
    existing = next((p for p in HIJAB_PRODUCTS if p.id == product.id), None)
    if existing:
        idx = HIJAB_PRODUCTS.index(existing)
        HIJAB_PRODUCTS[idx] = product
        AuditLogger.log_sensitive_operation(current_user.user_id, "UPDATE_PRODUCT", product.id)
        return {"message": "Product updated successfully", "product": product}
    else:
        HIJAB_PRODUCTS.append(product)
        AuditLogger.log_sensitive_operation(current_user.user_id, "CREATE_PRODUCT", product.id)
        return {"message": "Product created successfully", "product": product}

@app.get("/api/sales", response_model=List[HijabSale])
async def get_sales(current_user: TokenData = Depends(AuthMiddleware.get_current_active_user)):
    """Get hijab sales (UMKM role only)"""
    if current_user.role != "UMKM":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only UMKM users can view sales"
        )
    return SALES

@app.post("/api/sales")
async def record_sale(
    sale: HijabSale,
    current_user: TokenData = Depends(AuthMiddleware.get_current_active_user)
):
    """Record a new hijab sale (UMKM role only)"""
    if current_user.role != "UMKM":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only UMKM users can record sales"
        )
    
    # Sanitize inputs
    sale.productName = InputSanitizer.sanitize_string(sale.productName, 100)
    sale.trackingNumber = InputSanitizer.sanitize_string(sale.trackingNumber, 100)
    
    SALES.insert(0, sale)
    AuditLogger.log_sensitive_operation(current_user.user_id, "RECORD_SALE", sale.id)
    
    return {"message": "Sale recorded successfully", "sale": sale}

@app.get("/api/usage-history", response_model=List[UsageLog])
async def get_usage_history(current_user: TokenData = Depends(AuthMiddleware.get_current_active_user)):
    """Get fabric usage history (UMKM role only)"""
    if current_user.role != "UMKM":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only UMKM users can view usage history"
        )
    return USAGE_HISTORY

@app.post("/api/usage-history")
async def record_usage(
    log: UsageLog,
    current_user: TokenData = Depends(AuthMiddleware.get_current_active_user)
):
    """Record fabric usage (UMKM role only)"""
    if current_user.role != "UMKM":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only UMKM users can record usage"
        )
    
    # Sanitize inputs
    log.productName = InputSanitizer.sanitize_string(log.productName, 100)
    log.fabricName = InputSanitizer.sanitize_string(log.fabricName, 100)
    
    USAGE_HISTORY.insert(0, log)
    AuditLogger.log_sensitive_operation(current_user.user_id, "RECORD_USAGE", log.id)
    
    return {"message": "Usage recorded successfully", "log": log}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
