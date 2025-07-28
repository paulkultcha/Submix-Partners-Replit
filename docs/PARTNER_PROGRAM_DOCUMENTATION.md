# Submix Partner Program - Technical Documentation

## Overview

The Submix Partner Program is a comprehensive B2B2C affiliate management platform that enables external partners to promote Submix services and earn commissions. This documentation provides technical details for the engineering team.

## System Architecture

### Technology Stack
- **Frontend**: React 18 with TypeScript, Vite build system
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Session-based with Passport.js and PostgreSQL session store
- **UI Framework**: Radix UI with shadcn/ui design system
- **Styling**: Tailwind CSS with custom Submix branding

### Core Components
1. **Admin Portal** - Partner management, commission oversight, reporting
2. **Partner Portal** - Self-service dashboard for affiliates
3. **API Layer** - RESTful endpoints for all operations
4. **Commission Engine** - Advanced processing with configurable rules
5. **Analytics System** - Real-time tracking and reporting

## Database Schema

### Partners Table
```sql
CREATE TABLE partners (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  company_name TEXT,
  website TEXT,
  status TEXT NOT NULL DEFAULT 'active', -- active, pending, inactive
  commission_rate NUMERIC(5,2) NOT NULL, -- percentage
  commission_type TEXT NOT NULL DEFAULT 'percentage', -- percentage, fixed
  payout_method TEXT NOT NULL DEFAULT 'paypal', -- paypal, stripe, manual
  payout_details TEXT, -- JSON string for payout info
  referral_code TEXT NOT NULL UNIQUE,
  click_count INTEGER DEFAULT 0 NOT NULL,
  conversion_count INTEGER DEFAULT 0 NOT NULL,
  total_revenue NUMERIC(10,2) DEFAULT '0' NOT NULL,
  total_commissions NUMERIC(10,2) DEFAULT '0' NOT NULL,
  -- Advanced commission features
  new_customers_only BOOLEAN DEFAULT false NOT NULL,
  commission_period_months INTEGER DEFAULT 12 NOT NULL,
  require_coupon_usage BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);
```

### Commissions Table
```sql
CREATE TABLE commissions (
  id SERIAL PRIMARY KEY,
  partner_id INTEGER REFERENCES partners(id) NOT NULL,
  order_id TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  order_value NUMERIC(10,2) NOT NULL,
  commission_amount NUMERIC(10,2) NOT NULL,
  commission_rate NUMERIC(5,2) NOT NULL,
  coupon_code TEXT,
  coupon_discount NUMERIC(10,2) DEFAULT '0' NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, approved, paid, refunded, blocked
  payout_id INTEGER,
  -- Advanced commission tracking
  is_new_customer BOOLEAN DEFAULT true NOT NULL,
  customer_first_order_date TIMESTAMP,
  commission_valid_until TIMESTAMP,
  coupon_value_used NUMERIC(10,2) DEFAULT '0' NOT NULL,
  coupon_value_required NUMERIC(10,2) DEFAULT '0' NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);
```

### Other Key Tables
- **coupons** - Discount codes linked to partners
- **payouts** - Payment processing and history
- **clicks** - Click tracking for referral attribution
- **customer_history** - Customer order history for new customer detection
- **fraud_alerts** - Fraud detection and prevention
- **audit_logs** - Comprehensive audit trail

## API Endpoints

### Partner Management (Admin)
```
GET    /api/partners              # List all partners
POST   /api/partners              # Create new partner
PUT    /api/partners/:id          # Update partner
DELETE /api/partners/:id          # Delete partner
GET    /api/partners/:id/stats    # Get partner statistics
```

### Partner Authentication
```
POST   /api/partner/register      # Partner self-registration
POST   /api/partner/login         # Partner login
POST   /api/partner/logout        # Partner logout
GET    /api/partner/me            # Get current partner data
PUT    /api/partner/me            # Update partner profile
```

### Commission Management
```
GET    /api/commissions           # List commissions (admin)
POST   /api/commissions           # Create commission
PUT    /api/commissions/:id       # Update commission status
GET    /api/partner/commissions   # Get partner's commissions
```

### Coupon Management
```
GET    /api/coupons               # List all coupons
POST   /api/coupons               # Create coupon
PUT    /api/coupons/:id           # Update coupon
DELETE /api/coupons/:id           # Delete coupon
```

### Analytics & Reporting
```
GET    /api/analytics/dashboard   # Dashboard metrics
GET    /api/analytics/top-partners # Top performing partners
GET    /api/analytics/revenue     # Revenue analytics
GET    /api/reports/partners      # Partner performance report
GET    /api/reports/commissions   # Commission report
GET    /api/reports/coupons       # Coupon usage report
```

## Commission Processing Engine

### Advanced Commission Models

#### 1. New Customers Only
- **Purpose**: Only pay commissions for first-time customers
- **Implementation**: Tracks customer email history in `customer_history` table
- **Configuration**: `new_customers_only` boolean field per partner

#### 2. Commission Period Limits
- **Purpose**: Limit commission payments to specific time periods
- **Implementation**: `commission_period_months` field sets duration
- **Calculation**: Commission valid until `customer_first_order_date + period`

#### 3. Coupon Value Requirements
- **Purpose**: Pay commissions only after coupon value is fully utilized
- **Implementation**: Tracks `coupon_value_used` vs `coupon_value_required`
- **Configuration**: `require_coupon_usage` boolean per partner

### Commission Status Flow
```
Order Created → pending
Admin Review → approved/blocked
Payment Processing → paid
Issue Resolution → refunded
```

## Partner Portal Features

### Dashboard
- Performance metrics and KPIs
- Referral tools (code and link generation)
- Recent commission activity
- Click and conversion tracking

### Profile Management
- Personal and company information
- Password management
- Payout method configuration
- Commission preferences

### Performance Analytics
- Conversion rates and trends
- Revenue tracking
- Customer acquisition metrics
- Historical performance data

### Commission Management
- Commission history and status
- Payment tracking
- Dispute management
- Performance-based insights

## Security Features

### Authentication & Authorization
- Session-based authentication with PostgreSQL session store
- Role-based access control (admin vs partner)
- Password hashing with scrypt
- Secure session management with trust proxy

### Fraud Detection
- Suspicious click pattern detection
- Unusual conversion rate monitoring
- Geographic anomaly detection
- Rapid signup prevention

### Data Protection
- GDPR compliance features
- Data retention policies
- Privacy controls
- Secure data handling

### Audit Trail
- Comprehensive logging of all actions
- User activity tracking
- System change monitoring
- Compliance reporting

## Integration Points

### External Services
- **SendGrid**: Email notifications and communications
- **Stripe**: Payment processing for payouts
- **Analytics**: Custom tracking and reporting

### Webhook Endpoints
```
POST /api/webhooks/order-created    # Order creation notification
POST /api/webhooks/payment-success  # Payment confirmation
POST /api/webhooks/refund-processed # Refund notification
```

## Development Guidelines

### Code Organization
```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   └── lib/            # Utility functions
├── server/                 # Express backend
│   ├── routes.ts           # API route definitions
│   ├── storage.ts          # Database operations
│   ├── auth.ts             # Authentication logic
│   └── commissionProcessor.ts # Commission engine
├── shared/                 # Shared types and schemas
│   └── schema.ts           # Drizzle schema definitions
└── docs/                   # Documentation
```

### Database Migrations
```bash
# Push schema changes to database
npm run db:push

# Generate migration files
npm run db:generate

# Apply migrations
npm run db:migrate
```

### Environment Variables
```
DATABASE_URL=postgresql://user:pass@host:port/dbname
SESSION_SECRET=your-session-secret
SENDGRID_API_KEY=your-sendgrid-key
STRIPE_SECRET_KEY=your-stripe-key
NODE_ENV=development|production
```

## Testing Strategy

### Unit Tests
- Database operations (storage layer)
- Commission calculation logic
- Authentication functions
- Utility functions

### Integration Tests
- API endpoint functionality
- Database transactions
- External service integrations
- Authentication flows

### End-to-End Tests
- Partner registration and login
- Commission creation and processing
- Payout workflows
- Admin management tasks

## Deployment

### Production Setup
1. Database provisioning (PostgreSQL)
2. Environment configuration
3. SSL certificate setup
4. Session store configuration
5. Monitoring and logging setup

### Scaling Considerations
- Database connection pooling
- Session store optimization
- CDN integration for static assets
- Load balancing for high availability

## Monitoring & Analytics

### Key Metrics
- Partner acquisition rate
- Commission processing volume
- Average commission value
- Payment processing time
- System performance metrics

### Alerting
- Fraud detection alerts
- Payment processing failures
- System performance issues
- Security incidents

## Troubleshooting

### Common Issues
1. **Session persistence**: Check session store configuration
2. **Commission calculation**: Verify partner settings and rules
3. **Payment processing**: Check Stripe integration and credentials
4. **Authentication**: Verify password hashing and session management

### Debug Tools
- Server-side logging with detailed partner session tracking
- Database query logging
- Performance monitoring
- Error tracking and reporting

## API Authentication

### Session-Based Authentication
The system uses session-based authentication with the following flow:

1. **Partner Login**: POST to `/api/partner/login` with credentials
2. **Session Creation**: Server sets `req.session.partnerId`
3. **Subsequent Requests**: Session cookie automatically included
4. **Authentication Check**: All protected routes verify `req.session.partnerId`

### Session Management
```javascript
// Session configuration
app.use(session({
  store: new PostgreSQLStore({
    conString: process.env.DATABASE_URL,
    tableName: 'sessions'
  }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: true, // HTTPS only in production
    maxAge: 7 * 24 * 60 * 60 * 1000 // 1 week
  }
}));
```

## Partner Approval Workflow

### Registration Types
1. **Self-Registration**: Partners register themselves (status: "pending")
2. **Admin-Created**: Admin creates partners directly (status: "active")

### Approval Process
- Self-registered partners require admin approval before commission tracking
- Admin can approve/reject partners through the admin portal
- Email notifications sent on status changes

## Commission Calculation Examples

### Standard Commission
```javascript
// 5% commission on $100 order
orderValue = 100.00
commissionRate = 5.00
commissionAmount = orderValue * (commissionRate / 100) = $5.00
```

### New Customer Only
```javascript
// Check if customer is new
const isNewCustomer = !await customerHistory.exists(customerEmail);
if (partner.newCustomersOnly && !isNewCustomer) {
  // Skip commission for existing customer
  return null;
}
```

### Commission Period Limit
```javascript
// Check if commission period is still valid
const commissionValidUntil = addMonths(
  customerFirstOrderDate, 
  partner.commissionPeriodMonths
);
if (new Date() > commissionValidUntil) {
  // Commission period expired
  return null;
}
```

## Error Handling

### API Error Responses
```javascript
// Standard error format
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {} // Additional error details
}
```

### Common Error Codes
- `UNAUTHORIZED`: Authentication required
- `FORBIDDEN`: Insufficient permissions
- `VALIDATION_ERROR`: Input validation failed
- `NOT_FOUND`: Resource not found
- `DUPLICATE_ENTRY`: Unique constraint violation

## Performance Optimizations

### Database Indexing
- Partner email for fast lookups
- Commission partner_id for queries
- Session expiration for cleanup
- Referral codes for tracking

### Caching Strategy
- Partner data caching (5-minute TTL)
- Commission calculations caching
- Analytics data caching
- Static asset caching via CDN

### Query Optimization
- Use database relations for efficient joins
- Pagination for large result sets
- Selective field loading
- Connection pooling for performance

This documentation provides a comprehensive overview of the Submix Partner Program system for your engineering team. The system is production-ready with enterprise-level features including fraud detection, GDPR compliance, and comprehensive audit trails.