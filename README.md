# Submix Partners (Replit)

A comprehensive B2B2C affiliate program platform for Submix.io featuring advanced partner management, intelligent commission processing, and flexible tracking mechanisms.

## 🏗️ Architecture

- **Frontend**: React 18 with TypeScript, Vite, and Tailwind CSS
- **Backend**: Express.js with TypeScript and PostgreSQL
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Session-based with Passport.js
- **UI Components**: Radix UI with shadcn/ui design system

## 🚀 Features

### Partner Management
- Complete partner lifecycle management
- Advanced commission models (new customers only, coupon-based, period-based)
- Partner approval workflow with status tracking
- Comprehensive partner portal with dashboard

### Commission Processing
- Intelligent commission calculation engine
- Multiple payout models and validation rules
- Automated payment processing
- Customer history tracking and fraud detection

### Security & Compliance
- GDPR compliance with data privacy tools
- Comprehensive audit trail system
- Fraud detection and prevention
- Secure password reset with token-based system

### Reporting & Analytics
- Real-time partner performance metrics
- CSV export functionality for all reports
- Commission tracking and payout history
- Coupon usage analytics

## 🎨 Branding

Fully integrated with Submix branding including:
- Official Submix logos and favicon
- Custom Aktiv Grotesk typography family
- Consistent brand colors and design system

## 📚 Documentation

Comprehensive technical documentation available in the `docs/` directory:

- **Technical Documentation**: System architecture and implementation details
- **API Reference**: Complete API documentation with examples
- **Deployment Guide**: Production deployment and operations
- **README**: Project overview and quick start guide

## 🛠️ Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Push database schema
npm run db:push

# Generate database migrations
npm run db:generate
```

## 🔧 Environment Variables

Required environment variables:
- `DATABASE_URL`: PostgreSQL connection string
- `SESSION_SECRET`: Session encryption key
- `NODE_ENV`: Environment mode (development/production)

## 📦 Deployment

Built for deployment on Replit with proper configuration for both development and production environments. The application supports horizontal scaling through stateless API design and external session storage.

## 🏢 Company

Built for **Submix.io** - Advanced affiliate program management platform.

## 📄 License

MIT License - See LICENSE file for details.# Submix-Partners-Replit
