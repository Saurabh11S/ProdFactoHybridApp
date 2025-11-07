# MongoDB Collections for Services

## Connection String
```
mongodb+srv://factoDB:facto%400938$@facto-cluster.2yoapwv.mongodb.net/?appName=facto-cluster
```

## Collections Used for Services Display

### 1. **`service` Collection** (Main Services)
This collection stores the main service categories.

**Collection Name:** `service`

**Schema:**
```javascript
{
  _id: ObjectId,
  title: String,              // e.g., "Goods and Service Tax (GST)", "Income Tax Return (ITR) 1"
  category: String,           // e.g., "Tax Filing", "Professional Services"
  description: String,         // Service description
  isActive: Boolean,           // Whether service is active
  icon: String,               // Icon URL
  features: [String],         // Array of feature strings
  createdAt: Date,
  updatedAt: Date
}
```

**Example Document:**
```json
{
  "_id": ObjectId("..."),
  "title": "Goods and Service Tax (GST)",
  "category": "Tax Filing",
  "description": "File your GSTR-1, GSTR-3B, and other GST returns.",
  "isActive": true,
  "icon": "http",
  "features": ["GST Monthly Regular tax payer"],
  "createdAt": ISODate("..."),
  "updatedAt": ISODate("...")
}
```

### 2. **`subService` Collection** (Sub-Services - What Users See on Services Page)
This collection stores the detailed services that are displayed on the Services page.

**Collection Name:** `subService`

**Schema:**
```javascript
{
  _id: ObjectId,
  serviceCode: String,        // Unique code, e.g., "GSTR1-MONTHLY"
  serviceId: ObjectId,        // Reference to service collection
  title: String,              // e.g., "GSTR-1 Monthly", "GSTR-3B Monthly"
  description: String,         // Sub-service description
  features: [String],         // Array of feature strings
  price: Number,              // Base price (currently 0)
  period: String,             // "monthly" | "quarterly" | "half_yearly" | "yearly" | "one_time"
  isActive: Boolean,          // Whether sub-service is active
  pricingStructure: [{
    price: Number,
    period: String
  }],
  requests: [{                // Additional requirements/options
    name: String,
    priceModifier: Number,
    needsQuotation: Boolean,
    inputType: "dropdown" | "checkbox",
    isMultipleSelect: Boolean,
    options: [{
      name: String,
      priceModifier: Number,
      needsQuotation: Boolean
    }]
  }],
  createdAt: Date,
  updatedAt: Date
}
```

**Example Document:**
```json
{
  "_id": ObjectId("..."),
  "serviceCode": "GSTR1-MONTHLY",
  "serviceId": ObjectId("..."),  // Reference to GST service
  "title": "GSTR-1 Monthly",
  "description": "Monthly GSTR-1 filing for regular taxpayers",
  "features": ["Monthly filing", "Invoice-wise details"],
  "price": 0,
  "period": "monthly",
  "isActive": true,
  "pricingStructure": [
    { "price": 0, "period": "monthly" },
    { "price": 0, "period": "quarterly" },
    { "price": 0, "period": "yearly" }
  ],
  "requests": [],
  "createdAt": ISODate("..."),
  "updatedAt": ISODate("...")
}
```

## API Endpoints

### Services Page Display (What You See)
The Services page calls: **`GET /api/v1/sub-services/all`**

This endpoint:
- Queries the `subService` collection
- Filters: `{ isActive: true }`
- Populates the `serviceId` field with service details (title, category)
- Returns all active sub-services

**Backend Controller:**
```typescript
// FactoBackendServices/src/controllers/subService.controller.ts
export const getAllSubServices = async (req, res, next) => {
  const subServices = await db.SubService.find({ isActive: true })
    .populate('serviceId', 'title category');
  // Returns subServices from 'subService' collection
}
```

## MongoDB Queries

### Query All Active Sub-Services (What's Displayed)
```javascript
db.subService.find({ isActive: true })
  .populate('serviceId', 'title category')
```

### Query All Active Main Services
```javascript
db.service.find({ isActive: true })
```

### Query Sub-Services by Service Category
```javascript
// First get service IDs by category
const services = db.service.find({ category: "Tax Filing", isActive: true });
const serviceIds = services.map(s => s._id);

// Then get sub-services
db.subService.find({ 
  serviceId: { $in: serviceIds }, 
  isActive: true 
})
```

### Query Specific Sub-Service
```javascript
db.subService.findOne({ 
  serviceCode: "GSTR1-MONTHLY" 
})
```

## Summary

**Services displayed on the Services page come from:**
- **Collection:** `subService`
- **Filter:** `{ isActive: true }`
- **API Endpoint:** `/api/v1/sub-services/all`

**The services shown on screen like:**
- "GSTR-1 Monthly"
- "GSTR-3B Monthly"  
- "GST Monthly Ragular tax payer"

**Are all stored in the `subService` MongoDB collection.**

The main services (like "Goods and Service Tax (GST)") are stored in the `service` collection and are referenced by the `serviceId` field in the `subService` documents.

