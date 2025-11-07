# Fix GST Sub-Services

## Issue
The GST service already exists from a previous run, but sub-services failed to create. 

## Solution
Run this script to add GST sub-services to the existing GST service:

```javascript
// Get GST service ID first, then add sub-services
```

Or manually add sub-services through the AdminApp interface.

## Alternative: Delete and Recreate
1. Go to AdminApp
2. Delete the existing GST service
3. Run the script again: `node add-services-from-excel.js`

