# Start All Applications Locally
# Run this script from the root directory

Write-Host "🚀 Starting Facto Consultancy Applications..." -ForegroundColor Cyan
Write-Host ""

# Check if .env files exist
if (-not (Test-Path "FactoBackendServices\.env")) {
    Write-Host "⚠️  WARNING: FactoBackendServices\.env not found!" -ForegroundColor Yellow
    Write-Host "   Please create it with MONGODB_URI and other required variables" -ForegroundColor Yellow
    Write-Host ""
}

if (-not (Test-Path ".env")) {
    Write-Host "⚠️  WARNING: Root .env not found!" -ForegroundColor Yellow
    Write-Host "   Creating default .env file..." -ForegroundColor Yellow
    @"
VITE_API_URL=http://localhost:8080/api/v1
NODE_ENV=development
"@ | Out-File -FilePath ".env" -Encoding utf8
    Write-Host "   ✅ Created .env file" -ForegroundColor Green
    Write-Host ""
}

# Start Backend
Write-Host "📦 Starting Backend Server..." -ForegroundColor Green
$backendPath = Join-Path $PWD "FactoBackendServices"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; npm start"

# Wait for backend to initialize
Write-Host "   ⏳ Waiting for backend to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 8

# Start User Web App
Write-Host "🌐 Starting User Web App..." -ForegroundColor Green
$userAppPath = Join-Path $PWD "FactoUserWebApp"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$userAppPath'; npm run dev"

# Wait a bit
Start-Sleep -Seconds 3

# Start Admin App
Write-Host "👨‍💼 Starting Admin App..." -ForegroundColor Green
$adminAppPath = Join-Path $PWD "FactoAdminApp"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$adminAppPath'; npm run dev"

Write-Host ""
Write-Host "✅ All applications are starting!" -ForegroundColor Green
Write-Host ""
Write-Host "📍 Access URLs:" -ForegroundColor Cyan
Write-Host "   Backend API:    http://localhost:8080/api/v1" -ForegroundColor White
Write-Host "   User Web App:   http://localhost:5173" -ForegroundColor White
Write-Host "   Admin App:      http://localhost:5174" -ForegroundColor White
Write-Host ""
Write-Host "💡 Tip: Check the terminal windows for actual port numbers" -ForegroundColor Yellow
Write-Host ""

