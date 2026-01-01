# Supply Chain Dashboard Backend

FastAPI backend for the Supply Chain Dashboard application.

## Setup

1. Install Python dependencies:
```bash
pip install -r requirements.txt
```

## Running the Backend

```bash
python main.py
```

Or using uvicorn directly:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`

## API Documentation

Once running, access the interactive API documentation at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Endpoints

- `POST /api/login` - User authentication
- `GET /api/fabrics` - Get all fabrics
- `PATCH /api/fabrics/{id}` - Update fabric
- `GET /api/requests` - Get all requests
- `POST /api/requests` - Create new request
- `PATCH /api/requests/{id}/status` - Update request status
- `GET /api/hijab-products` - Get all hijab products
- `POST /api/hijab-products` - Create/update hijab product
- `GET /api/sales` - Get all sales
- `POST /api/sales` - Record new sale
- `GET /api/usage-history` - Get usage history
- `POST /api/usage-history` - Record fabric usage
