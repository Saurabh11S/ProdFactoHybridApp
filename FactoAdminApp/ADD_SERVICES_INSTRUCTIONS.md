# Instructions to Add Services from Excel Sheet

This script will add all the services and sub-services based on the Excel sheet data you provided.

## Services to be Added

### 1. Goods and Service Tax (GST)
- **Main Service**: Goods and Service Tax (GST)
- **Sub-Services**:
  - GSTR-1 Monthly
  - GSTR-3B Monthly
  - GSTR-1/IFF Monthly
  - GSTR-3B Quarterly
  - GSTR- Composition Dealer
  - GSTR-1 vs. Books of Accounts
  - GSTR-2A/2B vs. Books of Accounts
  - Other Reconciliations

### 2. Income Tax Return Services
- **ITR 1**: For individuals with salary, one house property, and other sources
- **ITR 2**: For individuals with capital gains, crypto, foreign income, etc.
- **ITR 3**: For individuals with business/professional income
- **ITR 4**: For individuals with presumptive business income

## Prerequisites

1. **Backend must be running** (production or localhost)
2. **Admin token** - You need to get an admin authentication token

## Steps to Run

### Step 1: Get Admin Token

1. Open the Admin App in your browser
2. Login with admin credentials
3. Open browser Developer Tools (F12)
4. Go to Console tab
5. Type: `localStorage.getItem('token')`
6. Copy the token value

### Step 2: Install Dependencies

```bash
cd FactoAdminApp
npm install axios form-data
```

### Step 3: Set the Token

**Option A: Set as environment variable (Recommended)**
```bash
# Windows PowerShell
$env:ADMIN_TOKEN="your_token_here"

# Windows CMD
set ADMIN_TOKEN=your_token_here

# Linux/Mac
export ADMIN_TOKEN=your_token_here
```

**Option B: Update the script directly**
Edit `add-services-from-excel.js` and replace the empty string:
```javascript
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'your_token_here';
```

### Step 4: Configure API URL (if needed)

If you want to use localhost backend instead of production:
1. Edit `add-services-from-excel.js`
2. Uncomment the localhost line:
```javascript
const API_BASE_URL = 'http://localhost:8080/api/v1'; // Local backend
```
3. Comment out the production line

### Step 5: Run the Script

```bash
node add-services-from-excel.js
```

## Expected Output

The script will:
1. ✅ Create the GST service
2. ✅ Create all 8 GST sub-services
3. ✅ Create ITR 1 service
4. ✅ Create ITR 2 service
5. ✅ Create ITR 3 service
6. ✅ Create ITR 4 service

You'll see output like:
```
🚀 Starting service creation process...
📡 API Base URL: https://facto-backend-api.onrender.com/api/v1

📦 Creating service: Goods and Service Tax (GST)
✅ Service created: Goods and Service Tax (GST)
  📝 Creating 8 sub-service(s)...
  ✅ Sub-service created: GSTR-1 Monthly
  ✅ Sub-service created: GSTR-3B Monthly
  ...
```

## Troubleshooting

### Error: ADMIN_TOKEN is required
- Make sure you've set the token as shown in Step 3

### Error: Service already exists
- The script will skip creating duplicate services
- It will try to find the existing service and continue with sub-services

### Error: Network timeout
- Check if the backend is running
- Verify the API_BASE_URL is correct
- Check your internet connection

### Error: Unauthorized
- Your token might have expired
- Get a new token by logging in again
- Make sure you're using an admin account

## Notes

- The script sets default prices to 0 - you can update them later in the admin panel
- All services are created as active by default
- The script includes error handling and will continue even if one service fails

## Customization

You can edit the `servicesData` array in `add-services-from-excel.js` to:
- Add more services
- Modify descriptions
- Change prices
- Add more features
- Add more sub-services

