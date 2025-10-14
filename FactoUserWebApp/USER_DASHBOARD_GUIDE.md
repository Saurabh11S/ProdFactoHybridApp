# User Dashboard Guide

## Overview

The User Dashboard provides a comprehensive view of all user services, payments, and account information. It's designed to help users track their service subscriptions, payment history, and manage their account effectively.

## Features

### 📊 Summary Statistics
- **Total Services**: Shows the number of services purchased by the user
- **Total Payments**: Displays the total number of payment transactions
- **Total Spent**: Shows the total amount spent on completed payments

### 📋 Tab Navigation
The dashboard is organized into three main tabs:

#### 1. Profile Tab
- **Personal Information**: Full name, email, phone number, role
- **Account Information**: Member since, last login, account status
- **Additional Information**: Father's name, PAN number, Aadhar number (if available)
- **Action Buttons**: Explore services, go to home, logout

#### 2. My Services Tab
- **Service Cards**: Each purchased service is displayed as a card showing:
  - Service title and description
  - Price and duration
  - Purchase date and expiry date (if applicable)
  - Payment status (Paid, Pending, Failed, Refunded)
  - Selected features (if any)
- **Empty State**: Shows when no services are purchased with a call-to-action to explore services

#### 3. Payments Tab
- **Payment History**: Complete list of all payment transactions
- **Payment Details**: Each payment shows:
  - Payment ID and transaction ID
  - Amount and currency
  - Payment method and status
  - Date and time
  - Items included in the payment
- **Empty State**: Shows when no payments are made with a call-to-action to explore services

## Data Sources

### Backend API Endpoints
The dashboard fetches data from the following endpoints:

1. **User Purchases**: `GET /api/v1/user-purchases`
   - Returns all services purchased by the user
   - Includes service details, features, and status

2. **Payment Orders**: `GET /api/v1/payment-orders`
   - Returns all payment transactions
   - Includes payment status, amounts, and transaction details

3. **Quotations**: `GET /api/v1/quotations`
   - Returns all quotation requests
   - Includes service selections and pricing

### Service Data Mapping
The dashboard includes a comprehensive mapping of all available services:

#### Tax Services
- ITR-1: Salaried + 1 House property Plan (₹1,499)
- ITR-2: Salary + more than 1 House property, Capital gain (₹1,999)
- ITR-3: Business Income Plan (₹2,499)
- ITR-4: Presumptive Taxation Plan (₹1,999)

#### GST Services
- GSTR-1 & GSTR-3B Monthly (₹2,999)
- GSTR-1/IFF & GSTR-3B Quarterly (₹4,999)
- GST Registration (₹1,999)
- GST Compliance for Composite Dealer (₹1,499)
- LUT Filing (₹999)

#### Consultancy on Tax Planning
- Tax Planning Consultancy (₹3,999)
- Business Tax Consultancy (₹5,999)

#### Registrations
- Company Registration (₹8,999)
- LLP Registration (₹6,999)
- Partnership Registration (₹2,999)
- Sole Proprietorship (₹1,999)
- Trademark Registration (₹4,999)
- Import Export Code (₹2,499)

#### Outsourcing Services
- Bookkeeping Services (₹4,999/month)
- Payroll Management (₹2,999/month)
- Tax Compliance Outsourcing (₹6,999/month)

## Payment Status Indicators

### Color Coding
- **Green**: Paid/Completed payments
- **Yellow**: Pending payments
- **Red**: Failed payments
- **Blue**: Refunded payments
- **Gray**: Unknown status

### Status Types
- **Paid**: Payment completed successfully
- **Pending**: Payment is being processed
- **Failed**: Payment failed or was declined
- **Refunded**: Payment was refunded

## User Experience Features

### Loading States
- Shows spinner and loading message while fetching data
- Graceful handling of loading states for better UX

### Error Handling
- Displays error messages if data fetching fails
- Provides retry options and clear error descriptions

### Empty States
- Shows helpful messages when no data is available
- Includes call-to-action buttons to guide users

### Responsive Design
- Works on desktop, tablet, and mobile devices
- Adaptive grid layouts for different screen sizes

## Technical Implementation

### State Management
- Uses React hooks for state management
- Fetches data on component mount
- Handles loading and error states

### Data Fetching
- Parallel API calls for better performance
- Error handling for individual API calls
- Graceful degradation if some APIs fail

### Service Mapping
- Comprehensive service data mapping
- Easy to extend with new services
- Consistent data structure across all services

## Future Enhancements

### Planned Features
1. **Service Management**: Allow users to cancel or modify services
2. **Payment Methods**: Manage saved payment methods
3. **Notifications**: Real-time updates for service status changes
4. **Export Data**: Download payment history and service reports
5. **Service Analytics**: Usage statistics and insights

### API Improvements
1. **Real-time Updates**: WebSocket integration for live updates
2. **Pagination**: Handle large datasets efficiently
3. **Filtering**: Filter services and payments by various criteria
4. **Search**: Search through services and payments

## Usage

### For Users
1. Navigate to the profile page
2. Use the tab navigation to switch between sections
3. View your service subscriptions and payment history
4. Track your spending and service status

### For Developers
1. The dashboard automatically fetches user data on load
2. Service data is mapped using the `serviceDataMap` object
3. Payment status is determined by matching purchase and payment data
4. All data is displayed in a responsive, accessible format

## Troubleshooting

### Common Issues
1. **No data showing**: Check if user is logged in and APIs are working
2. **Loading forever**: Check network connection and API endpoints
3. **Wrong service data**: Verify service mapping in `serviceDataMap`
4. **Payment status incorrect**: Check payment order data structure

### Debug Information
- Check browser console for API call logs
- Verify authentication token is present
- Check network tab for failed API requests
- Review error messages in the UI

