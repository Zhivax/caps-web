# Ringkasan Perbaikan Deploy Google Cloud Run

## 🔍 Masalah yang Ditemukan

### Error Message
```
unable to prepare context: unable to evaluate symlinks in Dockerfile path: 
lstat /workspace/Dockerfile: no such file or directory
```

### Akar Masalah
1. **File `.gcloudignore` mengecualikan Dockerfile**
   - Baris 60-61 di `.gcloudignore` mengecualikan `Dockerfile` dan `nginx.conf`
   - Ketika Google Cloud Build mencoba build Docker image, file-file ini tidak ada
   
2. **Konfigurasi salah untuk deployment target**
   - `cloudbuild.yaml` dikonfigurasi untuk **App Engine** bukan **Cloud Run**
   - App Engine tidak menggunakan Docker, sementara Cloud Run memerlukan Docker image

## ✅ Solusi yang Diterapkan

### 1. Update `.gcloudignore`
**Sebelum:**
```
# Other deployment configs
Dockerfile
nginx.conf
wrangler.jsonc
```

**Sesudah:**
```
# Other deployment configs
# Dockerfile - NEEDED for Cloud Run deployment
# nginx.conf - NEEDED for Cloud Run deployment
wrangler.jsonc
```

**Hasil:** Dockerfile dan nginx.conf sekarang akan di-include dalam deployment context.

### 2. Update `cloudbuild.yaml`
**Sebelum:** Deployment ke App Engine
```yaml
steps:
  - name: 'gcr.io/cloud-builders/npm'
    args: ['ci']
  - name: 'gcr.io/cloud-builders/npm'
    args: ['run', 'build']
  - name: 'gcr.io/cloud-builders/gcloud'
    args: ['app', 'deploy', '--version=$SHORT_SHA']
```

**Sesudah:** Deployment ke Cloud Run
```yaml
steps:
  # Build Docker image
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/$PROJECT_ID/caps-web:$COMMIT_SHA', '.']
  
  # Push to Container Registry
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'gcr.io/$PROJECT_ID/caps-web:$COMMIT_SHA']
  
  # Deploy to Cloud Run
  - name: 'gcr.io/cloud-builders/gcloud'
    args: ['run', 'deploy', 'caps-web', '--image', 'gcr.io/$PROJECT_ID/caps-web:$COMMIT_SHA', ...]
```

**Hasil:** 
- Build menggunakan Docker multi-stage build
- Image di-push ke Google Container Registry
- Deploy langsung ke Cloud Run

### 3. Konfigurasi Cloud Run
- **Region**: asia-southeast2 (Jakarta)
- **Port**: 8080
- **Memory**: 512Mi
- **CPU**: 1 vCPU
- **Scaling**: 0-10 instances (scale to zero untuk hemat biaya)
- **Access**: Public (allow-unauthenticated)

## 📦 Arsitektur Deployment

```
Source Code
    ↓
┌─────────────────────────────┐
│  1. Docker Multi-Stage Build │
│  - Stage 1: Node.js builder  │
│  - Stage 2: Nginx server     │
└──────────────┬──────────────┘
               ↓
┌──────────────────────────────┐
│  2. Container Registry (GCR)  │
│  - gcr.io/PROJECT/caps-web    │
└──────────────┬───────────────┘
               ↓
┌──────────────────────────────┐
│  3. Cloud Run Service         │
│  - Auto-scaling (0-10)        │
│  - HTTPS enabled              │
│  - Health checks              │
└───────────────────────────────┘
```

## 📝 Dokumentasi Tambahan

### File Baru yang Ditambahkan:
1. **CLOUD_RUN_DEPLOYMENT.md** - Panduan deployment lengkap
2. **DEPLOY_QUICK_START.md** - Quick reference commands
3. **test-docker-build.sh** - Script untuk test build lokal

## 🚀 Cara Deploy

### Deployment Otomatis (Recommended)
```bash
gcloud builds submit --config=cloudbuild.yaml
```

### Deployment Manual
```bash
# Build
docker build -t gcr.io/YOUR_PROJECT_ID/caps-web:latest .

# Push
docker push gcr.io/YOUR_PROJECT_ID/caps-web:latest

# Deploy
gcloud run deploy caps-web \
  --image gcr.io/YOUR_PROJECT_ID/caps-web:latest \
  --platform managed \
  --region asia-southeast2 \
  --allow-unauthenticated
```

## ✨ Keuntungan Cloud Run vs App Engine

### Cloud Run
✅ Containerized (lebih flexible)
✅ Scale to zero (hemat biaya saat idle)
✅ Deployment lebih cepat
✅ Support custom runtime via Docker
✅ Portable (bisa run di mana saja)

### App Engine
❌ Runtime terbatas
❌ Minimum 1 instance harus running
❌ Vendor lock-in lebih tinggi

## 🔒 Security Best Practices

1. **Nginx Configuration**: Sudah include security headers
2. **Health Check**: Endpoint `/health` untuk monitoring
3. **Port Configuration**: Menggunakan port 8080 (Cloud Run standard)
4. **Environment Variables**: Jangan hard-code API keys

## 📊 Monitoring & Logs

```bash
# View logs
gcloud run services logs read caps-web --region asia-southeast2

# Service status
gcloud run services describe caps-web --region asia-southeast2
```

## 🎯 Hasil Akhir

Setelah perbaikan ini:
- ✅ Repository siap untuk deployment ke Google Cloud Run
- ✅ Error "Dockerfile not found" sudah teratasi
- ✅ Konfigurasi deployment sudah benar untuk Cloud Run
- ✅ Dokumentasi lengkap tersedia
- ✅ Testing script tersedia untuk validasi lokal

## 🔧 Maintenance

### Update Aplikasi
1. Push code changes ke repository
2. Run `gcloud builds submit --config=cloudbuild.yaml`
3. Cloud Run akan otomatis rolling update

### Update Environment Variables
```bash
gcloud run services update caps-web \
  --region asia-southeast2 \
  --set-env-vars KEY=VALUE
```

### Scale Up/Down
```bash
gcloud run services update caps-web \
  --region asia-southeast2 \
  --max-instances 20 \
  --min-instances 1
```

---

**Tanggal Perbaikan**: 2026-01-01
**Status**: ✅ Ready for Production Deployment
