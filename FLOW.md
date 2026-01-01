# Aliran Website SupplyChain Dashboard

Dokumen ini merangkum alur penggunaan aplikasi berdasarkan struktur kode dan tampilan yang ada di repository.

## Ringkasan Arsitektur
- **Stack**: React + Vite, dengan konteks global di `context/AppContext.tsx`.
- **Data**: Seed dari `data/mockData.ts` lalu dipersist di `localStorage` (kain, produk hijab, permintaan, histori penggunaan, notifikasi).
- **Peran**:
  - **UMKM** (`umkm@example.com`)
  - **Supplier** (`supplier@example.com` atau supplier lain di mock data)
- **Navigasi**: Ditangani oleh `components/Layout.tsx` dengan tab berbeda untuk tiap peran.

## Alur UMKM
1. **Masuk**
   - Login memakai email UMKM di halaman `pages/Login.tsx` (password tidak divalidasi).
   - Setelah login, tab aktif di-set ke `dashboard`.
2. **Dashboard (`pages/Dashboard.tsx`)**
   - Menampilkan ringkasan stok hijab, supplier aktif, permintaan aktif, dan peringatan stok rendah.
3. **Cari & Buat Permintaan Kain**
   - **Fabric Catalog (`pages/umkm/FabricCatalog.tsx`)**: Telusuri kain, filter tipe/warna/supplier, lalu buat permintaan. Sistem membuat `FabricRequest` PENDING dengan detail kain, supplier, dan kuantitas.
   - **Supplier Directory (`pages/umkm/SupplierDirectory.tsx`)**: Lihat profil supplier, lokasi, kontak, dan daftar kain yang mereka sediakan.
4. **Pembayaran & Pelacakan Permintaan**
   - **Order History (`pages/History.tsx`)**:
     - Status awal PENDING.
     - UMKM unggah bukti pembayaran → status jadi `WAITING_VERIFICATION`.
     - Saat supplier menandai APPROVED → status bisa lanjut SHIPPED.
     - UMKM menekan “Complete” saat barang diterima → status `COMPLETED` dan stok kain lokal bertambah.
5. **Gudang & Produksi**
   - **Raw Materials (`pages/umkm/RawMaterials.tsx`)**: Melihat kain yang sudah diterima (umkmFabrics). Dapat:
     - **Restock SKU**: Produksi batch baru untuk SKU yang sudah ada → mengurangi kain, menambah stok produk hijab, menambah log konsumsi.
     - **New Product Lab**: Membuat SKU baru dari kain yang ada → mengurangi kain, menambah produk hijab, dan log penggunaan.
   - **Usage History (`pages/umkm/UsageHistory.tsx`)**: Riwayat konsumsi kain per batch produksi.
6. **Stok Produk & Penjualan**
   - **Hijab Inventory (`pages/umkm/HijabInventory.tsx`)**: Pantau stok SKU vs threshold (status Healthy/Restock Needed).
   - **Sales Management (`pages/umkm/Sales.tsx`)**: Catat penjualan via modal `SalesTransactionModal`, mengurangi stok SKU dan menyimpan riwayat penjualan.
7. **Notifikasi**
   - Setiap perubahan penting (permintaan baru, verifikasi, penolakan) menambah notifikasi ke pengguna terkait (lihat `addNotification` di AppContext).

## Alur Supplier
1. **Masuk**
   - Login memakai email supplier.
2. **Dashboard (`pages/Dashboard.tsx`)**
   - Ringkasan jenis material, total stok, order baru, dan histori.
3. **Kelola Katalog & Stok**
   - **Material Inventory (`pages/supplier/InventoryList.tsx`)**: Lihat kain milik supplier, edit stok & harga secara inline.
   - **Add New Fabric (`pages/supplier/AddFabric.tsx`)**: Tambah kain baru ke katalog (disimpan di `localStorage` dan konteks).
4. **Proses Pesanan**
   - **Incoming Orders (`pages/supplier/Requests.tsx`)**:
     - Melihat permintaan dari UMKM dengan status PENDING/WAITING_VERIFICATION/APPROVED/SHIPPED.
     - Validasi bukti bayar → Approve (stok kain otomatis berkurang). Bisa Reject/Cancel bila perlu.
     - Setelah Approved, dapat menandai SHIPPED.
5. **Riwayat**
   - **Order History (`pages/History.tsx`)**: Supplier melihat log semua permintaan yang melibatkan mereka.

## Alur Data Kunci
- **Permintaan Kain**: UMKM buat permintaan → supplier verifikasi → pengiriman → UMKM konfirmasi → stok kain UMKM bertambah.
- **Produksi Hijab**: Kain UMKM dikurangi saat produksi → stok hijab bertambah → log penggunaan tercatat.
- **Penjualan**: Mencatat transaksi → stok hijab berkurang, riwayat penjualan bertambah.
- **Persistensi**: Semua mutasi ditulis ke `localStorage` agar sesi berikutnya memuat data terbaru.

## Cara Uji Coba Manual (disarankan)
1. Jalankan `npm install` lalu `npm run dev` atau `npm run build` untuk memastikan aplikasi terkompilasi.
2. **Skenario UMKM**
   - Login `umkm@example.com`.
   - Buat permintaan di Fabric Catalog, unggah bukti di Order History, lalu tandai selesai ketika sudah dikirim (setelah supplier approve/ship).
   - Cek Raw Materials bertambah, lakukan produksi Restock atau New Product, lalu lihat perubahan di Hijab Inventory dan Usage History.
   - Catat penjualan lewat Sales Management dan pastikan stok produk berkurang.
3. **Skenario Supplier**
   - Login `supplier@example.com`.
   - Tambah kain baru di Add New Fabric, edit harga/stok di Material Inventory.
   - Buka Incoming Orders, verifikasi bukti bayar, approve, lalu ship; pastikan stok kain berkurang.
   - Lihat pembaruan status di Order History.

Ikuti urutan di atas untuk memastikan fitur bekerja sesuai alur yang dimodelkan di kode.
