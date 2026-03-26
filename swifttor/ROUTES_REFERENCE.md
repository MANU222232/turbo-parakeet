# SwiftTow Routes Reference

## Public Routes (No Authentication Required)

| Route | Description | Component |
|-------|-------------|-----------|
| `/` | Landing page with service selection | `app/page.tsx` |
| `/auth/signin` | Login page | `app/auth/signin/page.tsx` |
| `/auth/signup` | Registration page | `app/auth/signup/page.tsx` |
| `/emergency-report` | Emergency service request form | `app/emergency-report/page.tsx` |
| `/service-map` | Live driver tracking map | `app/service-map/page.tsx` |
| `/ai-assistant` | AI chat assistant | `app/ai-assistant/page.tsx` |
| `/geolocation-pin-test` | Geolocation testing | `app/geolocation-pin-test/page.tsx` |

---

## Protected Routes (Authentication Required)

### Customer Portal (`/customer`)
**File:** `app/customer/page.tsx`  
**Required Role:** `customer`

| Tab/Section | Description |
|------------|-------------|
| Overview | Dashboard with stats and recent orders |
| My Orders | Complete order history with filtering |
| Profile | User profile information and settings |

**Sub-routes:**
- `/customer` - Main dashboard
- `/order/[id]` - Order details page
- `/order/[id]/track` - Live order tracking
- `/order/[id]/confirmed` - Order confirmation
- `/checkout` - Payment checkout

---

### Driver Portal (`/driver`)
**File:** `app/driver/page.tsx`  
**Required Role:** `driver`

| Section | Description |
|---------|-------------|
| Mission Control | Available jobs list and active job |
| Earnings | Daily and total earnings display |
| Online Toggle | Switch between online/offline status |
| Chat | Communication with customers/admin |

**Features:**
- Real-time job notifications via Socket.io
- GPS location sharing
- Before/after photo upload
- Status updates (accepted → en_route → arrived → completed)

---

### Admin Portal (`/admin`)
**File:** `app/admin/page.tsx`  
**Required Roles:** `admin`, `shop_owner`

| Section | Description |
|---------|-------------|
| Dispatch Dashboard | Real-time order management board |
| Fleet Status | Driver availability and management |
| Live Map | Real-time vehicle tracking |
| Communications | Chat with drivers and customers |

**Capabilities:**
- Add/update/delete drivers
- Assign drivers to orders
- View all orders in real-time
- Send messages to any order room
- Manage fleet availability
- Monitor driver locations

---

### Shop Management (`/shops`)
**Status:** Planned (not yet implemented)

**Expected Features:**
- Service catalog management
- Pricing configuration
- Availability scheduling
- Performance analytics

---

## API Endpoints

### Authentication
```
POST   /api/v1/auth/send-otp       # Send OTP to phone
POST   /api/v1/auth/verify         # Verify OTP and get tokens
POST   /api/auth/refresh           # Refresh access token
```

### Profiles
```
GET    /api/v1/profiles/me         # Get current user profile
PATCH  /api/v1/profiles/me         # Update current user profile
GET    /api/v1/profiles/check-role # Quick role check
```

### Orders
```
GET    /api/v1/orders/                     # Get all orders (admin)
GET    /api/v1/orders/my-orders?user_id=   # Get user's orders
GET    /api/v1/orders/id/{order_id}        # Get order by ID
GET    /api/v1/orders/available            # Get available jobs (drivers)
POST   /api/v1/orders/                     # Create new order
POST   /api/v1/orders/{id}/accept          # Accept job (driver)
PATCH  /api/v1/orders/{id}/status          # Update order status
POST   /api/v1/orders/{id}/messages        # Send chat message
POST   /api/v1/orders/{id}/photos          # Upload order photo
GET    /api/v1/orders/eta                  # Calculate ETA
```

### Drivers
```
GET    /api/v1/drivers/                    # Get all drivers (admin)
POST   /api/v1/drivers/                    # Create new driver (admin)
DELETE /api/v1/drivers/{id}                # Delete driver (admin)
```

### Users
```
GET    /api/v1/users/                      # Get all users (admin)
GET    /api/v1/users/{id}                  # Get user by ID
PATCH  /api/v1/users/{id}                  # Update user
```

### Shops
```
GET    /api/v1/shops/                      # Get all shops
GET    /api/v1/shops/{id}                  # Get shop by ID
POST   /api/v1/shops/                      # Create shop
PATCH  /api/v1/shops/{id}                  # Update shop
DELETE /api/v1/shops/{id}                  # Delete shop
```

### Payments
```
POST   /api/v1/payments/confirm            # Confirm order + payment
POST   /api/v1/payments/stripe             # Process Stripe payment
```

### Upload
```
POST   /api/v1/upload/presigned            # Get presigned S3 URL
```

---

## Socket.IO Events

### Client → Server

| Event | Payload | Description |
|-------|---------|-------------|
| `join_admin` | `{}` | Join admin room for real-time updates |
| `join_order` | `{order_id}` | Join specific order room |
| `send_chat_message` | `{order_id, text, sender, timestamp}` | Send chat message |
| `order:status_change` | `{order_id, status}` | Update order status |
| `driver:location_update` | `{driver_id, order_id, lat, lng, heading}` | Share driver location |

### Server → Client

| Event | Payload | Description |
|-------|---------|-------------|
| `order:new` | `Order` | New order created |
| `order:status_change` | `{order_id, status}` | Order status updated |
| `new_chat_message` | `{order_id, text, sender, timestamp}` | New chat message |
| `driver:location_update` | `{order_id, lat, lng}` | Driver location update |

---

## Route Protection Implementation

### Frontend Components

#### ProtectedRoute Wrapper
```tsx
<ProtectedRoute allowedRoles={['customer']}>
  <CustomerDashboard />
</ProtectedRoute>
```

#### Hook Usage
```tsx
useCustomerOnly();      // Customer pages
useDriverOnly();        // Driver pages
useAdminOnly();         // Admin pages
useShopOwnerOnly();     // Shop owner pages
```

### Backend Dependencies

```python
from core.security import customer_required, driver_required

@router.get("/customer-data")
async def get_customer_data(
    profile: Profile = customer_required
):
    # Only accessible by customers
    pass

@router.get("/driver-data")
async def get_driver_data(
    profile: Profile = Depends(driver_required)
):
    # Only accessible by drivers
    pass
```

---

## Middleware Configuration

**File:** `middleware.ts`

Protected route prefixes automatically redirect unauthenticated users:
- `/admin/*`
- `/driver/*`
- `/customer/*`
- `/profile/*`

---

## Database Relationships

```
users (1) ←→ (1) profiles
users (1) ←→ (many) orders
orders (many) → (1) drivers (users)
shops (1) ←→ (many) orders
```

---

## Quick Start Guide

### 1. Run Migrations
```bash
cd swifttor/apps/api
alembic upgrade head
```

### 2. Seed Test Data
```bash
python seed_profiles.py --test
```

### 3. Start Backend
```bash
python main.py
```

### 4. Start Frontend
```bash
cd apps/web
npm run dev
```

### 5. Test Portals
- Customer: http://localhost:3000/customer
- Driver: http://localhost:3000/driver
- Admin: http://localhost:3000/admin

---

## Debugging Tips

### Check User Role
```typescript
// In browser console (logged in)
const session = await fetch('/api/auth/session').then(r => r.json());
console.log('User Role:', session.user.role);
console.log('User ID:', session.user.id);
```

### Verify Profile in DB
```sql
SELECT u.email, u.name, p.role, p.is_active 
FROM users u 
JOIN profiles p ON u.id = p.user_id 
WHERE u.email = 'test@example.com';
```

### Test API Endpoint
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8000/api/v1/profiles/me
```

---

For more detailed information, see [ROLE_BASED_ROUTING.md](./ROLE_BASED_ROUTING.md)
