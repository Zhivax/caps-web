# API Testing and Setup Guide

## Quick Setup

### 1. Install Dependencies

**Backend:**
```bash
cd backend
pip3 install -r requirements.txt
```

**Frontend:**
```bash
npm install
```

### 2. Configure Environment

Create a `.env` file in the root directory (copy from `.env.example`):
```bash
cp .env.example .env
```

The default configuration in `.env`:
```env
VITE_API_URL=http://localhost:8000
```

### 3. Start the Application

**Terminal 1 - Start Backend:**
```bash
cd backend
python3 main.py
```

The backend will run on `http://localhost:8000`

**Terminal 2 - Start Frontend:**
```bash
npm run dev
```

The frontend will run on `http://localhost:8080`

### 4. Run API Tests

To verify all endpoints are working:
```bash
./test-api.sh
```

This will test:
- ✅ Backend API connectivity
- ✅ All CRUD endpoints
- ✅ Login functionality (UMKM and Supplier)
- ✅ Data operations
- ✅ CORS configuration

## CORS Configuration

### Development Setup

The application uses **Vite's proxy** to avoid CORS issues during development:

**vite.config.ts:**
```typescript
server: {
  port: 8080,
  strictPort: true,
  proxy: {
    '/api': {
      target: 'http://localhost:8000',
      changeOrigin: true,
      secure: false,
    }
  }
}
```

This configuration:
- Proxies all `/api/*` requests from frontend (`http://localhost:8080`) to backend (`http://localhost:8000`)
- Eliminates CORS errors in development
- Allows the frontend to use relative URLs (`/api/login` instead of `http://localhost:8000/api/login`)

### Backend CORS Configuration

**backend/main.py:**
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

⚠️ **Production Note:** Replace `allow_origins=["*"]` with specific domains for security.

### API Service Configuration

**services/api.ts:**
```typescript
// Use proxy in development, full URL in production
const isDevelopment = import.meta.env.DEV;
const BASE_URL = isDevelopment ? '' : API_BASE_URL;
```

This ensures:
- **Development:** Uses relative URLs (proxied by Vite)
- **Production:** Uses full API URL from environment variable

## Available API Endpoints

### Authentication
- `POST /api/login` - User login (email-based)

### Fabrics
- `GET /api/fabrics` - Get all fabrics
- `GET /api/fabrics/{id}` - Get specific fabric
- `POST /api/fabrics` - Add new fabric (Supplier only)
- `PATCH /api/fabrics/{id}` - Update fabric stock/price

### Requests
- `GET /api/requests` - Get all fabric requests
- `POST /api/requests` - Create new request
- `PATCH /api/requests/{id}/status` - Update request status

### Hijab Products
- `GET /api/hijab-products` - Get all products
- `POST /api/hijab-products` - Create/update product

### Sales & Usage
- `GET /api/sales` - Get sales history
- `POST /api/sales` - Record new sale
- `GET /api/usage-history` - Get fabric usage history
- `POST /api/usage-history` - Record fabric usage

## Demo Accounts

### UMKM (Hijab Producers)
- `umkm@example.com` - Zahra Hijab
- `umkm2@example.com` - Aisha Fashion
- `umkm3@example.com` - Hijabku Store

### Suppliers (Fabric Suppliers)
- `supplier@example.com` - Mitra Tekstil Solo
- `supplier2@example.com` - Bandung Fabric Hub
- `supplier3@example.com` - Surabaya Tekstil Utama
- `supplier4@example.com` - Cigondewah Jaya
- `supplier5@example.com` - Pekalongan Batik & Silk
- `supplier6@example.com` - Jakarta Textile Center
- `supplier7@example.com` - Yogya Kain Modern

Password: Any text (authentication is simplified for demo)

## Troubleshooting

### CORS Errors

**Problem:** "CORS policy: No 'Access-Control-Allow-Origin' header"

**Solutions:**

1. **Check if backend is running:**
   ```bash
   curl http://localhost:8000/
   ```
   Should return: `{"message": "Supply Chain Dashboard API", "version": "1.0.0"}`

2. **Check if frontend proxy is working:**
   ```bash
   curl http://localhost:8080/api/fabrics
   ```
   Should return array of fabrics

3. **Verify .env configuration:**
   Ensure `.env` file exists with:
   ```env
   VITE_API_URL=http://localhost:8000
   ```

4. **Restart both servers:**
   - Stop backend (Ctrl+C) and restart: `cd backend && python3 main.py`
   - Stop frontend (Ctrl+C) and restart: `npm run dev`

### Login Not Working

**Problem:** Can't login or "User not found" error

**Solutions:**

1. **Test API directly:**
   ```bash
   curl -X POST http://localhost:8000/api/login \
     -H "Content-Type: application/json" \
     -d '{"email":"umkm@example.com"}'
   ```

2. **Check browser console:**
   - Open browser DevTools (F12)
   - Check Console tab for errors
   - Check Network tab to see API request/response

3. **Verify email format:**
   - Use exact emails from demo accounts list
   - Check for typos or extra spaces

### Backend Not Starting

**Problem:** Backend fails to start or port already in use

**Solutions:**

1. **Check if port 8000 is in use:**
   ```bash
   lsof -i :8000
   ```

2. **Kill existing process:**
   ```bash
   kill -9 <PID>
   ```

3. **Install dependencies again:**
   ```bash
   cd backend
   pip3 install -r requirements.txt --force-reinstall
   ```

### Frontend Not Starting

**Problem:** Frontend fails to start or port already in use

**Solutions:**

1. **Check if port 8080 is in use:**
   ```bash
   lsof -i :8080
   ```

2. **Clear node_modules and reinstall:**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Try different port:**
   Edit `vite.config.ts` and change port:
   ```typescript
   server: {
     port: 3000, // or any other available port
   }
   ```

## Production Deployment

### Environment Variables

**Frontend (.env.production):**
```env
VITE_API_URL=https://your-api-domain.com
```

### Backend Configuration

Update CORS origins in `backend/main.py`:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://your-frontend-domain.com",
        "https://www.your-frontend-domain.com"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Build Commands

**Frontend:**
```bash
npm run build
```

**Backend:**
```bash
# Run with production server
uvicorn main:app --host 0.0.0.0 --port 8000
```

## Additional Resources

- **Backend API Documentation:** `http://localhost:8000/docs` (Swagger UI)
- **Alternative API Docs:** `http://localhost:8000/redoc` (ReDoc)
- **Test Script:** `./test-api.sh` - Comprehensive API testing

## Support

If you encounter any issues:
1. Run the test script: `./test-api.sh`
2. Check both terminal outputs for errors
3. Review browser console for frontend errors
4. Verify all dependencies are installed correctly
