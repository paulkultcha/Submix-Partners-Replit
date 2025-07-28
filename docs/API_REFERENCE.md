# Submix Partner Program - API Reference

## Overview

This document provides detailed API reference for the Submix Partner Program system. All endpoints use JSON for request/response bodies unless otherwise specified.

## Authentication

The API uses session-based authentication. After successful login, all subsequent requests automatically include session credentials via cookies.

### Base URL
- Development: `http://localhost:5000/api`
- Production: `https://your-domain.com/api`

## Partner Authentication Endpoints

### Register Partner
Creates a new partner account (self-registration).

```http
POST /api/partner/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "companyName": "Acme Corp", // optional
  "website": "https://acme.com" // optional
}
```

**Response (201 Created):**
```json
{
  "id": 15,
  "name": "John Doe",
  "email": "john@example.com",
  "companyName": "Acme Corp",
  "website": "https://acme.com",
  "status": "pending",
  "commissionRate": "5.00",
  "commissionType": "percentage",
  "payoutMethod": "paypal",
  "referralCode": "A1B2C3D4E5F6G7H8",
  "clickCount": 0,
  "conversionCount": 0,
  "totalRevenue": "0.00",
  "totalCommissions": "0.00",
  "newCustomersOnly": false,
  "commissionPeriodMonths": 12,
  "requireCouponUsage": false,
  "createdAt": "2025-01-29T12:00:00.000Z",
  "updatedAt": "2025-01-29T12:00:00.000Z"
}
```

### Login Partner
Authenticates a partner and creates a session.

```http
POST /api/partner/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response (200 OK):**
```json
{
  "id": 15,
  "name": "John Doe",
  "email": "john@example.com",
  // ... same fields as registration response
}
```

**Error Response (401 Unauthorized):**
```json
{
  "error": "Invalid credentials"
}
```

### Logout Partner
Terminates the partner session.

```http
POST /api/partner/logout
```

**Response (200 OK):**
```json
{
  "success": true
}
```

### Get Current Partner
Retrieves the currently authenticated partner's information.

```http
GET /api/partner/me
```

**Response (200 OK):**
```json
{
  "id": 15,
  "name": "John Doe",
  "email": "john@example.com",
  "companyName": "Acme Corp",
  "website": "https://acme.com",
  "status": "active",
  "commissionRate": "5.00",
  "commissionType": "percentage",
  "payoutMethod": "paypal",
  "payoutDetails": null,
  "referralCode": "A1B2C3D4E5F6G7H8",
  "clickCount": 142,
  "conversionCount": 23,
  "totalRevenue": "4580.50",
  "totalCommissions": "229.03",
  "newCustomersOnly": false,
  "commissionPeriodMonths": 12,
  "requireCouponUsage": false,
  "createdAt": "2025-01-29T12:00:00.000Z",
  "updatedAt": "2025-01-29T15:30:00.000Z"
}
```

### Update Partner Profile
Updates the partner's profile information.

```http
PUT /api/partner/me
Content-Type: application/json

{
  "name": "John Smith",
  "companyName": "Acme Corporation",
  "website": "https://acme.com",
  "payoutMethod": "stripe",
  "payoutDetails": "{\"stripe_account_id\": \"acct_123456789\"}"
}
```

**Response (200 OK):**
```json
{
  "id": 15,
  "name": "John Smith",
  // ... updated partner data
}
```

### Change Partner Password
Updates the partner's password.

```http
PUT /api/partner/change-password
Content-Type: application/json

{
  "currentPassword": "oldPassword123",
  "newPassword": "newSecurePassword456"
}
```

**Response (200 OK):**
```json
{
  "success": true
}
```

## Partner Data Endpoints

### Get Partner Commissions
Retrieves commissions for the authenticated partner.

```http
GET /api/partner/commissions
```

**Response (200 OK):**
```json
[
  {
    "id": 101,
    "partnerId": 15,
    "orderId": "ORDER_2025_001",
    "customerEmail": "customer@example.com",
    "orderValue": "199.99",
    "commissionAmount": "10.00",
    "commissionRate": "5.00",
    "couponCode": "SAVE20",
    "couponDiscount": "39.99",
    "status": "approved",
    "payoutId": null,
    "isNewCustomer": true,
    "customerFirstOrderDate": "2025-01-29T10:00:00.000Z",
    "commissionValidUntil": "2026-01-29T10:00:00.000Z",
    "couponValueUsed": "39.99",
    "couponValueRequired": "0.00",
    "createdAt": "2025-01-29T10:15:00.000Z",
    "updatedAt": "2025-01-29T14:30:00.000Z"
  }
]
```

### Get Partner Clicks
Retrieves click tracking data for the authenticated partner.

```http
GET /api/partner/clicks
```

**Response (200 OK):**
```json
[
  {
    "id": 501,
    "partnerId": 15,
    "ipAddress": "192.168.1.100",
    "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "referrer": "https://google.com",
    "convertedAt": "2025-01-29T10:15:00.000Z",
    "orderId": "ORDER_2025_001",
    "createdAt": "2025-01-29T10:00:00.000Z"
  }
]
```

### Get Partner Payouts
Retrieves payout history for the authenticated partner.

```http
GET /api/partner/payouts
```

**Response (200 OK):**
```json
[
  {
    "id": 301,
    "partnerId": 15,
    "amount": "125.50",
    "method": "paypal",
    "status": "completed",
    "paymentId": "PAYID-123456789",
    "paymentDetails": "{\"paypal_email\": \"john@example.com\"}",
    "processedAt": "2025-01-28T16:00:00.000Z",
    "createdAt": "2025-01-25T09:00:00.000Z",
    "updatedAt": "2025-01-28T16:00:00.000Z"
  }
]
```

## Admin Endpoints

### List All Partners
Retrieves all partners (admin only).

```http
GET /api/partners
```

**Response (200 OK):**
```json
[
  {
    "id": 15,
    "name": "John Doe",
    "email": "john@example.com",
    "status": "active",
    "commissionRate": "5.00",
    "totalCommissions": "229.03",
    "conversionCount": 23,
    "createdAt": "2025-01-29T12:00:00.000Z"
  },
  // ... more partners
]
```

### Create Partner (Admin)
Creates a new partner through admin portal.

```http
POST /api/partners
Content-Type: application/json

{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "commissionRate": "7.5",
  "commissionType": "percentage",
  "status": "active",
  "companyName": "Smith Enterprises",
  "website": "https://smith.com",
  "newCustomersOnly": true,
  "commissionPeriodMonths": 6,
  "requireCouponUsage": false
}
```

**Response (201 Created):**
```json
{
  "id": 16,
  "name": "Jane Smith",
  "email": "jane@example.com",
  "status": "active",
  "referralCode": "B2C3D4E5F6G7H8I9",
  // ... full partner data
}
```

### Update Partner (Admin)
Updates partner information (admin only).

```http
PUT /api/partners/15
Content-Type: application/json

{
  "status": "active",
  "commissionRate": "6.0",
  "newCustomersOnly": true
}
```

**Response (200 OK):**
```json
{
  "id": 15,
  "name": "John Doe",
  "status": "active",
  "commissionRate": "6.00",
  // ... updated partner data
}
```

### Delete Partner (Admin)
Deletes a partner (admin only).

```http
DELETE /api/partners/15
```

**Response (204 No Content)**

## Commission Management

### List All Commissions (Admin)
Retrieves all commissions with filtering options.

```http
GET /api/commissions?status=pending&partnerId=15&limit=50&offset=0
```

**Query Parameters:**
- `status` (optional): Filter by commission status
- `partnerId` (optional): Filter by partner ID
- `limit` (optional): Number of results (default: 50)
- `offset` (optional): Pagination offset (default: 0)

**Response (200 OK):**
```json
[
  {
    "id": 101,
    "partnerId": 15,
    "partnerName": "John Doe",
    "orderId": "ORDER_2025_001",
    "customerEmail": "customer@example.com",
    "orderValue": "199.99",
    "commissionAmount": "10.00",
    "status": "pending",
    "createdAt": "2025-01-29T10:15:00.000Z"
  }
]
```

### Create Commission
Creates a new commission record.

```http
POST /api/commissions
Content-Type: application/json

{
  "partnerId": 15,
  "orderId": "ORDER_2025_002",
  "customerEmail": "customer2@example.com",
  "orderValue": "299.99",
  "commissionRate": "5.0",
  "couponCode": "PARTNER15",
  "couponDiscount": "30.00"
}
```

**Response (201 Created):**
```json
{
  "id": 102,
  "partnerId": 15,
  "orderId": "ORDER_2025_002",
  "customerEmail": "customer2@example.com",
  "orderValue": "299.99",
  "commissionAmount": "15.00",
  "commissionRate": "5.00",
  "status": "pending",
  "isNewCustomer": true,
  "createdAt": "2025-01-29T11:00:00.000Z"
}
```

### Update Commission Status
Updates commission status (admin only).

```http
PUT /api/commissions/101
Content-Type: application/json

{
  "status": "approved"
}
```

**Response (200 OK):**
```json
{
  "id": 101,
  "status": "approved",
  "updatedAt": "2025-01-29T15:00:00.000Z"
}
```

## Coupon Management

### List Coupons
Retrieves all coupons (admin only).

```http
GET /api/coupons
```

**Response (200 OK):**
```json
[
  {
    "id": 201,
    "code": "PARTNER15_SAVE20",
    "partnerId": 15,
    "partnerName": "John Doe",
    "discountType": "percentage",
    "discountValue": "20.00",
    "usageLimit": 100,
    "usageCount": 15,
    "status": "active",
    "expiresAt": "2025-12-31T23:59:59.000Z",
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
]
```

### Create Coupon
Creates a new coupon.

```http
POST /api/coupons
Content-Type: application/json

{
  "code": "PARTNER15_SAVE30",
  "partnerId": 15,
  "discountType": "percentage",
  "discountValue": "30.00",
  "usageLimit": 50,
  "status": "active",
  "expiresAt": "2025-06-30T23:59:59.000Z"
}
```

**Response (201 Created):**
```json
{
  "id": 202,
  "code": "PARTNER15_SAVE30",
  "partnerId": 15,
  "discountType": "percentage",
  "discountValue": "30.00",
  "usageLimit": 50,
  "usageCount": 0,
  "status": "active",
  "expiresAt": "2025-06-30T23:59:59.000Z",
  "createdAt": "2025-01-29T16:00:00.000Z"
}
```

### Update Coupon
Updates coupon information.

```http
PUT /api/coupons/201
Content-Type: application/json

{
  "status": "inactive",
  "usageLimit": 200
}
```

**Response (200 OK):**
```json
{
  "id": 201,
  "status": "inactive",
  "usageLimit": 200,
  "updatedAt": "2025-01-29T16:30:00.000Z"
}
```

### Delete Coupon
Deletes a coupon.

```http
DELETE /api/coupons/201
```

**Response (204 No Content)**

## Analytics & Reporting

### Dashboard Analytics
Retrieves dashboard metrics (admin only).

```http
GET /api/analytics/dashboard
```

**Response (200 OK):**
```json
{
  "totalPartners": 125,
  "activePartners": 98,
  "pendingPartners": 15,
  "totalCommissions": "45,230.50",
  "pendingCommissions": "2,150.75",
  "totalRevenue": "890,450.25",
  "conversionRate": "3.2",
  "averageOrderValue": "156.78"
}
```

### Top Partners
Retrieves top performing partners.

```http
GET /api/analytics/top-partners?limit=10
```

**Response (200 OK):**
```json
[
  {
    "id": 15,
    "name": "John Doe",
    "totalCommissions": "1,250.75",
    "conversionCount": 45,
    "conversionRate": "4.2",
    "rank": 1
  },
  // ... more partners
]
```

### Revenue Analytics
Retrieves revenue data by month.

```http
GET /api/analytics/revenue?months=12
```

**Response (200 OK):**
```json
[
  {
    "month": "2025-01",
    "revenue": "75,230.50",
    "commissions": "3,761.53",
    "orders": 340
  },
  {
    "month": "2024-12",
    "revenue": "68,450.25",
    "commissions": "3,422.51",
    "orders": 312
  }
  // ... more months
]
```

## Reports

### Partner Performance Report
Generates partner performance report.

```http
GET /api/reports/partners?format=csv&startDate=2025-01-01&endDate=2025-01-31
```

**Query Parameters:**
- `format`: `json` or `csv` (default: json)
- `startDate` (optional): Start date filter (YYYY-MM-DD)
- `endDate` (optional): End date filter (YYYY-MM-DD)

**Response (200 OK):**
```
Content-Type: text/csv
Content-Disposition: attachment; filename="partners_report_2025-01-29.csv"

Partner Name,Email,Total Revenue,Total Commissions,Conversion Count,Conversion Rate,Status
John Doe,john@example.com,4580.50,229.03,23,3.2%,active
Jane Smith,jane@example.com,3240.75,162.04,18,2.8%,active
```

### Commission Report
Generates commission report.

```http
GET /api/reports/commissions?format=csv&status=approved&partnerId=15
```

**Response (200 OK):**
```
Content-Type: text/csv

Order ID,Customer Email,Order Value,Commission Amount,Status,Created Date
ORDER_2025_001,customer@example.com,199.99,10.00,approved,2025-01-29T10:15:00.000Z
ORDER_2025_002,customer2@example.com,299.99,15.00,approved,2025-01-29T11:00:00.000Z
```

## Webhooks

### Order Created Webhook
External systems can notify the partner program when orders are created.

```http
POST /api/webhooks/order-created
Content-Type: application/json
Authorization: Bearer webhook_secret_token

{
  "orderId": "ORDER_2025_003",
  "customerEmail": "customer3@example.com",
  "orderValue": 450.00,
  "items": [
    {
      "productId": "PROD_001",
      "quantity": 2,
      "unitPrice": 225.00
    }
  ],
  "couponCode": "PARTNER15_SAVE20",
  "referralCode": "A1B2C3D4E5F6G7H8",
  "customerData": {
    "firstName": "Alice",
    "lastName": "Johnson",
    "ipAddress": "192.168.1.150"
  }
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "commissionId": 103,
  "commissionAmount": "22.50",
  "partnerId": 15
}
```

## Error Handling

### Standard Error Format
All API errors follow this format:

```json
{
  "error": "Human readable error message",
  "code": "ERROR_CODE",
  "details": {
    "field": "Additional error details"
  }
}
```

### Common HTTP Status Codes
- `200 OK` - Request successful
- `201 Created` - Resource created successfully
- `204 No Content` - Request successful, no content returned
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `409 Conflict` - Resource conflict (e.g., duplicate email)
- `422 Unprocessable Entity` - Validation errors
- `500 Internal Server Error` - Server error

### Validation Errors
Field validation errors return detailed information:

```json
{
  "error": "Validation failed",
  "code": "VALIDATION_ERROR",
  "details": [
    {
      "field": "email",
      "message": "Invalid email format"
    },
    {
      "field": "commissionRate",
      "message": "Commission rate must be between 0 and 100"
    }
  ]
}
```

## Rate Limiting

API endpoints are rate limited to prevent abuse:
- Authentication endpoints: 5 requests per minute per IP
- General API endpoints: 100 requests per minute per authenticated user
- Webhook endpoints: 1000 requests per minute per webhook token

## SDK Examples

### JavaScript/Node.js
```javascript
// Partner login
const response = await fetch('/api/partner/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'partner@example.com',
    password: 'password123'
  }),
  credentials: 'include' // Important for session cookies
});

const partner = await response.json();

// Get partner commissions
const commissionsResponse = await fetch('/api/partner/commissions', {
  credentials: 'include'
});
const commissions = await commissionsResponse.json();
```

### Python
```python
import requests

# Create session for cookie persistence
session = requests.Session()

# Partner login
login_response = session.post('http://localhost:5000/api/partner/login', json={
    'email': 'partner@example.com',
    'password': 'password123'
})

partner = login_response.json()

# Get partner data
partner_response = session.get('http://localhost:5000/api/partner/me')
partner_data = partner_response.json()
```

### cURL Examples
```bash
# Login and save cookies
curl -c cookies.txt -X POST http://localhost:5000/api/partner/login \
  -H "Content-Type: application/json" \
  -d '{"email":"partner@example.com","password":"password123"}'

# Use saved cookies for authenticated requests
curl -b cookies.txt http://localhost:5000/api/partner/me

# Create commission with webhook
curl -X POST http://localhost:5000/api/webhooks/order-created \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer webhook_secret_token" \
  -d '{
    "orderId": "ORDER_2025_003",
    "customerEmail": "customer@example.com",
    "orderValue": 299.99,
    "referralCode": "A1B2C3D4E5F6G7H8"
  }'
```

This API reference provides comprehensive documentation for integrating with the Submix Partner Program system.