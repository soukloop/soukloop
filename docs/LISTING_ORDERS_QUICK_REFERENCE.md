# Listing Orders - Quick Reference

## 🚀 Quick Start

### Create an Order
```typescript
POST /api/listing-orders
{
  "listingId": "uuid",
  "quantity": 1,
  "address": {
    "type": "shipping",
    "name": "John Doe",
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA"
  }
}
```

### Get My Orders
```typescript
// As buyer
GET /api/listing-orders?role=buyer

// As seller
GET /api/listing-orders?role=seller

// All orders
GET /api/listing-orders
```

### Update Order Status
```typescript
PATCH /api/listing-orders/[id]
{
  "status": "accepted"  // or shipped, delivered, etc.
}
```

## 📊 Order Status Flow

```
pending → accepted → shipped → delivered → received
    ↓
cancelled/declined
```

## 🔐 Who Can Do What

### Buyer Can:
- ✅ Create orders
- ✅ Cancel pending orders
- ✅ Confirm receipt (`received`)
- ✅ View their orders
- ✅ Delete pending/cancelled orders

### Seller Can:
- ✅ Accept orders (`accepted`)
- ✅ Decline orders (`declined`)
- ✅ Mark as shipped (`shipped`)
- ✅ View their orders

## 📝 Status Codes

| Status | Description |
|--------|-------------|
| `pending` | Awaiting seller response |
| `accepted` | Seller accepted |
| `declined` | Seller declined |
| `shipped` | Item shipped |
| `delivered` | Item delivered |
| `received` | Buyer confirmed |
| `cancelled` | Order cancelled |

## 🌐 API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/listing-orders` | List orders |
| POST | `/api/listing-orders` | Create order |
| GET | `/api/listing-orders/[id]` | Get order |
| PATCH | `/api/listing-orders/[id]` | Update order |
| DELETE | `/api/listing-orders/[id]` | Delete order |

## 🧪 Test Script

```bash
npx tsx prisma/execute_listing_orders_sql.ts
```

Expected: ✅ All tests pass

## 📦 Address Types

### Shipping
```json
{
  "type": "shipping",
  "name": "John Doe",
  "street": "123 Main St",
  "city": "New York",
  "state": "NY",
  "zipCode": "10001",
  "country": "USA",
  "phone": "+1234567890"
}
```

### Meetup
```json
{
  "type": "meetup",
  "meetupLocation": "Starbucks on 5th Ave",
  "meetupTime": "2025-12-15T14:00:00Z",
  "phone": "+1234567890"
}
```

## ⚠️ Important Rules

1. **Cannot buy own listing** - System prevents self-purchase
2. **Listing must be active** - Only active listings can be ordered
3. **Status transitions** - Follow the allowed flow
4. **Authorization** - Only buyer/seller can access order
5. **Deletion** - Only buyer can delete pending/cancelled orders

## 🔍 Common Queries

### Filter by Status
```
GET /api/listing-orders?status=pending
```

### Filter by Listing
```
GET /api/listing-orders?listingId=uuid
```

### Get Buyer Orders
```
GET /api/listing-orders?role=buyer
```

### Get Seller Orders
```
GET /api/listing-orders?role=seller
```

## 📚 Full Documentation

See `docs/LISTING_ORDERS_IMPLEMENTATION.md` for complete details.
