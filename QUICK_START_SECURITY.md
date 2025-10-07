# Quick Start: Security & Performance Fixes

## 🚀 Quick Deployment Steps

### 1. Apply Database Migration
```bash
# Production
npx prisma migrate deploy

# Development
npx prisma migrate dev
```

### 2. Verify Environment Variables
Required variables in `.env`:
```env
DATABASE_URL="postgresql://..."
DATABASE_URL_DIRECT="postgresql://..."
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="https://your-domain.com"
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="your-key-here"
```

### 3. Test Application
```bash
npm run build
npm start
```

Check console for:
- ✅ Environment configuration validated successfully
- No connection errors
- No memory warnings

---

## 🔒 Security Features Enabled

### CSRF Protection
**Endpoint:** `GET /api/csrf`

**Client Usage:**
```typescript
// 1. Get CSRF token
const response = await fetch('/api/csrf');
const { token } = await response.json();

// 2. Include in requests
await fetch('/api/products', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-CSRF-Token': token,
  },
  body: JSON.stringify(data),
});
```

### Rate Limiting
- **Limit:** 100 requests per minute per IP
- **Upload Limit:** 10 uploads per minute per IP
- **Automatic cleanup:** Prevents memory leaks

### Session Security
- **Duration:** 7 days (reduced from 30)
- **Refresh:** Every 1 hour
- **Privacy:** Email addresses hashed in logs

### Input Validation
- **Search queries:** Max 100 characters
- **Pagination:** Max 50 items per page
- **File uploads:** Max 10MB
- **Image dimensions:** Max 10000x10000 pixels

---

## 📊 Performance Optimizations

### Database Indexes
All frequently queried fields now have indexes:
- Product search by name, status, visibility
- Order filtering by status, user, date
- Category hierarchical queries
- Coupon code lookups

### Connection Pooling
- Singleton Prisma client
- Automatic connection recycling
- Retry logic for transient failures

### Request Timeouts
- All API routes: 30 seconds max
- Prevents runaway processes
- Protects against resource exhaustion

---

## 🧪 Testing Checklist

### Before Going Live:
- [ ] Database migration applied
- [ ] Environment variables validated
- [ ] CSRF token endpoint accessible
- [ ] Image upload/delete works
- [ ] Session expiration tested
- [ ] Rate limiting verified

### Load Testing:
```bash
# Test API performance
ab -n 1000 -c 50 http://localhost:3000/api/products

# Monitor memory usage
# Should remain stable under load
```

---

## 🐛 Troubleshooting

### "Environment validation failed"
**Solution:** Check `.env` file for missing required variables

### "Can't reach database server"
**Solution:** Verify `DATABASE_URL_DIRECT` is correct and database is accessible

### "Invalid or missing CSRF token"
**Solution:** Ensure client is calling `/api/csrf` and including token in headers

### "Connection pool exhausted"
**Solution:** Check `connection_limit` parameter in `DATABASE_URL`

### Rate limit errors
**Solution:** Normal behavior - wait 1 minute or adjust limits in `api-middleware.ts`

---

## 📝 Key Files Reference

### Configuration
- `next.config.ts` - Server configuration
- `.env` - Environment variables
- `prisma/schema.prisma` - Database schema

### Security
- `src/lib/csrf.ts` - CSRF protection
- `src/lib/api-middleware.ts` - Rate limiting
- `src/server/auth.ts` - Authentication
- `src/lib/env-validation.ts` - Environment validation

### Database
- `src/lib/prisma.ts` - Connection management
- `src/lib/db-serverless.ts` - Database wrapper

### Storage
- `src/lib/storage.ts` - Image upload/delete

---

## 🔄 Maintenance Tasks

### Weekly:
- Monitor error logs for unusual patterns
- Check storage usage
- Review rate limit logs

### Monthly:
- Update dependencies
- Review security advisories
- Analyze query performance

### Quarterly:
- Security audit
- Performance optimization review
- Backup verification

---

## 📞 Support

For detailed information, see:
- `SECURITY_FIXES_CHANGELOG.md` - Complete changelog
- Application logs - Detailed error messages
- Prisma documentation - Database queries

---

**Last Updated:** January 2025