# API Testing Guide

## 🧪 Testing Your APIs

### 1. **Start Development Server**
```bash
npm run dev
```
Server will run on `http://localhost:3001` (or next available port)

### 2. **Test Authentication APIs**

#### Register User
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","username":"testuser","password":"password123"}'
```

#### Login User
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

#### Get Session
```bash
curl -X GET http://localhost:3001/api/auth/session
```

### 3. **Test Products APIs**

#### Get Products
```bash
curl -X GET "http://localhost:3001/api/products?page=1&limit=10"
```

#### Create Product (requires authentication)
```bash
curl -X POST http://localhost:3001/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"name":"Test Product","description":"Test Description","price":99.99,"category":"electronics","quantity":10}'
```

### 4. **Test Cart APIs**

#### Get Cart
```bash
curl -X GET http://localhost:3001/api/cart
```

#### Add Item to Cart
```bash
curl -X POST http://localhost:3001/api/cart/items \
  -H "Content-Type: application/json" \
  -d '{"productId":"PRODUCT_ID","quantity":2}'
```

### 5. **Test Orders APIs**

#### Get Orders
```bash
curl -X GET http://localhost:3001/api/orders
```

#### Checkout
```bash
curl -X POST http://localhost:3001/api/orders/checkout \
  -H "Content-Type: application/json" \
  -d '{"shippingAddress":{"street":"123 Main St","city":"Anytown","state":"CA","zipCode":"12345"},"paymentMethod":"stripe"}'
```

### 6. **Test Vendor APIs**

#### Enable Vendor Account
```bash
curl -X POST http://localhost:3001/api/vendor/enable \
  -H "Content-Type: application/json" \
  -d '{"storeName":"My Store"}'
```

#### Get Vendor Products
```bash
curl -X GET http://localhost:3001/api/vendor/products
```

### 7. **Test Admin APIs**

#### Get Admin Products
```bash
curl -X GET "http://localhost:3001/api/admin?type=products"
```

#### Get Admin Vendors
```bash
curl -X GET "http://localhost:3001/api/admin?type=vendors"
```

### 8. **Test Communication APIs**

#### Get Conversations
```bash
curl -X GET http://localhost:3001/api/conversations
```

#### Create Conversation
```bash
curl -X POST http://localhost:3001/api/conversations \
  -H "Content-Type: application/json" \
  -d '{"otherUserId":"USER_ID"}'
```

#### Get Messages
```bash
curl -X GET "http://localhost:3001/api/messages?conversationId=CONVERSATION_ID"
```

### 9. **Test Payment APIs**

#### Create Stripe Session
```bash
curl -X POST http://localhost:3001/api/payments/stripe/session \
  -H "Content-Type: application/json" \
  -d '{"orderId":"ORDER_ID"}'
```

#### Create PayPal Order
```bash
curl -X POST http://localhost:3001/api/payments/paypal/create \
  -H "Content-Type: application/json" \
  -d '{"orderId":"ORDER_ID"}'
```

#### Create Crypto Payment
```bash
curl -X POST http://localhost:3001/api/payments/crypto/create \
  -H "Content-Type: application/json" \
  -d '{"orderId":"ORDER_ID"}'
```

## 🔍 Expected Responses

### Success Response
```json
{
  "success": true,
  "data": {...},
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "error": "Error message",
  "status": 400
}
```

### Authentication Required
```json
{
  "error": "Unauthorized",
  "status": 401
}
```

## 🛠️ Frontend Integration

### Using useAuth Hook
```typescript
import { useAuth } from '@/src/hooks/useAuth'

function LoginForm() {
  const { login, user, isLoading, error } = useAuth()
  
  const handleSubmit = async (email: string, password: string) => {
    try {
      await login({ email, password })
      // User will be automatically logged in
    } catch (err) {
      console.error('Login failed:', err)
    }
  }
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  )
}
```

### Using API Services
```typescript
import { getProducts, createProduct } from '@/src/services/products.service'

// Get products
const { data: products, error } = await getProducts({ page: 1, limit: 10 })

// Create product
const { data: product, error } = await createProduct({
  name: 'New Product',
  price: 99.99,
  category: 'electronics'
})
```

## 🚨 Common Issues

### 1. **Authentication Errors**
- Ensure user is logged in
- Check session validity
- Verify role permissions

### 2. **Database Errors**
- Check Prisma client generation
- Verify database connection
- Ensure proper schema

### 3. **CORS Issues**
- Check middleware configuration
- Verify API route structure
- Test with proper headers

### 4. **Validation Errors**
- Check required fields
- Verify data types
- Review input validation

## 📊 Monitoring

### Check Server Logs
```bash
# Development server logs
npm run dev

# Check for errors in console
# Look for API call logs
# Monitor database queries
```

### Test Database
```bash
# Open SQLite database
sqlite3 prisma/dev.db

# Check tables
.tables

# Query data
SELECT * FROM User LIMIT 5;
```

## 🎯 Next Steps

1. **Test all endpoints** using the curl commands above
2. **Verify frontend integration** with useAuth hook
3. **Check error handling** for edge cases
4. **Monitor performance** and optimize queries
5. **Add logging** for debugging
6. **Implement real payment providers**
7. **Add input validation** with Zod
8. **Set up monitoring** and analytics

Your APIs are now ready for testing and frontend integration! 🚀
