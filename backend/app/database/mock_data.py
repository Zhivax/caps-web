"""
In-memory database module
Holds mock data for development/testing
"""
from typing import List
from datetime import datetime
from app.models import (
    User, Fabric, HijabProduct, HijabSale, 
    FabricRequest, UsageLog, UMKMFabric
)


# Default password for all demo users: "password123"
# Using a pre-computed hash to ensure consistency across app restarts
# Generated with: PasswordHash.hash_password("password123")
HASHED_PASSWORD = "$2b$12$hhNT/r20c8CSgQ.aLC0ND.WnFozO1kp81pvEk6iiHvpJXtgluPpFW"


def get_users() -> List[User]:
    """Get all users"""
    return USERS


def get_fabrics() -> List[Fabric]:
    """Get all fabrics"""
    return FABRICS


def get_hijab_products() -> List[HijabProduct]:
    """Get all hijab products"""
    return HIJAB_PRODUCTS


def get_requests() -> List[FabricRequest]:
    """Get all fabric requests"""
    return REQUESTS


def get_sales() -> List[HijabSale]:
    """Get all sales"""
    return SALES


def get_usage_history() -> List[UsageLog]:
    """Get all usage history"""
    return USAGE_HISTORY


def get_umkm_fabrics() -> List[UMKMFabric]:
    """Get UMKM fabric storage"""
    return UMKM_FABRICS


# Initialize mock data
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
        status='APPROVED', timestamp=datetime.now().isoformat()
    ),
    FabricRequest(
        id='r2', umkmId='u1', umkmName='Zahra Hijab', supplierId='s2', supplierName='Bandung Fabric Hub',
        fabricId='f6', fabricName='Satin Silk', fabricColor='Champagne', quantity=15,
        status='COMPLETED', timestamp=datetime.now().isoformat()
    ),
    FabricRequest(
        id='r3', umkmId='u2', umkmName='Aisha Fashion', supplierId='s3', supplierName='Surabaya Tekstil Utama',
        fabricId='f11', fabricName='Jersey Ity', fabricColor='Midnight Blue', quantity=20,
        status='SHIPPED', timestamp=datetime.now().isoformat()
    ),
    FabricRequest(
        id='r4', umkmId='u2', umkmName='Aisha Fashion', supplierId='s4', supplierName='Cigondewah Jaya',
        fabricId='f17', fabricName='Chiffon Arab', fabricColor='Nude', quantity=25,
        status='WAITING_VERIFICATION', timestamp=datetime.now().isoformat()
    ),
    FabricRequest(
        id='r5', umkmId='u3', umkmName='Hijabku Store', supplierId='s5', supplierName='Pekalongan Batik & Silk',
        fabricId='f22', fabricName='Batik Sutra', fabricColor='Traditional Brown', quantity=8,
        status='PENDING', timestamp=datetime.now().isoformat()
    ),
]

SALES: List[HijabSale] = []
USAGE_HISTORY: List[UsageLog] = []
UMKM_FABRICS: List[UMKMFabric] = []
