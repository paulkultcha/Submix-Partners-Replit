# Replit.md - Affiliate Program Management System

## Overview

This is a full-stack web application for managing an affiliate program. It's built with a modern tech stack including React, TypeScript, Express, and PostgreSQL with Drizzle ORM. The application allows administrators to manage partners, track commissions, create coupons, handle payouts, and generate reports.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Components**: Radix UI primitives with shadcn/ui design system
- **Styling**: Tailwind CSS with CSS variables for theming
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Passport.js with local strategy and session-based auth
- **Session Storage**: PostgreSQL session store
- **Validation**: Zod schemas shared between frontend and backend
- **Development**: tsx for TypeScript execution

### Database Design
- **ORM**: Drizzle with PostgreSQL dialect
- **Schema Location**: `shared/schema.ts` for type safety across frontend/backend
- **Tables**: users, partners, commissions, coupons, payouts, clicks
- **Relationships**: Proper foreign key constraints and relations defined

## Key Components

### Database Schema
- **Users**: Admin authentication with username/email/password
- **Partners**: Affiliate partner management with commission rates and tracking
- **Commissions**: Transaction tracking with status management
- **Coupons**: Discount codes linked to partners
- **Payouts**: Payment processing and history
- **Clicks**: Click tracking for referral attribution

### Authentication System
- Session-based authentication using Passport.js
- Password hashing with scrypt
- Protected routes with authentication middleware
- Role-based access (admin role implemented)

### API Structure
- RESTful endpoints for all major entities
- CRUD operations for partners, commissions, coupons
- Analytics endpoints for dashboard metrics
- Proper error handling and validation

### UI Components
- Responsive design with mobile-first approach
- Reusable component library based on Radix UI
- Dark mode support built into the design system
- Form validation with real-time feedback

## Data Flow

### Authentication Flow
1. User submits credentials via login form
2. Backend validates against database using Passport.js
3. Session created and stored in PostgreSQL
4. Frontend receives user data and updates auth state
5. Protected routes check authentication status

### Partner Management Flow
1. Admin creates partner through form dialog
2. System generates unique referral code
3. Partner data stored with commission settings
4. Real-time updates to partner table via React Query
5. Analytics automatically updated

### Commission Tracking Flow
1. External system reports conversion via API
2. Commission calculated based on partner's rate
3. Status tracking (pending → approved → paid)
4. Partner statistics updated automatically
5. Payout system processes approved commissions

## External Dependencies

### Core Dependencies
- **Database**: Neon serverless PostgreSQL
- **UI Framework**: Radix UI components
- **Validation**: Zod for schema validation
- **Query Management**: TanStack Query
- **Authentication**: Passport.js with local strategy

### Development Dependencies
- **Build**: Vite with React plugin
- **TypeScript**: Full type safety across stack
- **Database Management**: Drizzle Kit for migrations
- **Development Server**: Express with Vite middleware

### Third-Party Integrations
- **Email**: SendGrid for email notifications
- **Payments**: Stripe for payment processing
- **Session Storage**: PostgreSQL-based session store

## Deployment Strategy

### Build Process
1. Frontend builds to `dist/public` via Vite
2. Backend bundles to `dist/index.js` via esbuild
3. Database migrations applied via Drizzle Kit
4. Static files served by Express in production

### Environment Configuration
- **Development**: Vite dev server with HMR
- **Production**: Express serves static files and API
- **Database**: PostgreSQL connection via environment variables
- **Session**: Secure session configuration with trust proxy

### Key Environment Variables
- `DATABASE_URL`: PostgreSQL connection string
- `SESSION_SECRET`: Session encryption key
- `NODE_ENV`: Environment mode (development/production)

The application is designed for deployment on platforms like Replit, with proper configuration for both development and production environments. The architecture supports horizontal scaling through stateless API design and external session storage.

## Recent Changes

### January 2025
- **Implemented partner approval workflow** - Partners now default to "pending" status and require admin approval before commission tracking is enabled
- **Fixed partner creation password constraint** - Resolved database constraint error by adding proper password hashing for admin-created partners
- **Enhanced partner dashboard with status indicators** - Added pending approval notifications for partners awaiting admin approval
- **Implemented advanced commission payout models** - Added three new commission processing features: (1) New customers only commissions, (2) Commission payouts after coupon value fully used, (3) Adjustable commission payment periods per partner
- **Added comprehensive commission processor** - Created server-side commission processing engine with customer history tracking, commission validation rules, and automated payment decisions
- **Enhanced partner management with advanced settings** - Added new fields for commission period months, new customers only flag, and coupon usage requirements in both admin and partner portals
- **Added company name and website fields** - Enhanced partner management system to include company name and website information in both admin and partner portals, including registration forms and partner table display
- **Fixed partner authentication persistence** - Resolved issue where partner signups weren't working for returning users by implementing proper password hashing and session management
- **Added forgot password functionality** - Implemented complete password reset flow with email-based token system for partner authentication
- **Enhanced partner portal security** - Updated all partner API endpoints to use proper session-based authentication instead of mock data
- **Fixed partner payouts page** - Created missing partner payouts page with comprehensive functionality including payout history, status tracking, and request capabilities
- **Integrated PostgreSQL database** - Set up proper database integration with sessions table for persistent authentication across partner portal

### December 2024
- **Fixed coupon creation validation** - Resolved "Expected number, received string" error by updating form validation schema and data type conversion
- **Implemented coupon edit functionality** - Added EditCouponDialog component with full CRUD operations and proper form validation
- **Enhanced partner display** - Updated coupon table to show actual partner names instead of IDs
- **Fixed toast notification positioning** - Improved notification system visibility and positioning for better user experience
- **Implemented functional reports system** - Added CSV export functionality for all report types (Partner Performance, Commission Report, Coupon Usage, Payout History) with proper data formatting and error handling

### Key Features Completed
- Partner management with create, edit, and delete operations
- Coupon management with full CRUD functionality
- Working notification system with toast messages
- Comprehensive reports with CSV export capabilities
- Database integration with PostgreSQL and proper error handling
- Partner authentication system with persistent sessions
- Forgot password functionality with secure token-based reset
- Complete partner portal with dashboard, performance tracking, commission management, and payout history