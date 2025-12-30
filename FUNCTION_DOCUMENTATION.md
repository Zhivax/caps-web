# DOKUMENTASI FUNGSI APLIKASI CAPS SUPPLY CHAIN DASHBOARD

## 📋 RINGKASAN APLIKASI

**CAPS Supply Chain Dashboard** adalah aplikasi web B2B (Business-to-Business) untuk integrasi supply chain antara **UMKM produsen hijab** dan **supplier kain**. Aplikasi ini memfasilitasi pemesanan bahan baku, manajemen inventori, produksi, dan penjualan secara real-time.

### Teknologi yang Digunakan:
- **Frontend Framework**: React 19 dengan TypeScript
- **Build Tool**: Vite
- **UI Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Charts**: Recharts
- **AI Integration**: Google Gemini AI (@google/genai)
- **State Management**: React Context API
- **Data Storage**: Local Storage (simulasi database)

---

## 👥 ROLE PENGGUNA

Aplikasi ini memiliki 2 role utama:

### 1. **UMKM (Usaha Mikro Kecil Menengah)**
   - Produsen hijab yang membutuhkan bahan kain
   - Dapat memesan kain dari supplier
   - Mengelola produksi dan stok hijab
   - Mencatat penjualan

### 2. **SUPPLIER**
   - Penyedia kain/bahan baku
   - Mengelola inventori kain
   - Memproses pesanan dari UMKM
   - Verifikasi pembayaran

---

## 🔐 SISTEM AUTENTIKASI

### File: `pages/Login.tsx`

**Fungsi Utama:**
- Login menggunakan email
- Autentikasi role-based (UMKM atau Supplier)
- Menyimpan session user di localStorage

**Demo Credentials:**
- **UMKM**: `umkm@example.com`
- **Supplier**: `supplier@example.com`

**Fungsi Login:**
```typescript
login(email: string): Promise<boolean>
```
- Mencari user berdasarkan email
- Menyimpan data user ke state dan localStorage
- Return `true` jika berhasil, `false` jika gagal

---

## 🏗️ ARSITEKTUR APLIKASI

### 1. **Context Management** (`context/AppContext.tsx`)

**AppContext** adalah state management global yang menyimpan:
- User yang sedang login
- Daftar kain/fabric dari semua supplier
- Request pemesanan
- Produk hijab
- Bahan baku UMKM (umkmFabrics)
- Riwayat penjualan (hijabSales)
- Notifikasi
- Riwayat penggunaan bahan (usageHistory)
- Status loading

**Fungsi-fungsi Utama dalam AppContext:**

#### a. **User Management**
```typescript
login(email: string): Promise<boolean>
logout(): void
```
- Login/logout user
- Menyimpan/menghapus data user dari localStorage

#### b. **Fabric Management (Supplier)**
```typescript
addFabric(fabric: Omit<Fabric, 'id' | 'supplierId' | 'supplierName'>): Promise<void>
updateFabric(fabricId: string, updates: Partial<Fabric>): Promise<void>
```
- Supplier dapat menambah kain baru ke katalog
- Update stok dan harga kain

#### c. **Request Management (UMKM → Supplier)**
```typescript
submitRequest(request: Omit<FabricRequest, 'id' | 'status' | 'timestamp' | 'umkmName'>): Promise<void>
```
- UMKM membuat pesanan kain ke supplier
- Status awal: `PENDING`
- Mengirim notifikasi ke supplier

```typescript
uploadPaymentProof(requestId: string, proofBase64: string): Promise<void>
```
- UMKM upload bukti transfer pembayaran
- Status berubah ke `WAITING_VERIFICATION`
- Notifikasi ke supplier untuk verifikasi

```typescript
updateRequestStatus(requestId: string, status: RequestStatus): Promise<void>
```
- Supplier/UMKM mengubah status pesanan
- **Status flow**:
  1. `PENDING` - Pesanan baru dibuat
  2. `WAITING_VERIFICATION` - Bukti pembayaran sudah diupload
  3. `APPROVED` - Pembayaran terverifikasi, stok dikurangi
  4. `SHIPPED` - Barang sedang dikirim
  5. `COMPLETED` - Barang diterima UMKM, masuk ke inventori
  6. `REJECTED` - Pembayaran ditolak
  7. `CANCELLED` - Pesanan dibatalkan

#### d. **Production Management (UMKM)**
```typescript
produceExistingHijab(productId: string, quantity: number, fabricUsed: number): Promise<void>
```
- Memproduksi hijab yang sudah ada
- Mengurangi stok bahan baku
- Menambah stok produk jadi
- Mencatat ke usage history

```typescript
addHijabProduct(product: Omit<HijabProduct, 'id' | 'umkmId'>, fabricUsed: number): Promise<void>
```
- Menambah produk hijab baru sekaligus memproduksi
- Mengurangi bahan baku
- Mencatat penggunaan bahan

#### e. **Sales Management (UMKM)**
```typescript
recordSale(sale: Omit<HijabSale, 'id' | 'timestamp'>): Promise<void>
```
- Mencatat penjualan hijab
- Mengurangi stok produk jadi
- Menyimpan tracking number pengiriman

#### f. **Notification Management**
```typescript
markNotificationsAsRead(): void
```
- Menandai semua notifikasi sebagai sudah dibaca

---

## 📊 DATA MODELS

### File: `types.ts`

#### 1. **User**
```typescript
interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole; // UMKM | SUPPLIER
  avatar?: string;
  phone?: string;
  location?: string;
  description?: string;
}
```

#### 2. **Fabric (Kain)**
```typescript
interface Fabric {
  id: string;
  supplierId: string;
  supplierName: string;
  name: string;          // Nama kain (e.g., "Voal Premium")
  type: string;          // Jenis (e.g., "Voal", "Silk")
  color: string;         // Warna
  pricePerUnit: number;  // Harga per meter
  stock: number;         // Stok dalam meter
}
```

#### 3. **HijabProduct (Produk Hijab)**
```typescript
interface HijabProduct {
  id: string;
  umkmId: string;
  name: string;          // Nama produk hijab
  color: string;
  stock: number;         // Stok produk jadi
  threshold: number;     // Threshold untuk low stock alert
  fabricId: string;      // ID kain yang digunakan
}
```

#### 4. **FabricRequest (Pesanan)**
```typescript
interface FabricRequest {
  id: string;
  umkmId: string;
  umkmName: string;
  supplierId: string;
  supplierName: string;
  fabricId: string;
  fabricName: string;
  fabricColor: string;
  quantity: number;              // Jumlah dalam meter
  status: RequestStatus;
  timestamp: string;
  notes?: string;
  paymentProof?: string;         // Base64 image string
}
```

#### 5. **HijabSale (Penjualan)**
```typescript
interface HijabSale {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  trackingNumber: string;        // Nomor resi pengiriman
  date: string;
  timestamp: string;
}
```

#### 6. **UsageLog (Riwayat Penggunaan Bahan)**
```typescript
interface UsageLog {
  id: string;
  productId: string;
  productName: string;
  fabricId: string;
  fabricName: string;
  fabricUsed: number;            // Bahan yang digunakan (meter)
  quantityProduced: number;      // Jumlah hijab yang diproduksi
  timestamp: string;
}
```

#### 7. **AppNotification**
```typescript
interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  timestamp: string;
  link?: string;
}
```

---

## 🎨 KOMPONEN UI

### 1. **Layout Component** (`components/Layout.tsx`)

**Fungsi:**
- Layout utama aplikasi dengan sidebar dan header
- Navigasi berbeda untuk UMKM dan Supplier
- Notification center dengan real-time updates
- User profile display
- Responsive design (mobile & desktop)

**Fitur Sidebar:**

**UMKM Menu:**
- Dashboard
- Fabric Supplier
  - Fabric Catalog
  - Supplier Directory
- Production & Stock
  - Hijab Inventory
  - Raw Materials
  - Usage History
- Sales Management
- Order History
- Settings

**Supplier Menu:**
- Supplier Dashboard
- Fabric Management
  - My Inventory
  - Add New Fabric
- Incoming Orders
- History
- Settings

**Notification System:**
- Bell icon dengan badge unread count
- Dropdown panel dengan daftar notifikasi
- Auto mark as read saat dibuka
- Icon berbeda berdasarkan tipe (success, error, warning, info)

### 2. **ViewportAware Component** (`components/ViewportAware.tsx`)

**Fungsi:**
- Lazy loading untuk komponen yang belum terlihat di viewport
- Optimasi performa dengan menunda render komponen berat
- Menampilkan placeholder dengan tinggi yang ditentukan

### 3. **LoadingScreen Component** (`components/LoadingScreen.tsx`)

**Fungsi:**
- Menampilkan loading state saat data sedang diambil
- Animasi loading yang smooth

---

## 📑 FITUR-FITUR UTAMA

## 🏢 FITUR UNTUK UMKM

### 1. **Dashboard** (`pages/Dashboard.tsx`)

**Fungsi:**
- Overview bisnis dengan statistik real-time
- **Metrics yang ditampilkan:**
  - Total Hijab Stock (total stok semua produk)
  - Active Suppliers (jumlah supplier aktif)
  - Active Requests (pesanan yang sedang pending)
  - Low Stock Items (produk di bawah threshold)
- **Visualisasi:**
  - Chart perbandingan stok vs threshold
  - Status katalog kain dari supplier partner
- **Trend indicators:** menampilkan perubahan persentase

### 2. **Fabric Catalog** (`pages/umkm/FabricCatalog.tsx`)

**Fungsi:**
- Browse katalog kain dari semua supplier
- **Fitur Search & Filter:**
  - Search by nama kain
  - Filter by tipe kain (Voal, Silk, Jersey, dll)
  - Filter by warna
  - Filter by supplier
  - Filter cascading (filter saling terhubung)
- **Informasi per Kain:**
  - Nama dan tipe kain
  - Warna dengan visual color indicator
  - Harga per meter
  - Stok tersedia
  - Nama supplier
- **Action:**
  - Tombol "Order" untuk membuat permintaan pemesanan
  - Modal order dengan input quantity
  - Validasi stok sebelum order

### 3. **Supplier Directory** (`pages/umkm/SupplierDirectory.tsx`)

**Fungsi:**
- Direktori lengkap semua supplier
- **Informasi Supplier:**
  - Nama dan avatar
  - Lokasi
  - Nomor telepon
  - Deskripsi bisnis
  - Jumlah produk yang dijual
  - Status availability
- **Filter & Search:**
  - Search by nama supplier atau lokasi
  - Sort by nama/lokasi
- **Action:**
  - View detail supplier
  - Quick contact

### 4. **Hijab Inventory** (`pages/umkm/HijabInventory.tsx`)

**Fungsi:**
- Manajemen stok produk hijab jadi
- **Fitur:**
  - Daftar semua produk dengan stok
  - Visual indicator untuk low stock (warna merah jika < threshold)
  - Informasi bahan yang digunakan
  - Threshold warning
- **Actions:**
  - Restock (produksi ulang produk existing)
  - Add New Product (tambah produk baru)
  - Edit threshold

### 5. **Raw Materials** (`pages/umkm/RawMaterials.tsx`)

**Fungsi:**
- Manajemen bahan baku kain yang sudah dimiliki UMKM
- **Fitur:**
  - Daftar semua bahan baku dengan quantity
  - Search & filter by tipe dan warna
  - Filter cascading
  - Visual card dengan color indicator
- **Production Modal:**
  - **Restock Existing Product:**
    - Pilih produk yang akan diproduksi
    - Input jumlah yang akan diproduksi
    - Auto calculate kebutuhan bahan (1.5m per unit)
    - Validasi ketersediaan bahan
  - **Create New Product:**
    - Input nama produk baru
    - Pilih bahan yang akan digunakan
    - Input quantity produksi
    - Set threshold
    - Auto calculate kebutuhan bahan
- **Rumus Produksi:**
  - 1 unit hijab = 1.5 meter kain
  - Validasi otomatis sebelum produksi

### 6. **Usage History** (`pages/umkm/UsageHistory.tsx`)

**Fungsi:**
- Log penggunaan bahan baku untuk produksi
- **Informasi:**
  - Tanggal produksi
  - Nama produk yang diproduksi
  - Nama bahan yang digunakan
  - Jumlah bahan terpakai (meter)
  - Jumlah unit yang diproduksi
- **Filter:**
  - Filter by produk
  - Filter by periode tanggal
  - Search by nama

### 7. **Sales Management** (`pages/umkm/Sales.tsx`)

**Fungsi:**
- Pencatatan penjualan produk hijab
- **Form Input:**
  - Pilih produk
  - Input quantity
  - Input tracking number (nomor resi)
  - Tanggal penjualan
- **Validasi:**
  - Cek ketersediaan stok
  - Alert jika stok tidak cukup
- **Actions:**
  - Record sale (simpan penjualan)
  - Auto update stok produk
  - Simpan ke riwayat penjualan

### 8. **Order History** (`pages/History.tsx`)

**Fungsi:**
- Riwayat semua pesanan kain ke supplier
- **Informasi per Order:**
  - Tanggal order
  - Nama supplier
  - Material yang dipesan
  - Quantity
  - Status (dengan color badge)
- **Status Actions:**
  - **PENDING:** Upload Payment Proof
  - **SHIPPED:** Mark as Completed
- **Payment Proof Upload:**
  - Upload gambar bukti transfer
  - Preview sebelum submit
  - Format: Base64 encoded image
- **Fitur:**
  - Search by nama material atau ID
  - Pagination (7 items per page)
  - Filter by status

---

## 🏭 FITUR UNTUK SUPPLIER

### 1. **Supplier Dashboard** (`pages/Dashboard.tsx`)

**Fungsi:**
- Overview bisnis supplier
- **Metrics:**
  - Material Types (jumlah jenis kain)
  - Total Ready Stock (total stok semua kain)
  - New Orders (pesanan baru masuk)
  - Order History (total pesanan)
- **Visualisasi:**
  - Daftar incoming requests yang pending
  - Warehouse inventory status dengan progress bar
  - Stock level indicator (merah jika < 50m)

### 2. **My Inventory** (`pages/supplier/InventoryList.tsx`)

**Fungsi:**
- Daftar semua kain yang dijual supplier
- **Informasi per Fabric:**
  - Nama dan tipe kain
  - Warna
  - Stok (meter)
  - Harga per meter
  - Status (In Stock/Limited)
- **Actions:**
  - Edit harga
  - Update stok (restock)
  - View sales analytics
- **Fitur:**
  - Search by nama kain
  - Filter by tipe dan warna
  - Sort by stok/harga
  - Bulk actions

### 3. **Add New Fabric** (`pages/supplier/AddFabric.tsx`)

**Fungsi:**
- Menambahkan produk kain baru ke katalog
- **Form Input:**
  - Nama kain
  - Tipe/kategori (Voal, Silk, Jersey, dll)
  - Warna
  - Harga per meter
  - Stok awal (meter)
- **Validasi:**
  - Required fields validation
  - Harga minimum validation
  - Stok minimum validation
- **Action:**
  - Save fabric ke katalog
  - Auto assign supplierId dan supplierName

### 4. **Incoming Orders** (`pages/supplier/Requests.tsx`)

**Fungsi:**
- Proses pesanan masuk dari UMKM
- **Daftar Request dengan Status:**
  - **PENDING:** Pesanan baru, belum bayar
  - **WAITING_VERIFICATION:** Bukti pembayaran sudah diupload, perlu verifikasi
  - **APPROVED:** Pembayaran terverifikasi
  - **SHIPPED:** Barang sedang dikirim
- **Informasi per Request:**
  - Nama UMKM pemesan
  - Material yang dipesan
  - Quantity
  - Status pembayaran
  - Bukti pembayaran (jika ada)
- **Actions:**
  - **View Payment Proof:** Modal untuk melihat bukti transfer
  - **Approve Payment:** 
    - Verifikasi pembayaran
    - Auto kurangi stok
    - Kirim notifikasi ke UMKM
    - Update status ke APPROVED
  - **Reject Payment:**
    - Tolak pembayaran
    - Cancel order
    - Kirim notifikasi ke UMKM
  - **Mark as Shipped:**
    - Tandai barang sudah dikirim
    - Update status ke SHIPPED
- **Validasi:**
  - Cek stok sebelum approve
  - Alert jika stok tidak cukup

### 5. **History** (`pages/History.tsx`)

**Fungsi:**
- Riwayat semua pesanan yang diterima
- **Informasi:**
  - Tanggal order
  - Nama UMKM
  - Material
  - Quantity
  - Status
- **Filter & Search:**
  - Search by UMKM atau material
  - Pagination

---

## 🔔 SISTEM NOTIFIKASI

**File:** `context/AppContext.tsx` → `addNotification()`

**Jenis Notifikasi:**

### Untuk UMKM:
1. **Order Disruption** - Order tidak bisa diproses karena stok supplier habis
2. **Payment Verified** - Pembayaran terverifikasi, supplier akan mengirim
3. **Payment Rejected** - Pembayaran ditolak, order dibatalkan
4. **Materials Received** - Bahan baku sudah diterima dan masuk inventori

### Untuk Supplier:
1. **New Material Order** - Ada pesanan baru dari UMKM
2. **Payment Proof Uploaded** - UMKM upload bukti transfer

**Fitur Notifikasi:**
- Real-time notification center
- Unread badge indicator
- Auto mark as read saat dibuka
- Icon berbeda per tipe (success, error, warning, info)
- Timestamp
- Sortir dari yang terbaru

---

## 🔄 WORKFLOW PEMESANAN

### Flow Lengkap UMKM Memesan Kain:

1. **Browse Catalog** (`FabricCatalog`)
   - UMKM browse kain dari supplier
   - Filter dan cari kain yang diinginkan

2. **Create Order** (`FabricCatalog` → Modal)
   - Klik tombol Order
   - Input quantity
   - Submit request
   - Status: `PENDING`
   - Notifikasi dikirim ke Supplier

3. **Upload Payment Proof** (`History`)
   - UMKM transfer pembayaran
   - Upload bukti transfer
   - Status: `WAITING_VERIFICATION`
   - Notifikasi ke Supplier

4. **Supplier Verification** (`Requests`)
   - Supplier cek bukti pembayaran
   - Approve atau Reject
   - Jika Approve:
     - Stok supplier berkurang
     - Status: `APPROVED`
     - Notifikasi ke UMKM

5. **Shipping** (`Requests`)
   - Supplier kirim barang
   - Mark as Shipped
   - Status: `SHIPPED`

6. **Receive Materials** (`History`)
   - UMKM terima barang
   - Mark as Completed
   - Status: `COMPLETED`
   - Bahan masuk ke Raw Materials UMKM

---

## 🏭 WORKFLOW PRODUKSI

### Flow UMKM Memproduksi Hijab:

1. **Check Raw Materials** (`RawMaterials`)
   - Cek ketersediaan bahan baku
   - Pilih bahan yang akan digunakan

2. **Production Options:**

   **A. Restock Existing Product**
   - Pilih produk yang sudah ada
   - Input quantity yang akan diproduksi
   - Sistem auto calculate kebutuhan bahan (1.5m × qty)
   - Validasi ketersediaan bahan
   - Submit produksi
   - **Hasil:**
     - Bahan baku berkurang
     - Stok produk bertambah
     - Tercatat di Usage History

   **B. Create New Product**
   - Input nama produk baru
   - Pilih bahan
   - Input quantity produksi
   - Set threshold (low stock warning)
   - Submit
   - **Hasil:**
     - Produk baru ditambahkan
     - Bahan baku berkurang
     - Stok produk sesuai produksi
     - Tercatat di Usage History

3. **View Usage History** (`UsageHistory`)
   - Log semua produksi
   - Track penggunaan bahan

---

## 💰 WORKFLOW PENJUALAN

### Flow UMKM Menjual Hijab:

1. **Sales Entry** (`Sales`)
   - Pilih produk yang dijual
   - Input quantity
   - Input tracking number (nomor resi pengiriman)
   - Pilih tanggal

2. **Validation**
   - Sistem cek ketersediaan stok
   - Alert jika stok tidak cukup

3. **Record Sale**
   - Submit penjualan
   - **Hasil:**
     - Stok produk berkurang
     - Penjualan tercatat dengan tracking number
     - Dapat dilihat di riwayat penjualan

---

## 🗄️ DATA PERSISTENCE

### File: `services/api.ts`

**ApiService** adalah service layer untuk CRUD operations dengan localStorage sebagai database simulasi.

**Storage Keys:**
- `sc_user` - Current logged in user
- `sc_fabrics` - Daftar semua kain
- `sc_requests` - Daftar semua request
- `sc_hijab` - Daftar produk hijab
- `sc_hijab_sales` - Riwayat penjualan
- `sc_umkm_fabrics` - Bahan baku UMKM
- `sc_notifications` - Notifikasi
- `sc_usage_history` - Riwayat penggunaan bahan

**Fungsi-fungsi API:**

```typescript
// User Authentication
login(email: string): Promise<User | null>

// Fabrics
getFabrics(): Promise<Fabric[]>
updateFabric(fabricId: string, updates: Partial<Fabric>): Promise<void>

// Requests
getRequests(): Promise<FabricRequest[]>
saveRequest(request: FabricRequest): Promise<void>
updateRequestStatus(id: string, status: RequestStatus): Promise<void>

// Hijab Products
getHijabProducts(): Promise<HijabProduct[]>
updateHijabProduct(product: HijabProduct): Promise<void>

// Sales
getSales(): Promise<HijabSale[]>
recordSale(sale: HijabSale): Promise<void>

// Usage History
getUsageHistory(): Promise<UsageLog[]>
recordUsage(log: UsageLog): Promise<void>
```

**Delay Simulation:**
- Setiap API call memiliki artificial delay (400-800ms) untuk simulasi network request

---

## 📊 CHARTS & VISUALISASI

### File: `components/charts/InventoryChart.tsx`

**Fungsi:**
- Visualisasi stok hijab vs threshold
- Bar chart dengan Recharts library
- Lazy loaded untuk optimasi performa

**Data yang ditampilkan:**
- Nama produk
- Current stock (bar biru)
- Threshold (bar merah)
- Comparison visual

---

## 🎯 FITUR OPTIMASI PERFORMA

### 1. **Lazy Loading**
```typescript
const Dashboard = lazy(() => import('./pages/Dashboard'));
const FabricCatalog = lazy(() => import('./pages/umkm/FabricCatalog'));
// ... dst
```
- Code splitting untuk setiap page
- Hanya load komponen yang dibutuhkan
- Reduce initial bundle size

### 2. **React Transitions**
```typescript
const [isPending, startTransition] = useTransition();
```
- Smooth transitions antar halaman
- Non-blocking UI updates

### 3. **Memoization**
```typescript
const chartData = useMemo(() => {...}, [hijabProducts]);
const filteredMaterials = useMemo(() => {...}, [deps]);
```
- Cache expensive computations
- Re-calculate hanya saat dependencies berubah

### 4. **Component Memoization**
```typescript
const StatCard = memo(({ props }) => {...});
const FabricCard = memo(({ props }) => {...});
```
- Prevent unnecessary re-renders
- Optimize list rendering

### 5. **ViewportAware Loading**
- Lazy render komponen yang belum terlihat
- Placeholder dengan tinggi tertentu
- Improve perceived performance

---

## 🔒 KEAMANAN

### Data Validation:
1. **Stock Validation** - Cek stok sebelum approve order
2. **Required Fields** - Validasi input form
3. **Image Format** - Accept image/* untuk payment proof
4. **Base64 Encoding** - Secure image storage

### Error Handling:
- Try-catch blocks pada async operations
- User-friendly error messages
- Alert notifications untuk errors

---

## 🎨 UI/UX FEATURES

### Design System:
- **Colors:**
  - Primary: Indigo (#4f46e5, #6366f1)
  - Success: Emerald
  - Warning: Amber
  - Error: Rose
  - Neutral: Slate
- **Typography:**
  - Font: System font stack
  - Weights: Regular (400), Bold (600), Black (900)
  - Tracking: Wide tracking untuk uppercase text
- **Spacing:**
  - Consistent padding/margin using Tailwind scale
  - Rounded corners: 2xl, 3xl untuk modern look
- **Shadows:**
  - Subtle shadows untuk depth
  - Color-matched shadows (indigo shadow untuk indigo buttons)

### Responsive Design:
- Mobile-first approach
- Hamburger menu untuk mobile
- Grid layouts dengan breakpoints
- Touch-friendly button sizes

### Animations:
- Fade in on page load
- Smooth transitions
- Hover effects
- Active state scaling
- Loading spinners

### Accessibility:
- Semantic HTML
- ARIA labels
- Keyboard navigation support
- Focus states
- Color contrast compliance

---

## 📦 MOCK DATA

### File: `data/mockData.ts`

**Initial Data:**
- **USERS:** 1 UMKM + 5 Suppliers
- **INITIAL_FABRICS:** 9 kain dari berbagai supplier
- **INITIAL_HIJAB_STOCK:** 2 produk hijab
- **INITIAL_REQUESTS:** 1 sample request

**Supplier Locations:**
- Solo, Jawa Tengah
- Bandung, Jawa Barat
- Surabaya, Jawa Timur
- Cimahi, Jawa Barat
- Pekalongan, Jawa Tengah

---

## 🚀 DEPLOYMENT

### File: `README.md`, `DEPLOYMENT.md`

**Opsi Deployment:**

1. **Google App Engine** (Recommended)
   - Static web hosting
   - Auto scaling
   - Simple deployment

2. **Google Cloud Run**
   - Container-based
   - Auto scaling
   - Pay per request

3. **Cloud Build (CI/CD)**
   - Automated deployments
   - GitHub integration
   - Build triggers

**Environment Variables:**
- `GEMINI_API_KEY` - API key untuk Gemini AI integration

---

## 🔮 AI INTEGRATION

### Gemini AI (`@google/genai`)

**Potensi Fitur AI:**
- Demand forecasting
- Inventory optimization
- Price recommendations
- Pattern recognition untuk trends
- Automated order suggestions

---

## 📝 KESIMPULAN

CAPS Supply Chain Dashboard adalah solusi komprehensif untuk:

### Untuk UMKM:
✅ Browse dan order kain dari multiple suppliers
✅ Track order status real-time
✅ Manage bahan baku dan produksi
✅ Record penjualan dengan tracking
✅ Monitor stok dengan alerts
✅ View analytics dan trends

### Untuk Supplier:
✅ Manage katalog kain
✅ Process incoming orders
✅ Verify payments
✅ Track shipments
✅ Monitor inventory levels
✅ Manage multiple UMKM clients

### Keunggulan Sistem:
- Real-time synchronization
- Notification system
- Complete order lifecycle
- Production tracking
- Sales analytics
- User-friendly interface
- Mobile responsive
- Optimized performance

### Use Case:
Aplikasi ini cocok untuk:
- UMKM produsen hijab yang ingin streamline procurement
- Supplier kain yang ingin digitalisasi penjualan B2B
- Supply chain management untuk industri fashion/textile
- Business collaboration platform

---

## 📖 CARA MENGGUNAKAN

### Setup Development:
```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env.local
# Edit .env.local dan tambahkan GEMINI_API_KEY

# Run development server
npm run dev
```

### Build Production:
```bash
npm run build
npm run preview
```

### Demo:
1. Buka aplikasi
2. Login sebagai UMKM (`umkm@example.com`)
3. Browse fabric catalog
4. Create order
5. Upload payment proof
6. Logout dan login sebagai Supplier (`supplier@example.com`)
7. Verify payment dan approve
8. Mark as shipped
9. Kembali ke UMKM dan complete order
10. Raw materials akan masuk ke inventory
11. Produksi hijab dari raw materials
12. Record sales

---

**Dibuat oleh: CAPS Development Team**
**Versi: 1.0.0**
**Terakhir Update: 2024**
