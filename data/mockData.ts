

import { User, UserRole, Fabric, HijabProduct, FabricRequest, RequestStatus } from '../types';

export const USERS: User[] = [
  { 
    id: 'u1', 
    name: 'Zahra Hijab', 
    email: 'umkm@example.com', 
    role: UserRole.UMKM, 
    avatar: 'https://placehold.co/200x200/6366f1/ffffff?text=UMKM' 
  },
  { 
    id: 's1', 
    name: 'Mitra Tekstil Solo', 
    email: 'supplier@example.com', 
    role: UserRole.SUPPLIER, 
    avatar: 'https://placehold.co/200x200/4f46e5/ffffff?text=Supplier+1',
    phone: '082232316323',
    location: 'Solo, Jawa Tengah',
    description: 'Spesialis kain voal dan katun premium sejak 2010.'
  },
  { 
    id: 's2', 
    name: 'Bandung Fabric Hub', 
    email: 'supplier2@example.com', 
    role: UserRole.SUPPLIER, 
    avatar: 'https://placehold.co/200x200/4f46e5/ffffff?text=Supplier+2',
    phone: '081299887766',
    location: 'Bandung, Jawa Barat',
    description: 'Pusat kain silk dan satin kualitas ekspor.'
  },
  { 
    id: 's3', 
    name: 'Surabaya Tekstil Utama', 
    email: 'supplier3@example.com', 
    role: UserRole.SUPPLIER, 
    avatar: 'https://placehold.co/200x200/4f46e5/ffffff?text=Supplier+3',
    phone: '085711223344',
    location: 'Surabaya, Jawa Timur',
    description: 'Penyedia kain jersey dan spandex terlengkap.'
  },
  { 
    id: 's4', 
    name: 'Cigondewah Jaya', 
    email: 'supplier4@example.com', 
    role: UserRole.SUPPLIER, 
    avatar: 'https://placehold.co/200x200/4f46e5/ffffff?text=Supplier+4',
    phone: '089944556677',
    location: 'Cimahi, Jawa Barat',
    description: 'Grosir kain kerudung harga kompetitif.'
  },
  { 
    id: 's5', 
    name: 'Pekalongan Batik & Silk', 
    email: 'supplier5@example.com', 
    role: UserRole.SUPPLIER, 
    avatar: 'https://placehold.co/200x200/4f46e5/ffffff?text=Supplier+5',
    phone: '082122334455',
    location: 'Pekalongan, Jawa Tengah',
    description: 'Kain sutra dan corak etnik berkualitas tinggi.'
  }
];

export const INITIAL_FABRICS: Fabric[] = [
  { id: 'f1', supplierId: 's1', supplierName: 'Mitra Tekstil Solo', name: 'Voal Premium', type: 'Voal', color: 'Dusty Rose', pricePerUnit: 25000, stock: 120 },
  { id: 'f2', supplierId: 's1', supplierName: 'Mitra Tekstil Solo', name: 'Voal Ultrafine', type: 'Voal', color: 'Soft Sand', pricePerUnit: 28000, stock: 90 },
  { id: 'f3', supplierId: 's2', supplierName: 'Bandung Fabric Hub', name: 'Satin Silk', type: 'Silk', color: 'Champagne', pricePerUnit: 35000, stock: 85 },
  { id: 'f4', supplierId: 's2', supplierName: 'Bandung Fabric Hub', name: 'Armany Silk', type: 'Silk', color: 'Silver Gray', pricePerUnit: 42000, stock: 60 },
  { id: 'f5', supplierId: 's3', supplierName: 'Surabaya Tekstil Utama', name: 'Jersey Ity', type: 'Jersey', color: 'Midnight Blue', pricePerUnit: 18000, stock: 200 },
  { id: 'f6', supplierId: 's3', supplierName: 'Surabaya Tekstil Utama', name: 'Jersey Super', type: 'Jersey', color: 'Deep Black', pricePerUnit: 20000, stock: 150 },
  { id: 'f7', supplierId: 's4', supplierName: 'Cigondewah Jaya', name: 'Cerruti Baby Doll', type: 'Cerruti', color: 'Mauve', pricePerUnit: 22000, stock: 45 },
  { id: 'f8', supplierId: 's4', supplierName: 'Cigondewah Jaya', name: 'Chiffon Arab', type: 'Chiffon', color: 'Nude', pricePerUnit: 15000, stock: 300 },
  { id: 'f9', supplierId: 's5', supplierName: 'Pekalongan Batik & Silk', name: 'Sutra Satin Corak', type: 'Silk', color: 'Golden Flower', pricePerUnit: 55000, stock: 30 }
];

export const INITIAL_HIJAB_STOCK: HijabProduct[] = [
  { id: 'h1', umkmId: 'u1', name: 'Segiempat Voal', color: 'Dusty Rose', stock: 50, threshold: 20, fabricId: 'f1' },
  { id: 'h2', umkmId: 'u1', name: 'Pashmina Silk', color: 'Champagne', stock: 15, threshold: 20, fabricId: 'f2' }
];

export const INITIAL_REQUESTS: FabricRequest[] = [
  { 
    id: 'r1', 
    umkmId: 'u1', 
    umkmName: 'Zahra Hijab', 
    supplierId: 's1', 
    /* Added supplierName to match the updated FabricRequest interface */
    supplierName: 'Mitra Tekstil Solo',
    fabricId: 'f1', 
    fabricName: 'Voal Premium', 
    fabricColor: 'Dusty Rose',
    quantity: 10, 
    status: RequestStatus.APPROVED, 
    timestamp: new Date(Date.now() - 86400000).toISOString() 
  }
];