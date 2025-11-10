# Environment Setup Guide

## Shared .env File

This project uses a single `.env` file in the root directory that is shared by all applications:
- `FactoUserWebApp`
- `FactoAdminApp`
- `FactoBackendServices`

## Setup Instructions

1. **Create `.env` file in the root directory:**
   ```bash
   cp .env.example .env
   ```

2. **Update the `.env` file with your configuration:**
   
   **Option A: Use Production Backend (Recommended for testing)**
   ```env
   # Backend API URL - Use production backend (same as Vercel deployment)
   VITE_API_URL=https://facto-backend-api.onrender.com/api/v1
   
   # Environment
   NODE_ENV=development
   ```
   
   **Option B: Use Local Backend (if you have backend running locally)**
   ```env
   # Backend API URL - Use localhost for local development
   VITE_API_URL=http://localhost:8080/api/v1
   
   # Backend Services Configuration
   BACKEND_PORT=8080
   BACKEND_HOST=localhost
   
   # Environment
   NODE_ENV=development
   ```
   
   **Note:** The default configuration now uses production backend to match Vercel deployment behavior. 
   If you want to use localhost backend, you must:
   1. Start the backend server on localhost:8080
   2. Ensure the local database has the same data as production
   3. Set `VITE_API_URL=http://localhost:8080/api/v1` in `.env`

## How It Works

- **FactoUserWebApp**: Reads `VITE_API_URL` from `.env` via `src/config/apiConfig.ts`
- **FactoAdminApp**: Reads `VITE_API_URL` from `.env` via `src/utils/apiConstants.ts`
- **FactoBackendServices**: Reads `MONGODB_URI` from `.env` file in `FactoBackendServices/` directory
- Both frontend apps default to production backend URL if `.env` is not found

## Backend Database Configuration

**Important:** The backend uses a **separate `.env` file** in the `FactoBackendServices/` directory for database connection.

### To Use Same Database as Production:

1. **Get MongoDB URI from Render.com:**
   - Go to Render.com → Your backend service → Environment tab
   - Copy the `MONGODB_URI` value

2. **Create `.env` file in `FactoBackendServices/` directory:**
   ```env
   MONGODB_URI=mongodb+srv://...your-production-connection-string.../facto_app
   PORT=8080
   NODE_ENV=development
   JWT_SECRET=your_secret_here
   # ... other required variables
   ```

3. **Verify connection:**
   ```bash
   cd FactoBackendServices
   npm run verify:db
   ```

See `DATABASE_CONFIGURATION.md` for detailed instructions.

## Important Notes

- The `.env` file is gitignored (not committed to repository)
- Always use `.env.example` as a template
- Restart development servers after changing `.env` values
- Vite automatically loads `.env` files from the project root
- Backend uses `.env` file in its own directory (not root)

