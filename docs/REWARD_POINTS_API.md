# Reward Points System API Documentation

## Overview
The reward points system allows users to earn and redeem points for various actions within the platform. Points can have expiration dates and are tracked with detailed transaction history.

## Database Schema

### RewardPoint
Tracks individual point transactions (earned or redeemed).

```prisma
model RewardPoint {
  id            String    @id @default(uuid())
  userId        String
  points        Int       // positive = earned, negative = redeemed
  actionType    String    // e.g., 'registration_bonus', 'purchase_completed'
  referenceId   String?   // Related entity ID (order, listing, etc.)
  referenceType String?   // Type of reference ('order', 'listing', etc.)
  note          String?
  expiresAt     DateTime?
  createdAt     DateTime  @default(now())
}
```

### RewardBalance
Maintains current balance for each user.

```prisma
model RewardBalance {
  userId         String   @id
  totalEarned    Int      @default(0)
  totalRedeemed  Int      @default(0)
  currentBalance Int      @default(0)
  updatedAt      DateTime @updatedAt
}
```

## API Endpoints

### 1. Get Reward Points
**GET** `/api/rewards/points`

Get a list of reward point transactions.

**Query Parameters:**
- `userId` (optional) - Filter by user ID (admin only for other users)
- `actionType` (optional) - Filter by action type
- `limit` (optional) - Number of results (default: 50)
- `includeExpired` (optional) - Include expired points (default: false)

**Response:**
```json
[
  {
    "id": "uuid",
    "userId": "uuid",
    "points": 100,
    "actionType": "registration_bonus",
    "referenceId": null,
    "referenceType": null,
    "note": "Welcome bonus",
    "expiresAt": null,
    "createdAt": "2025-12-08T13:30:24.977Z",
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
]
```

### 2. Award Points
**POST** `/api/rewards/points`

Award points to a user.

**Request Body:**
```json
{
  "action": "award",
  "userId": "uuid",  // Optional, defaults to current user (admin can specify)
  "points": 100,
  "actionType": "purchase_completed",
  "referenceId": "order-123",  // Optional
  "referenceType": "order",    // Optional
  "note": "Purchase reward",   // Optional
  "expiresAt": "2026-03-08T13:30:24.977Z"  // Optional
}
```

**Response:**
```json
{
  "id": "uuid",
  "userId": "uuid",
  "points": 100,
  "actionType": "purchase_completed",
  "referenceId": "order-123",
  "referenceType": "order",
  "note": "Purchase reward",
  "expiresAt": "2026-03-08T13:30:24.977Z",
  "createdAt": "2025-12-08T13:30:24.977Z"
}
```

### 3. Redeem Points
**POST** `/api/rewards/points`

Redeem points from user's balance.

**Request Body:**
```json
{
  "action": "redeem",
  "points": 50,
  "referenceId": "redemption-789",  // Optional
  "note": "Redeemed for discount"   // Optional
}
```

**Response:**
```json
{
  "id": "uuid",
  "userId": "uuid",
  "points": -50,
  "actionType": "points_redeemed",
  "referenceId": "redemption-789",
  "referenceType": "redemption",
  "note": "Redeemed for discount",
  "expiresAt": null,
  "createdAt": "2025-12-08T13:30:24.977Z"
}
```

### 4. Get Balance
**GET** `/api/rewards/balance`

Get user's current reward balance with additional stats.

**Query Parameters:**
- `userId` (optional) - Get balance for specific user (admin only)

**Response:**
```json
{
  "balance": {
    "userId": "uuid",
    "totalEarned": 350,
    "totalRedeemed": 50,
    "currentBalance": 300,
    "updatedAt": "2025-12-08T13:30:24.977Z",
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com"
    }
  },
  "recentTransactions": [
    {
      "id": "uuid",
      "points": 100,
      "actionType": "registration_bonus",
      "createdAt": "2025-12-08T13:30:24.977Z"
    }
  ],
  "expiringPoints": {
    "count": 2,
    "total": 150,
    "items": [
      {
        "id": "uuid",
        "points": 100,
        "expiresAt": "2026-01-15T00:00:00.000Z"
      }
    ]
  }
}
```

### 5. Recalculate Balance
**POST** `/api/rewards/balance`

Manually recalculate user's balance from all transactions.

**Request Body:**
```json
{
  "userId": "uuid"  // Optional, defaults to current user (admin can specify)
}
```

**Response:**
```json
{
  "message": "Balance recalculated successfully",
  "balance": {
    "userId": "uuid",
    "totalEarned": 350,
    "totalRedeemed": 50,
    "currentBalance": 300,
    "updatedAt": "2025-12-08T13:30:24.977Z"
  }
}
```

### 6. Get History
**GET** `/api/rewards/history`

Get detailed transaction history with statistics.

**Query Parameters:**
- `userId` (optional) - Get history for specific user (admin only)

**Response:**
```json
{
  "history": [
    {
      "id": "uuid",
      "userId": "uuid",
      "points": 100,
      "actionType": "registration_bonus",
      "createdAt": "2025-12-08T13:30:24.977Z"
    }
  ],
  "stats": {
    "byActionType": [
      {
        "actionType": "registration_bonus",
        "_sum": { "points": 100 },
        "_count": { "id": 1 }
      }
    ],
    "monthlyStats": [
      {
        "month": "2025-12-01T00:00:00.000Z",
        "earned": 350,
        "redeemed": 50,
        "transaction_count": 4
      }
    ]
  }
}
```

### 7. Get Statistics (Admin Only)
**GET** `/api/rewards/stats`

Get system-wide reward statistics.

**Response:**
```json
{
  "topUsers": [
    {
      "userId": "uuid",
      "currentBalance": 1500,
      "user": {
        "id": "uuid",
        "name": "John Doe",
        "email": "john@example.com"
      }
    }
  ],
  "totalStats": {
    "totalUsers": 150,
    "totalEarned": 45000,
    "totalRedeemed": 12000,
    "totalOutstanding": 33000
  },
  "actionTypeStats": [
    {
      "actionType": "purchase_completed",
      "_sum": { "points": 25000 },
      "_count": { "id": 125 }
    }
  ],
  "recentTransactions": [...],
  "expiringPoints": {
    "count": 15,
    "total": 2500,
    "items": [...]
  }
}
```

## Action Types

Common action types used in the system:

- `registration_bonus` - New user registration (100 points)
- `listing_posted` - User posts a listing (50 points)
- `purchase_completed` - User completes a purchase (200+ points)
- `order_delivered` - Order successfully delivered (50 points)
- `profile_completed` - User completes their profile (25 points)
- `promotion_purchase` - User purchases a promotion (100 points)
- `referral_bonus` - User refers a new user (150 points)
- `review_posted` - User posts a review (20 points)
- `daily_login` - Daily login bonus (5 points)
- `first_purchase` - First purchase bonus (500 points)
- `points_redeemed` - Points redeemed (negative value)
- `manual_admin_adjust` - Admin manual adjustment

## Helper Functions

Use the helper functions in `/lib/rewards.ts` for common operations:

```typescript
import {
  awardPoints,
  redeemPoints,
  getUserBalance,
  awardRegistrationBonus,
  awardPurchaseBonus,
  awardListingBonus,
  // ... more helpers
} from '@/lib/rewards'

// Award registration bonus
await awardRegistrationBonus(userId)

// Award purchase bonus
await awardPurchaseBonus(userId, orderId, orderAmount)

// Get user balance
const balance = await getUserBalance(userId)

// Redeem points
await redeemPoints({
  userId,
  points: 50,
  referenceId: 'discount-code-123',
  note: 'Applied to order'
})
```

## Integration Examples

### 1. Award Points on User Registration

```typescript
// In your registration handler
const user = await prisma.user.create({
  data: { email, password, name }
})

// Award registration bonus
await awardRegistrationBonus(user.id)
```

### 2. Award Points on Purchase

```typescript
// In your order completion handler
const order = await prisma.order.update({
  where: { id: orderId },
  data: { status: 'PAID' }
})

// Award purchase bonus
await awardPurchaseBonus(order.userId, order.id, order.total)
```

### 3. Redeem Points for Discount

```typescript
// In your checkout handler
const userBalance = await getUserBalance(userId)

if (userBalance.currentBalance >= pointsToRedeem) {
  await redeemPoints({
    userId,
    points: pointsToRedeem,
    referenceId: orderId,
    note: `Redeemed ${pointsToRedeem} points for $${discount} discount`
  })
}
```

## Error Handling

All endpoints return standard HTTP status codes:

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error, insufficient points)
- `401` - Unauthorized (not logged in)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

Error response format:
```json
{
  "error": "Error message",
  "details": {
    // Validation details if applicable
  }
}
```

## Best Practices

1. **Always update balance** - The helper functions automatically update balances, but if you create points directly, call `updateUserBalance(userId)`

2. **Set expiration dates** - For purchase-related points, set expiration dates (typically 90 days)

3. **Use reference IDs** - Always include `referenceId` and `referenceType` for traceability

4. **Check balance before redemption** - Always verify user has sufficient points before allowing redemption

5. **Run expiration cron** - Set up a cron job to call `expireOldPoints()` daily to keep balances accurate
