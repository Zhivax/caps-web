# 📚 QUICK REFERENCE - CAPS Supply Chain Dashboard

> **Panduan Cepat untuk Memahami Fungsi-fungsi Web Aplikasi**

## 📖 Dokumentasi Lengkap

**Lihat:** [FUNCTION_DOCUMENTATION.md](./FUNCTION_DOCUMENTATION.md) untuk penjelasan lengkap semua fungsi.

---

## 🎯 Apa itu CAPS Supply Chain Dashboard?

Aplikasi web B2B untuk menghubungkan **UMKM produsen hijab** dengan **supplier kain**, memfasilitasi:
- 🛒 Pemesanan bahan baku
- 📦 Manajemen inventori
- 🏭 Tracking produksi
- 💰 Pencatatan penjualan
- 🔔 Notifikasi real-time

---

## 👥 2 Role Utama

### 🏢 UMKM (Produsen Hijab)
- Browse & order kain dari katalog supplier
- Manage raw materials (bahan baku)
- Produksi hijab dari bahan baku
- Record penjualan
- Track order status

### 🏭 SUPPLIER (Penyedia Kain)
- Kelola katalog produk kain
- Terima & proses pesanan dari UMKM
- Verifikasi pembayaran
- Update status pengiriman
- Monitor inventory

---

## 🗂️ Struktur Aplikasi

```
caps-web/
├── App.tsx                     # Main app dengan routing
├── index.tsx                   # Entry point
├── types.ts                    # TypeScript interfaces
│
├── context/
│   └── AppContext.tsx          # State management global
│
├── services/
│   └── api.ts                  # API service (LocalStorage)
│
├── data/
│   └── mockData.ts             # Initial data
│
├── components/
│   ├── Layout.tsx              # Layout dengan sidebar & header
│   ├── ViewportAware.tsx       # Lazy loading optimization
│   ├── LoadingScreen.tsx       # Loading state
│   └── charts/
│       └── InventoryChart.tsx  # Chart visualization
│
└── pages/
    ├── Login.tsx               # Authentication
    ├── Dashboard.tsx           # Dashboard (UMKM & Supplier)
    ├── History.tsx             # Order history
    ├── Settings.tsx            # Settings
    │
    ├── umkm/                   # Halaman khusus UMKM
    │   ├── FabricCatalog.tsx
    │   ├── SupplierDirectory.tsx
    │   ├── HijabInventory.tsx
    │   ├── RawMaterials.tsx
    │   ├── UsageHistory.tsx
    │   └── Sales.tsx
    │
    └── supplier/               # Halaman khusus Supplier
        ├── InventoryList.tsx
        ├── AddFabric.tsx
        └── Requests.tsx
```

---

## 🔄 Flow Utama

### 1️⃣ Order Flow (UMKM → Supplier)
```
Browse Catalog → Create Order → Upload Payment Proof 
→ Supplier Verify → Ship → UMKM Receive → Materials In
```

### 2️⃣ Production Flow (UMKM)
```
Check Raw Materials → Select Fabric → Input Quantity 
→ Validate Stock → Produce → Update Inventory → Log Usage
```

### 3️⃣ Sales Flow (UMKM)
```
Select Product → Input Quantity → Add Tracking Number 
→ Validate Stock → Record Sale → Update Inventory
```

---

## 🛠️ Fungsi-fungsi Utama

### AppContext Functions

| Fungsi | Deskripsi | User |
|--------|-----------|------|
| `login()` | Login user | All |
| `logout()` | Logout user | All |
| `addFabric()` | Tambah kain baru | Supplier |
| `updateFabric()` | Update stok/harga kain | Supplier |
| `submitRequest()` | Buat pesanan kain | UMKM |
| `uploadPaymentProof()` | Upload bukti bayar | UMKM |
| `updateRequestStatus()` | Update status pesanan | Both |
| `produceExistingHijab()` | Produksi hijab existing | UMKM |
| `addHijabProduct()` | Tambah & produksi hijab baru | UMKM |
| `recordSale()` | Catat penjualan | UMKM |
| `markNotificationsAsRead()` | Mark notifikasi dibaca | Both |

---

## 📊 Data Models

### Core Models:
- **User** - Data user (UMKM/Supplier)
- **Fabric** - Data kain dari supplier
- **HijabProduct** - Produk hijab UMKM
- **FabricRequest** - Pesanan kain
- **HijabSale** - Penjualan hijab
- **UsageLog** - Log penggunaan bahan
- **AppNotification** - Notifikasi

---

## 🎨 Tech Stack

- ⚛️ **React 19** + **TypeScript**
- ⚡ **Vite** (build tool)
- 🎨 **Tailwind CSS** (styling)
- 📊 **Recharts** (charts)
- 🤖 **Gemini AI** (AI integration)
- 🗂️ **LocalStorage** (data persistence)
- 🎯 **Context API** (state management)

---

## 🚀 Quick Start

```bash
# Install
npm install

# Setup env
cp .env.example .env.local

# Run dev
npm run dev

# Build
npm run build
```

---

## 🔑 Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| UMKM | `umkm@example.com` | `password` |
| Supplier | `supplier@example.com` | `password` |

---

## 📝 Status Pesanan

| Status | Deskripsi |
|--------|-----------|
| `PENDING` | Pesanan baru, belum bayar |
| `WAITING_VERIFICATION` | Bukti bayar uploaded |
| `APPROVED` | Pembayaran verified |
| `SHIPPED` | Barang dikirim |
| `COMPLETED` | Barang diterima |
| `REJECTED` | Pembayaran ditolak |
| `CANCELLED` | Pesanan dibatalkan |

---

## 🔔 Jenis Notifikasi

### UMKM:
- ✅ Payment Verified
- ❌ Payment Rejected
- 📦 Materials Received
- ⚠️ Order Disruption

### Supplier:
- 🛒 New Material Order
- 💰 Payment Proof Uploaded

---

## 📈 Features Highlights

### UMKM Features:
- ✅ Browse 9+ fabric types dari 5 suppliers
- ✅ Real-time order tracking
- ✅ Production management (1.5m fabric per hijab)
- ✅ Sales recording dengan tracking number
- ✅ Low stock alerts
- ✅ Usage history analytics

### Supplier Features:
- ✅ Catalog management
- ✅ Payment verification system
- ✅ Auto stock update on approval
- ✅ Shipment tracking
- ✅ Multi-UMKM support
- ✅ Inventory analytics

---

## 🎯 Performance Optimizations

- ⚡ **Lazy Loading** - Code splitting per page
- 🧠 **Memoization** - useMemo & memo untuk expensive computations
- 👀 **ViewportAware** - Render only visible components
- 🔄 **React Transitions** - Smooth page transitions
- 📦 **Bundle Optimization** - Tree shaking & minification

---

## 📱 Responsive Design

- 📱 Mobile-first approach
- 🍔 Hamburger menu for mobile
- 📐 Grid layouts with breakpoints
- 👆 Touch-friendly button sizes
- 🎨 Adaptive spacing & typography

---

## 🔗 Links

- 📖 [Full Documentation](./FUNCTION_DOCUMENTATION.md)
- 📦 [Deployment Guide](./DEPLOYMENT.md)
- ✅ [Pre-Deployment Checklist](./PRE_DEPLOYMENT_CHECKLIST.md)
- 📚 [README](./README.md)

---

**Need Help?** Baca dokumentasi lengkap di [FUNCTION_DOCUMENTATION.md](./FUNCTION_DOCUMENTATION.md)

**Version:** 1.0.0  
**Last Updated:** December 2024
