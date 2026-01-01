# Supply Chain Dashboard - UMKM & Supplier Platform

A full-stack web application for managing supply chain relationships between UMKM (Small & Medium Enterprises) hijab producers and fabric suppliers. Built with React + TypeScript frontend and FastAPI backend.

## 🌟 Features

### For UMKM (Hijab Producers)
- **Dashboard**: Overview of stock, suppliers, and active requests
- **Fabric Catalog**: Browse fabrics from multiple suppliers with filters
- **Supplier Directory**: View and contact fabric suppliers
- **Production Management**: Track hijab inventory and raw materials
- **Usage History**: Monitor fabric usage in production
- **Sales Management**: Record and track hijab sales
- **Order History**: View past material requests

### For Suppliers
- **Supplier Dashboard**: Monitor business metrics
- **Fabric Management**: Add and manage fabric inventory
- **Incoming Orders**: Handle requests from UMKM partners
- **Order History**: Track completed transactions

## 🏗️ Architecture

### Frontend
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React

### Backend
- **Framework**: FastAPI (Python)
- **Server**: Uvicorn
- **Data Validation**: Pydantic
- **CORS**: Enabled for local development

## 📦 Project Structure

```
caps-web/
├── backend/              # FastAPI backend
│   ├── main.py          # Main API application
│   ├── requirements.txt # Python dependencies
│   └── README.md        # Backend documentation
├── components/          # React components
├── context/            # React context providers
├── pages/              # Page components
│   ├── umkm/          # UMKM-specific pages
│   └── supplier/      # Supplier-specific pages
├── services/           # API service layer
├── data/              # Mock data (legacy)
├── types.ts           # TypeScript type definitions
└── package.json       # Frontend dependencies
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Python 3.8+
- pip (Python package manager)

### 1. Clone the Repository
```bash
git clone https://github.com/Zhivax/caps-web.git
cd caps-web
```

### 2. Setup Backend

```bash
# Navigate to backend directory
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Run the backend server
python main.py
```

The backend API will be available at `http://localhost:8000`

API Documentation:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

### 3. Setup Frontend

```bash
# Navigate to root directory
cd ..

# Install dependencies
npm install

# Create .env file (recommended for API configuration)
cp .env.example .env

# Run development server
npm run dev
```

The frontend will be available at `http://localhost:8080`

**Note:** The application uses Vite's proxy configuration to avoid CORS issues during development. All `/api/*` requests are automatically proxied to the backend at `http://localhost:8000`.

### 4. Verify Setup (Optional)

Run the comprehensive API test script to verify all endpoints:

```bash
# Make sure both backend and frontend are running
./test-api.sh
```

This will test all API endpoints and confirm that login, CRUD operations, and data flow are working correctly.

### 4. Login

Use one of the demo accounts:

**UMKM Account:**
- Email: `umkm@example.com`
- Password: `password` (any text)

**Supplier Account:**
- Email: `supplier@example.com`
- Password: `password` (any text)

Other accounts available:
- `umkm2@example.com`, `umkm3@example.com`
- `supplier2@example.com` through `supplier7@example.com`

## 🔧 Troubleshooting

### CORS Issues
If you encounter CORS errors:
1. Ensure both backend and frontend servers are running
2. Backend should be on `http://localhost:8000`
3. Frontend should be on `http://localhost:8080`
4. The Vite proxy configuration automatically handles CORS

For detailed troubleshooting, see [API_SETUP.md](./API_SETUP.md)

### Testing APIs
Run the comprehensive test suite:
```bash
./test-api.sh
```

This tests all endpoints including login, fabrics, requests, products, sales, and usage history.

## 📊 Mock Data

The backend includes extensive mock data:
- **34+ Fabrics** across 7 suppliers with varied types (Voal, Silk, Satin, Jersey, Batik, etc.)
- **7 Suppliers** from different cities in Indonesia
- **10 Hijab Products** with stock management
- **5 Sample Requests** in various statuses
- **Multiple Fabric Types**: Voal, Katun, Silk, Satin, Jersey, Spandex, Cerruti, Chiffon, Batik, Organza, Tulle, Lace, Wolfis, Maxmara, Bella, Diamond
- **34+ Colors**: From classic to trendy shades

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/login` | User authentication |
| GET | `/api/fabrics` | Get all fabrics |
| POST | `/api/fabrics` | Add new fabric |
| PATCH | `/api/fabrics/{id}` | Update fabric stock/price |
| GET | `/api/requests` | Get all requests |
| POST | `/api/requests` | Create new request |
| PATCH | `/api/requests/{id}/status` | Update request status |
| GET | `/api/hijab-products` | Get all hijab products |
| POST | `/api/hijab-products` | Create/update hijab product |
| GET | `/api/sales` | Get all sales |
| POST | `/api/sales` | Record new sale |
| GET | `/api/usage-history` | Get fabric usage history |
| POST | `/api/usage-history` | Record fabric usage |

## 🛠️ Development

### Frontend Development
```bash
npm run dev        # Start dev server
npm run build      # Build for production
npm run preview    # Preview production build
```

### Backend Development
```bash
# Run with auto-reload
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## 🌐 Environment Variables

### Frontend (.env)
```env
VITE_API_URL=http://localhost:8000
```

### Backend
No environment variables required for local development. All data is in-memory.

## 📝 Notes

- The backend uses in-memory storage, so data resets on server restart
- CORS is configured for `*` in development - restrict in production
- Frontend uses React Suspense for lazy loading pages
- The app supports both UMKM and Supplier user roles with different interfaces

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is part of a supply chain management system for UMKM and fabric suppliers.

## 🎯 Future Enhancements

- [ ] Database integration (PostgreSQL/MongoDB)
- [ ] Real authentication with JWT
- [ ] File upload for payment proofs
- [ ] Email notifications
- [ ] WhatsApp integration
- [ ] Export to PDF/Excel
- [ ] Multi-language support (Indonesian/English)
- [ ] Mobile responsive improvements
