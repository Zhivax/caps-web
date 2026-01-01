# Backend Refactoring - Clean Architecture

## 📁 New Structure

```
backend/
├── main.py                    # Application entry point (68 lines)
├── requirements.txt           # Dependencies
├── app/
│   ├── __init__.py
│   ├── core/                  # Core utilities
│   │   ├── __init__.py
│   │   ├── config.py          # Configuration
│   │   └── security.py        # Security utilities (JWT, Auth, RBAC)
│   ├── models/                # Data models
│   │   ├── __init__.py
│   │   ├── user.py            # User models
│   │   ├── fabric.py          # Fabric models
│   │   ├── hijab.py           # Hijab product & sales models
│   │   ├── request.py         # Request models
│   │   ├── production.py      # Production models
│   │   └── umkm.py            # UMKM fabric storage models
│   ├── routes/                # API routes
│   │   ├── __init__.py
│   │   ├── auth.py            # Authentication routes
│   │   ├── fabrics.py         # Fabric management routes
│   │   ├── requests.py        # Request management routes
│   │   ├── hijab.py           # Hijab products & sales routes
│   │   └── production.py      # Production & UMKM storage routes
│   └── database/              # Data layer
│       ├── __init__.py
│       └── mock_data.py       # Mock data (in-memory database)
└── main_old.py                # Original monolithic file (for reference)
```

## 🎯 Benefits

### Before (989 lines in one file):
- ❌ Hard to navigate
- ❌ Difficult to test individual components
- ❌ Tight coupling
- ❌ Hard to maintain
- ❌ No separation of concerns

### After (Modular structure):
- ✅ **main.py**: 68 lines - Clean entry point
- ✅ **Organized by feature**: auth, fabrics, requests, hijab, production
- ✅ **Separation of concerns**: models, routes, core, database
- ✅ **Easy to test**: Each module can be tested independently
- ✅ **Easy to extend**: Add new features by adding new modules
- ✅ **Better maintainability**: Changes localized to relevant modules

## 📝 Module Description

### Core (`app/core/`)
**Purpose:** Core functionality shared across the application

- `config.py`: Application configuration (environment variables, constants)
- `security.py`: Security utilities (JWT, password hashing, RBAC, input sanitization, audit logging)

### Models (`app/models/`)
**Purpose:** Data models and validation using Pydantic

- `user.py`: User, LoginRequest, RefreshTokenRequest
- `fabric.py`: Fabric, FabricUpdate
- `hijab.py`: HijabProduct, HijabSale, HijabSaleRequest
- `request.py`: FabricRequest, RequestStatusUpdate
- `production.py`: ProductionRequest, UsageLog
- `umkm.py`: UMKMFabric

### Routes (`app/routes/`)
**Purpose:** API endpoint definitions organized by domain

- `auth.py`: Authentication (login, refresh, me)
- `fabrics.py`: Fabric CRUD operations
- `requests.py`: Fabric request management
- `hijab.py`: Hijab products and sales
- `production.py`: Production and UMKM fabric storage

### Database (`app/database/`)
**Purpose:** Data access layer

- `mock_data.py`: In-memory database with mock data

## 🚀 Usage

### Starting the Server

```bash
cd backend
python main.py
```

Or with uvicorn:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Importing Modules

```python
# Import models
from app.models import User, Fabric, HijabProduct

# Import security utilities
from app.core import JWTHandler, get_current_active_user

# Import database
from app.database import USERS, FABRICS
```

## 🧪 Testing

### Test Individual Modules

```python
# Test models
from app.models.user import User

# Test security
from app.core.security import PasswordHash
hashed = PasswordHash.hash_password("test123")

# Test routes (with FastAPI TestClient)
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)
response = client.get("/health")
assert response.status_code == 200
```

## 📦 Adding New Features

### 1. Add a New Model

```python
# app/models/inventory.py
from pydantic import BaseModel

class Inventory(BaseModel):
    id: str
    item: str
    quantity: int
```

### 2. Add New Routes

```python
# app/routes/inventory.py
from fastapi import APIRouter
from app.models.inventory import Inventory

router = APIRouter(prefix="/api/inventory", tags=["inventory"])

@router.get("/")
async def get_inventory():
    return {"items": []}
```

### 3. Register Routes in main.py

```python
from app.routes import inventory_router
app.include_router(inventory_router)
```

## 🔄 Migration from Old Structure

The old monolithic `main.py` (989 lines) has been:
- Split into logical modules by feature
- Models extracted to `app/models/`
- Routes split into separate files in `app/routes/`
- Security utilities moved to `app/core/security.py`
- Configuration extracted to `app/core/config.py`
- Mock data moved to `app/database/mock_data.py`

The old file is preserved as `main_old.py` for reference.

## ✅ Best Practices Applied

1. **Separation of Concerns**: Each module has a single responsibility
2. **DRY (Don't Repeat Yourself)**: Shared code in core modules
3. **Dependency Injection**: Using FastAPI's `Depends()`
4. **Type Safety**: Pydantic models for validation
5. **Modularity**: Easy to add/remove features
6. **Testability**: Each module can be tested independently
7. **Clean Code**: Clear naming, proper structure
8. **Scalability**: Easy to add new endpoints and features

## 📚 API Documentation

Once the server is running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 🔐 Security

All security features from the original implementation are preserved:
- JWT-based authentication
- Role-based access control (RBAC)
- Password hashing with bcrypt
- Input sanitization
- Rate limiting
- Audit logging
- CORS configuration

## 🎉 Summary

The backend has been successfully refactored from a 989-line monolithic file into a clean, modular architecture:

- **68-line main.py** - Clean entry point
- **6 model files** - Organized data models
- **5 route files** - Feature-based endpoints
- **2 core files** - Shared utilities
- **1 database file** - Data layer

This structure follows industry best practices and makes the codebase more maintainable, testable, and scalable.
