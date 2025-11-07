# Service Structure Summary

## Database Structure

### Main Service Categories (in `service` collection)
These are the 5 main categories that appear on the landing page:

1. **ITR** - Income Tax Return services
2. **GST** - Goods and Service Tax services
3. **Tax Planning** - Tax planning and consultancy services
4. **Registration** - Business registration services
5. **Outsourcing** - Accounting and bookkeeping outsourcing

### Sub-Services (in `subService` collection)
These are the detailed services that appear on the Services page, grouped by category.

## Service Hierarchy

```
Main Service (Category)
  └── Sub-Services (Detailed Services)
```

## 1. ITR Category

**Sub-Services:**
- ITR 1 - For individuals with salary, one house property, and other sources
- ITR 2 - For individuals with capital gains, crypto, foreign income
- ITR 3 - For individuals with business/professional income
- ITR 4 - For individuals with presumptive business income

## 2. GST Category

**Sub-Services:**
- GSTR-1 Monthly
- GSTR-3B Monthly
- GSTR-1/IFF Monthly
- GSTR-3B Quarterly
- GSTR- Composition Dealer
- GSTR-1 vs. Books of Accounts
- GSTR-2A/2B vs. Books of Accounts
- Other Reconciliations

## 3. Tax Planning Category

**Sub-Services:**
- Individual Tax Planning
- Business Tax Planning
- Tax Notice and Scrutiny Support

## 4. Registration Category

**Sub-Services:**
- Company Registration
- LLP Registration
- Partnership Firm Registration
- GST Registration
- PAN & TAN Registration

## 5. Outsourcing Category

**Sub-Services:**
- Bookkeeping Services
- Payroll Management
- Financial Reporting
- Tax Compliance Services

## UserWebApp Display Flow

### Landing Page (ServicesSection)
- **Shows:** Main service categories (ITR, GST, Tax Planning, Registration, Outsourcing)
- **Source:** `GET /api/v1/services` → Filters by category
- **Action:** Clicking "Get Started" navigates to Services page

### Services Page (ServicesPage)
- **Shows:** Sub-services grouped by category
- **Source:** `GET /api/v1/sub-services/all` → Filters by main service category
- **Category Filters:** ITR, GST, Tax Planning, Registration, Outsourcing
- **Action:** Users can view details and get quotations for sub-services

## Data Flow

1. **Backend** → MongoDB `facto_app` database
2. **Main Services** → `service` collection (5 categories)
3. **Sub-Services** → `subService` collection (linked via `serviceId`)
4. **UserWebApp Landing** → Fetches main services from `service` collection
5. **UserWebApp Services Page** → Fetches sub-services from `subService` collection

## MongoDB Collections

- **`service`** - Main categories (ITR, GST, Tax Planning, Registration, Outsourcing)
- **`subService`** - Detailed services under each category

## Connection String

```
mongodb+srv://factoDB:facto%400938$@facto-cluster.2yoapwv.mongodb.net/facto_app?appName=facto-cluster
```

Database: `facto_app`

