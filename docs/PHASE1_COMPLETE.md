# Phase 1 Setup - Environment Configuration

## ✅ Phase 1 Completed!

### What was installed:
- ✅ `@upstash/redis` - For rate limiting
- ✅ `@upstash/ratelimit` - For request throttling
- ✅ `ioredis` - Already installed
- ✅ Created `lib/session.ts` - Session management utilities
- ✅ Created `lib/centrifugo.ts` - Real-time messaging helper
- ✅ Created `lib/rate-limit.ts` - Rate limiting utilities

---

## 🔧 Next Step: Configure Environment Variables

### Required for Auth System:

Add these to your `.env` file (see `.env.example` for full template):

```bash
# Centrifugo (already configured in centrifugo.json)
CENTRIFUGO_API_URL="http://localhost:8000/api"
CENTRIFUGO_API_KEY="centrifugo_api_key"

# Upstash Redis (for rate limiting)
# Sign up at https://upstash.com (free tier available)
UPSTASH_REDIS_REST_URL="https://your-instance.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-token-here"
```

### Optional (can skip for now):

Upstash Redis is optional - if not configured, rate limiting will be disabled but everything else works.

---

## 📖 How to Use the New Utilities

### 1. Session Management (`lib/session.ts`)

```typescript
import { invalidateUserSessions, validateCurrentSession } from '@/lib/session';

// When deleting a user
await invalidateUserSessions(userId, 'Account deleted');

// When changing password
await invalidateUserSessions(userId, 'Password changed');

// Check if current session is still valid
const isValid = await validateCurrentSession();
```

### 2. Real-Time Notifications (`lib/centrifugo.ts`)

```typescript
import { centrifugoPublish } from '@/lib/centrifugo';

// Notify user of role change
await centrifugoPublish(`user:${userId}:role-changed`, {
    newRole: 'SELLER',
    message: 'You have been promoted to Seller!'
});

// Notify user of session invalidation
await centrifugoPublish(`user:${userId}:session-invalidated`, {
    reason: 'Password changed'
});
```

### 3. Rate Limiting (`lib/rate-limit.ts`)

```typescript
import { loginRateLimit, checkRateLimit } from '@/lib/rate-limit';

// In API route
const ip = req.headers.get("x-forwarded-for") ?? "unknown";
const { success, retryAfter } = await checkRateLimit(ip, loginRateLimit);

if (!success) {
    return NextResponse.json(
        { error: 'Too many login attempts' },
        { 
            status: 429,
            headers: { 'Retry-After': retryAfter.toString() }
        }
    );
}
```

---

## 🧪 Test the Utilities

### Test Session Management
```bash
# In your terminal or create a test file
npx tsx scripts/test-session-utils.ts
```

### Test Centrifugo Connection
```bash
# Verify Centrifugo is running
curl http://localhost:8000/health

# Expected: {"healthy":true}
```

---

## ⏭️ What's Next?

**Phase 2**: Update NextAuth configuration to use database sessions

**Timeline**: Ready to start Phase 2 once environment variables are configured

**Estimated Time**: 2-3 hours for Phase 2

---

## 🔒 Security Features Added

✅ **Session invalidation** - Instant logout on critical events  
✅ **Real-time notifications** - Users know immediately when roles/access changes  
✅ **Rate limiting** - Protect against brute force and spam  
✅ **Graceful fallbacks** - Works even if Redis/Centrifugo not configured  

---

## 📝 Notes

- All utilities include proper TypeScript types
- All utilities have error handling with console logging
- All utilities work without breaking existing code
- Rate limiting is optional (gracefully disabled if no Redis)
- Centrifugo messaging is optional (gracefully skipped if not configured)
