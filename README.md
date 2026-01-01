# CAPS Web Application

Supply Chain Dashboard Application

## Project Structure

```
caps-web/
├── frontend/          # React + Vite frontend application
└── docs/              # Project documentation
```

Note: Backend will be developed in a separate repository.

## Getting Started

### Frontend

```bash
cd frontend
npm install
npm run dev
```

See `frontend/README.md` for detailed frontend documentation.

## Documentation

All project documentation is available in the `docs/` folder:

- [INDEX.md](docs/INDEX.md) - Documentation index
- [README.md](docs/README.md) - Setup & run guide
- [DEPLOYMENT.md](docs/DEPLOYMENT.md) - Deployment options
- [QUICK_REFERENCE.md](docs/QUICK_REFERENCE.md) - Quick reference guide
- [FUNCTION_DOCUMENTATION.md](docs/FUNCTION_DOCUMENTATION.md) - Technical documentation

## Deployment

For Google Cloud Run deployment, use the root-level configuration:

```bash
# Deploy from repository root
gcloud builds submit --config cloudbuild.yaml
```

For detailed deployment instructions and other deployment options, see [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).
