# Reward Points System - Quick Reference

## 🚀 Quick Start

### Award Points to User
```typescript
import { awardPoints } from '@/lib/rewards'

await awardPoints({
  userId: 'user-id',
  points: 100,
  actionType: 'purchase_completed',
  referenceId: 'order-123',
  referenceType: 'order',
  note: 'Purchase reward'
})
```

### Redeem Points
```typescript
import { redeemPoints } from '@/lib/rewards'

await redeemPoints({
  userId: 'user-id',
  points: 50,
  referenceId: 'discount-code',
  note: 'Applied discount'
})
```

### Get User Balance
```typescript
import { getUserBalance } from '@/lib/rewards'

const balance = await getUserBalance('user-id')
console.log(balance.currentBalance) // e.g., 300
```

## 📊 API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/rewards/points` | GET | List transactions |
| `/api/rewards/points` | POST | Award/redeem points |
| `/api/rewards/balance` | GET | Get balance + stats |
| `/api/rewards/balance` | POST | Recalculate balance |
| `/api/rewards/history` | GET | Transaction history |
| `/api/rewards/stats` | GET | Admin statistics |

## 🎁 Point Values

| Action | Points | Expires |
|--------|--------|---------|
| Registration | 100 | Never |
| Listing Posted | 50 | Never |
| Purchase | 200+ | 90 days |
| Order Delivered | 50 | Never |
| Profile Complete | 25 | Never |
| Promotion Purchase | 100 | Never |
| Referral | 150 | Never |
| Review Posted | 20 | Never |
| Daily Login | 5 | Never |
| First Purchase | 500 | Never |

## 🔗 Common Integrations

### On User Registration
```typescript
import { awardRegistrationBonus } from '@/lib/rewards'
await awardRegistrationBonus(user.id)
```

### On Purchase Complete
```typescript
import { awardPurchaseBonus } from '@/lib/rewards'
await awardPurchaseBonus(userId, orderId, orderTotal)
```

### On Listing Posted
```typescript
import { awardListingBonus } from '@/lib/rewards'
await awardListingBonus(userId, listingId)
```

### On Checkout (Apply Discount)
```typescript
import { getUserBalance, redeemPoints } from '@/lib/rewards'

const balance = await getUserBalance(userId)
if (balance.currentBalance >= pointsToRedeem) {
  await redeemPoints({
    userId,
    points: pointsToRedeem,
    referenceId: orderId,
    note: `Redeemed for $${discount} discount`
  })
}
```

## 📝 Action Types

- `registration_bonus`
- `listing_posted`
- `purchase_completed`
- `order_delivered`
- `profile_completed`
- `promotion_purchase`
- `referral_bonus`
- `review_posted`
- `daily_login`
- `first_purchase`
- `points_redeemed`
- `manual_admin_adjust`

## 🛠️ Helper Functions

```typescript
import {
  // Core functions
  awardPoints,
  redeemPoints,
  updateUserBalance,
  getUserBalance,
  getExpiringPoints,
  expireOldPoints,
  
  // Specific actions
  awardRegistrationBonus,
  awardListingBonus,
  awardPurchaseBonus,
  awardOrderDeliveredBonus,
  awardProfileCompletedBonus,
  awardReferralBonus,
  
  // Configuration
  REWARD_POINTS_CONFIG
} from '@/lib/rewards'
```

## ⚠️ Important Notes

1. **Balance Updates**: Helper functions automatically update balances
2. **Expiration**: Purchase points expire in 90 days by default
3. **Validation**: Always check balance before redemption
4. **Admin Access**: Only admins can award points to other users
5. **Reference IDs**: Always include for traceability

## 🔍 Testing

Run the test script:
```bash
npx tsx prisma/execute_reward_points_sql.ts
```

Expected output:
- ✅ User created
- ✅ Balance initialized
- ✅ Points awarded (registration, listing, purchase)
- ✅ Points redeemed
- ✅ Balance calculated correctly
- ✅ Final balance: 300 points

## 📚 Full Documentation

See `docs/REWARD_POINTS_API.md` for complete API documentation.
