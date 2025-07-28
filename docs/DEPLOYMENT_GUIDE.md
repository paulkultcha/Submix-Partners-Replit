# Submix Partner Program - Deployment Guide

## Overview

This guide provides step-by-step instructions for deploying the Submix Partner Program to production environments.

## Prerequisites

### System Requirements
- Node.js 18+ 
- PostgreSQL 13+
- Redis (optional, for session scaling)
- SSL Certificate for HTTPS
- Domain name and DNS configuration

### Environment Setup
- Production server (minimum 2GB RAM, 2 CPU cores)
- Database server (separate recommended)
- Load balancer (for high availability)
- CDN for static assets (optional)

## Database Setup

### PostgreSQL Configuration

1. **Create Database**
```sql
CREATE DATABASE submix_partner_program;
CREATE USER submix_app WITH PASSWORD 'secure_password_here';
GRANT ALL PRIVILEGES ON DATABASE submix_partner_program TO submix_app;
```

2. **Apply Schema**
```bash
# Push schema to database
npm run db:push

# Or use migrations
npm run db:generate
npm run db:migrate
```

3. **Database Indexes (Production Optimization)**
```sql
-- Performance indexes
CREATE INDEX idx_partners_email ON partners(email);
CREATE INDEX idx_partners_referral_code ON partners(referral_code);
CREATE INDEX idx_commissions_partner_id ON commissions(partner_id);
CREATE INDEX idx_commissions_status ON commissions(status);
CREATE INDEX idx_commissions_created_at ON commissions(created_at);
CREATE INDEX idx_sessions_expire ON sessions(expire);
CREATE INDEX idx_clicks_partner_id ON clicks(partner_id);
CREATE INDEX idx_payouts_partner_id ON payouts(partner_id);

-- Composite indexes for common queries
CREATE INDEX idx_commissions_partner_status ON commissions(partner_id, status);
CREATE INDEX idx_partners_status_created ON partners(status, created_at);
```

### Session Storage Table
The sessions table is automatically created by the connect-pg-simple middleware:

```sql
CREATE TABLE "sessions" (
  "sid" varchar NOT NULL COLLATE "default",
  "sess" json NOT NULL,
  "expire" timestamp(6) NOT NULL
) WITH (OIDS=FALSE);

ALTER TABLE "sessions" ADD CONSTRAINT "sessions_pkey" PRIMARY KEY ("sid");
CREATE INDEX "IDX_session_expire" ON "sessions" ("expire");
```

## Environment Variables

### Production Environment File
Create `.env.production`:

```env
# Database
DATABASE_URL=postgresql://submix_app:secure_password@db-host:5432/submix_partner_program

# Security
SESSION_SECRET=your-super-secure-session-secret-64-chars-minimum
NODE_ENV=production

# External Services
SENDGRID_API_KEY=your-sendgrid-api-key
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret

# Server Configuration
PORT=5000
HOST=0.0.0.0
TRUST_PROXY=true

# CORS Configuration (if needed)
CORS_ORIGIN=https://your-domain.com

# Logging
LOG_LEVEL=info
```

### Security Best Practices
- Use strong, unique passwords for all services
- Store secrets in environment variables, never in code
- Use a secrets management service in production
- Rotate credentials regularly
- Enable database SSL connections

## Application Build

### Production Build Process

1. **Install Dependencies**
```bash
npm ci --production=false
```

2. **Build Frontend**
```bash
npm run build
```

3. **Build Backend**
```bash
npm run build:server
```

4. **Production Dependencies Only**
```bash
npm ci --production=true
```

### Docker Deployment

**Dockerfile:**
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --production=false

# Copy source code
COPY . .

# Build application
RUN npm run build
RUN npm run build:server

# Remove dev dependencies
RUN npm ci --production=true && npm cache clean --force

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Set permissions
USER nextjs

EXPOSE 5000

CMD ["node", "dist/index.js"]
```

**docker-compose.yml:**
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://submix_app:password@db:5432/submix_partner_program
      - SESSION_SECRET=your-session-secret
    depends_on:
      - db
      - redis
    restart: unless-stopped

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=submix_partner_program
      - POSTGRES_USER=submix_app
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
    restart: unless-stopped

volumes:
  postgres_data:
```

## Web Server Configuration

### Nginx Configuration
**nginx.conf:**
```nginx
events {
    worker_connections 1024;
}

http {
    upstream app {
        server app:5000;
    }

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=login:10m rate=5r/m;
    limit_req_zone $binary_remote_addr zone=api:10m rate=100r/m;

    server {
        listen 80;
        server_name your-domain.com;
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name your-domain.com;

        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;
        ssl_protocols TLSv1.2 TLSv1.3;

        # Security headers
        add_header X-Frame-Options DENY;
        add_header X-Content-Type-Options nosniff;
        add_header X-XSS-Protection "1; mode=block";
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";

        # Static files
        location /assets/ {
            expires 1y;
            add_header Cache-Control "public, immutable";
            proxy_pass http://app;
        }

        # API rate limiting
        location /api/partner/login {
            limit_req zone=login burst=5 nodelay;
            proxy_pass http://app;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        location /api/ {
            limit_req zone=api burst=20 nodelay;
            proxy_pass http://app;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Frontend application
        location / {
            proxy_pass http://app;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
```

## Process Management

### PM2 Configuration
**ecosystem.config.js:**
```javascript
module.exports = {
  apps: [{
    name: 'submix-partner-program',
    script: 'dist/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    max_memory_restart: '1G',
    restart_delay: 4000,
    max_restarts: 10,
    min_uptime: '10s'
  }]
};
```

**Start with PM2:**
```bash
npm install -g pm2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Systemd Service (Alternative)
**submix-partner-program.service:**
```ini
[Unit]
Description=Submix Partner Program
After=network.target

[Service]
Type=simple
User=submix
WorkingDirectory=/opt/submix-partner-program
ExecStart=/usr/bin/node dist/index.js
Restart=on-failure
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=submix-partner
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

## Monitoring & Logging

### Application Monitoring
```javascript
// Add to server/index.ts
const prometheus = require('prom-client');

// Create metrics
const httpDuration = new prometheus.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status']
});

const httpRequests = new prometheus.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status']
});

// Metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', prometheus.register.contentType);
  res.end(await prometheus.register.metrics());
});
```

### Health Check Endpoint
```javascript
// Add to server/routes.ts
app.get('/health', async (req, res) => {
  try {
    // Check database connection
    await storage.healthCheck();
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message
    });
  }
});
```

### Log Configuration
```javascript
// server/logger.js
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

module.exports = logger;
```

## SSL Certificate

### Let's Encrypt Setup
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## Backup Strategy

### Database Backup Script
```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"
DB_NAME="submix_partner_program"

# Create backup
pg_dump -h localhost -U submix_app $DB_NAME | gzip > $BACKUP_DIR/backup_$DATE.sql.gz

# Keep only last 30 days
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +30 -delete

# Upload to S3 (optional)
aws s3 cp $BACKUP_DIR/backup_$DATE.sql.gz s3://your-backup-bucket/
```

### Automated Backup Cron
```bash
# Daily backup at 2 AM
0 2 * * * /opt/submix-partner-program/scripts/backup.sh
```

## Performance Optimization

### Database Optimization
```sql
-- Analyze and vacuum tables regularly
ANALYZE partners;
ANALYZE commissions;
VACUUM ANALYZE sessions;

-- Set appropriate work_mem
ALTER SYSTEM SET work_mem = '256MB';

-- Connection pooling settings
ALTER SYSTEM SET max_connections = '200';
ALTER SYSTEM SET shared_buffers = '256MB';
```

### Application Optimization
```javascript
// Connection pooling
const { Pool } = require('@neondatabase/serverless');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

### CDN Configuration
```javascript
// Static asset serving
app.use('/assets', express.static('dist/public', {
  maxAge: '1y',
  etag: true,
  lastModified: true
}));
```

## Security Hardening

### Server Security
```bash
# Update system
sudo apt update && sudo apt upgrade

# Configure firewall
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable

# Fail2ban for intrusion prevention
sudo apt install fail2ban
```

### Application Security
```javascript
// Security middleware
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api', limiter);
```

## Deployment Checklist

### Pre-Deployment
- [ ] Database schema applied
- [ ] Environment variables configured
- [ ] SSL certificates installed
- [ ] DNS records configured
- [ ] Backup strategy implemented
- [ ] Monitoring setup complete

### Deployment Steps
1. [ ] Build application
2. [ ] Deploy to staging environment
3. [ ] Run integration tests
4. [ ] Deploy to production
5. [ ] Verify health checks
6. [ ] Test critical functionality
7. [ ] Monitor error logs

### Post-Deployment
- [ ] Verify all services running
- [ ] Check monitoring dashboards
- [ ] Test partner registration/login
- [ ] Verify commission processing
- [ ] Test admin functionality
- [ ] Confirm email notifications

## Scaling Considerations

### Horizontal Scaling
- Load balancer configuration
- Session store clustering (Redis)
- Database read replicas
- CDN for static assets

### Vertical Scaling
- CPU and memory monitoring
- Database connection pooling
- Application performance profiling
- Query optimization

## Troubleshooting

### Common Issues

1. **Session persistence issues**
   - Check PostgreSQL connection
   - Verify session table exists
   - Check session secret configuration

2. **Database connection errors**
   - Verify DATABASE_URL format
   - Check database server status
   - Validate connection limits

3. **SSL certificate issues**
   - Check certificate expiration
   - Verify certificate chain
   - Test with SSL checker tools

4. **Performance problems**
   - Monitor database queries
   - Check memory usage
   - Analyze slow endpoints

### Debug Commands
```bash
# Check application logs
pm2 logs submix-partner-program

# Monitor system resources
htop
iotop

# Check database connections
sudo -u postgres psql -c "SELECT * FROM pg_stat_activity;"

# Test SSL certificate
openssl s_client -connect your-domain.com:443
```

This deployment guide provides comprehensive instructions for taking the Submix Partner Program from development to production.