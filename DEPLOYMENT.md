# Deployment Guide

This guide covers deploying the Wedding Planner SaaS platform to various hosting providers.

## Prerequisites

- PostgreSQL database
- Node.js 18+ runtime environment
- Environment variables configured

---

## Deployment Options

### Option 1: Vercel (Recommended)

Vercel is optimized for Next.js applications and provides the easiest deployment experience.

#### Steps:

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Set up PostgreSQL Database**
   - Use [Railway](https://railway.app), [Neon](https://neon.tech), or [Supabase](https://supabase.com)
   - Get your DATABASE_URL

3. **Configure Environment Variables in Vercel**
   - Go to your project settings in Vercel dashboard
   - Add all environment variables:
     ```
     DATABASE_URL=postgresql://...
     JWT_SECRET=your-secret-key
     JWT_REFRESH_SECRET=your-refresh-secret
     NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
     ```

4. **Deploy**
   ```bash
   vercel
   ```

5. **Run Database Migrations**
   ```bash
   # After first deployment
   vercel env pull .env.local
   npx prisma migrate deploy
   ```

#### Automatic Deployments

Connect your GitHub repository to Vercel for automatic deployments on every push.

---

### Option 2: Railway

Railway provides integrated PostgreSQL and easy deployment.

#### Steps:

1. **Create a Railway Account**
   - Visit [railway.app](https://railway.app)

2. **Create New Project**
   - Select "Deploy from GitHub repo"
   - Choose your repository

3. **Add PostgreSQL**
   - Click "New" → "Database" → "PostgreSQL"
   - Railway automatically provides DATABASE_URL

4. **Configure Environment Variables**
   ```
   JWT_SECRET=your-secret-key
   JWT_REFRESH_SECRET=your-refresh-secret
   NEXT_PUBLIC_APP_URL=https://your-app.up.railway.app
   ```

5. **Deploy**
   - Railway automatically detects Next.js and deploys
   - Run migrations in Railway CLI:
     ```bash
     railway run npx prisma migrate deploy
     ```

---

### Option 3: DigitalOcean App Platform

#### Steps:

1. **Create a DigitalOcean Account**

2. **Create PostgreSQL Database**
   - Create a managed PostgreSQL database
   - Get connection string

3. **Create New App**
   - Choose "GitHub" as source
   - Select your repository

4. **Configure Build Settings**
   ```
   Build Command: npm run build
   Run Command: npm start
   ```

5. **Set Environment Variables**
   ```
   DATABASE_URL=postgresql://...
   JWT_SECRET=...
   JWT_REFRESH_SECRET=...
   NEXT_PUBLIC_APP_URL=https://...
   ```

6. **Add Build Script** (in App Platform dashboard)
   ```bash
   npx prisma generate
   npx prisma migrate deploy
   ```

---

### Option 4: AWS (EC2 + RDS)

For enterprise deployments with full control.

#### Components:
- EC2 instance for Next.js application
- RDS for PostgreSQL database
- S3 for file storage (optional)
- CloudFront for CDN (optional)

#### Steps:

1. **Set up RDS PostgreSQL Database**
   - Create RDS PostgreSQL instance
   - Note connection details

2. **Launch EC2 Instance**
   - Choose Ubuntu 22.04 LTS
   - Select t3.medium or larger
   - Configure security groups (ports 22, 80, 443, 3000)

3. **Connect to EC2 and Install Dependencies**
   ```bash
   sudo apt update
   sudo apt install nodejs npm postgresql-client nginx
   sudo npm install -g pm2
   ```

4. **Clone and Setup Application**
   ```bash
   git clone <your-repo>
   cd WP-Saas
   npm install
   ```

5. **Configure Environment Variables**
   ```bash
   nano .env
   # Add all environment variables
   ```

6. **Run Migrations**
   ```bash
   npx prisma generate
   npx prisma migrate deploy
   npm run prisma:seed  # optional
   ```

7. **Build Application**
   ```bash
   npm run build
   ```

8. **Setup PM2**
   ```bash
   pm2 start npm --name "wedding-planner" -- start
   pm2 startup
   pm2 save
   ```

9. **Configure Nginx** (optional, for reverse proxy)
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

10. **Setup SSL with Let's Encrypt**
    ```bash
    sudo apt install certbot python3-certbot-nginx
    sudo certbot --nginx -d your-domain.com
    ```

---

### Option 5: Docker Deployment

#### Docker Setup:

1. **Create Dockerfile**
   ```dockerfile
   FROM node:18-alpine AS deps
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci

   FROM node:18-alpine AS builder
   WORKDIR /app
   COPY --from=deps /app/node_modules ./node_modules
   COPY . .
   RUN npx prisma generate
   RUN npm run build

   FROM node:18-alpine AS runner
   WORKDIR /app
   ENV NODE_ENV production

   COPY --from=builder /app/next.config.js ./
   COPY --from=builder /app/public ./public
   COPY --from=builder /app/.next ./.next
   COPY --from=builder /app/node_modules ./node_modules
   COPY --from=builder /app/package.json ./package.json
   COPY --from=builder /app/prisma ./prisma

   EXPOSE 3000
   CMD ["npm", "start"]
   ```

2. **Create docker-compose.yml**
   ```yaml
   version: '3.8'
   services:
     db:
       image: postgres:14
       environment:
         POSTGRES_USER: wedding_user
         POSTGRES_PASSWORD: secure_password
         POSTGRES_DB: wedding_planner
       volumes:
         - postgres_data:/var/lib/postgresql/data
       ports:
         - "5432:5432"

     app:
       build: .
       ports:
         - "3000:3000"
       environment:
         DATABASE_URL: postgresql://wedding_user:secure_password@db:5432/wedding_planner
         JWT_SECRET: your-secret
         JWT_REFRESH_SECRET: your-refresh-secret
         NEXT_PUBLIC_APP_URL: http://localhost:3000
       depends_on:
         - db

   volumes:
     postgres_data:
   ```

3. **Deploy**
   ```bash
   docker-compose up -d
   docker-compose exec app npx prisma migrate deploy
   ```

---

## Post-Deployment Checklist

- [ ] Database migrations completed successfully
- [ ] All environment variables configured
- [ ] SSL certificate installed (production)
- [ ] Database backups configured
- [ ] Monitoring setup (e.g., Sentry, LogRocket)
- [ ] Test all critical endpoints
- [ ] Test authentication flow
- [ ] Test RSVP functionality
- [ ] Configure domain DNS
- [ ] Setup email service (if using notifications)

---

## Environment Variables Reference

### Required Variables:
```env
DATABASE_URL=postgresql://user:password@host:port/database
JWT_SECRET=<generate-strong-secret>
JWT_REFRESH_SECRET=<generate-strong-secret>
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### Optional Variables:
```env
# Email configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=noreply@weddingplanner.com

# File upload limits
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./public/uploads
```

---

## Database Backup Strategy

### Automated Backups (Railway/Heroku/DO):
Most managed database services provide automated backups.

### Manual Backup:
```bash
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql
```

### Restore from Backup:
```bash
psql $DATABASE_URL < backup-20240101.sql
```

---

## Scaling Considerations

### Horizontal Scaling:
- Use load balancer (AWS ALB, Nginx)
- Deploy multiple Next.js instances
- Use Redis for session storage

### Database Scaling:
- Enable connection pooling (PgBouncer)
- Read replicas for read-heavy operations
- Database indexing optimization

### CDN:
- Use CloudFront (AWS) or Cloudflare
- Cache static assets
- Optimize images with Next.js Image component

---

## Monitoring & Logging

### Recommended Tools:
- **Vercel Analytics** - For Vercel deployments
- **Sentry** - Error tracking
- **LogRocket** - Session replay
- **DataDog** - Infrastructure monitoring
- **Prisma Pulse** - Database monitoring

### Setup Example (Sentry):
```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

---

## Security Checklist

- [ ] Use HTTPS in production
- [ ] Strong JWT secrets (32+ characters)
- [ ] Database credentials secured
- [ ] CORS properly configured
- [ ] Rate limiting implemented
- [ ] Input validation on all endpoints
- [ ] SQL injection protection (Prisma handles this)
- [ ] XSS protection
- [ ] Regular dependency updates

---

## Troubleshooting

### Common Issues:

**Build fails with Prisma error:**
```bash
npx prisma generate
npm run build
```

**Database connection fails:**
- Verify DATABASE_URL format
- Check database server is running
- Verify network/firewall settings

**Authentication not working:**
- Check JWT_SECRET is set
- Verify token is passed in Authorization header
- Check token expiration

---

## Performance Optimization

1. **Enable Next.js caching**
2. **Use database indexes**
3. **Implement Redis caching**
4. **Optimize images**
5. **Use CDN for static assets**
6. **Enable gzip compression**
7. **Lazy load components**

---

## Support & Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Vercel Documentation](https://vercel.com/docs)

---

**Last Updated:** 2024
