# Advanced Commission Processing Test

## Test Scenario
Testing the three new commission payout models:
1. **New customers only** - Only pay commissions for first-time customers
2. **Coupon usage requirement** - Only pay commissions after coupon value is fully used
3. **Adjustable commission periods** - Set custom commission validity periods (1-60 months)

## Test Partner Settings
- Name: "Paul J Test 2"
- Commission Rate: 5%
- New Customers Only: ✓ Enabled
- Commission Period: 6 months
- Require Coupon Usage: ✓ Enabled

## Test Cases

### Test Case 1: New Customer with Coupon
```bash
curl -X POST http://localhost:5000/api/track-conversion \
  -H "Content-Type: application/json" \
  -d '{
    "referralCode": "1783794F34B17CC0",
    "orderId": "order_new_customer_001",
    "customerEmail": "newcustomer@example.com",
    "orderValue": 100,
    "couponCode": "SAVE20",
    "couponDiscount": 20
  }'
```

**Expected Result**: 
- Customer history created (new customer)
- Commission calculated: $5 (5% of $100)
- Payment decision: Based on coupon usage requirement
- Status: Pending until coupon value fully used

### Test Case 2: Existing Customer
```bash
curl -X POST http://localhost:5000/api/track-conversion \
  -H "Content-Type: application/json" \
  -d '{
    "referralCode": "1783794F34B17CC0",
    "orderId": "order_existing_customer_001",
    "customerEmail": "newcustomer@example.com",
    "orderValue": 150,
    "couponCode": "SAVE30",
    "couponDiscount": 30
  }'
```

**Expected Result**: 
- Customer history updated (existing customer)
- Commission calculated: $7.50 (5% of $150)
- Payment decision: BLOCKED (partner only pays new customers)
- Status: Blocked with reason "Partner only pays for new customers"

## Commission Processing Logic

### Customer History Tracking
- ✓ Tracks first order date and partner
- ✓ Maintains total order count and spend
- ✓ Identifies new vs returning customers

### Commission Validation Rules
- ✓ New customer only validation
- ✓ Coupon usage threshold tracking
- ✓ Commission period validation (6 months from order)

### Payment Decision Engine
- ✓ Automated approval/blocking based on partner settings
- ✓ Clear reasoning for payment decisions
- ✓ Real-time commission processing

## Database Schema Updates
- ✓ `partners` table: `newCustomersOnly`, `commissionPeriodMonths`, `requireCouponUsage`
- ✓ `commissions` table: `isNewCustomer`, `customerFirstOrderDate`, `commissionValidUntil`, `couponValueUsed`, `couponValueRequired`
- ✓ `customer_history` table: Complete customer journey tracking

## Frontend Integration
- ✓ Partner creation form includes advanced settings
- ✓ Partner edit form includes advanced settings
- ✓ Validation for commission period (1-60 months)
- ✓ User-friendly checkbox controls for commission rules

## API Endpoints
- ✓ `/api/track-conversion` - Enhanced with commission processor
- ✓ `/api/partners` - Includes advanced commission fields
- ✓ Commission processor returns detailed decision logic

The advanced commission system is now fully operational and ready for production use!