# Role-Based Routing & Profiles System

## Overview

This document describes the role-based access control (RBAC) and routing system implemented in SwiftTow. The system separates users into different portals based on their assigned roles stored in the `profiles` table.

---

## Database Schema

### Profiles Table

The `profiles` table is used to manage user roles and profile information:

```sql
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL CHECK (role IN ('customer', 'driver', 'shop_owner', 'admin')),
    avatar_url TEXT,
    bio TEXT,
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    zip_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'USA',
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(20),
    preferences TEXT, -- JSON string for flexible preferences
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_is_active ON profiles(is_active);
```

---

## User Roles

| Role | Portal Route | Description | Access Level |
|------|-------------|-------------|--------------|
| **customer** | `/customer` | Regular users requesting towing services | Full customer portal access |
| **driver** | `/driver` | Tow truck drivers accepting and completing jobs | Driver dashboard access |
| **shop_owner** | `/shops` | Service shop owners managing their business | Shop management access |
| **admin** | `/admin` | System administrators and dispatchers | Full system access |

---

## Backend Implementation

### 1. Profile Model (`apps/api/models/database.py`)

```python
class Profile(Base):
    __tablename__ = "profiles"
    # ... fields as defined above
```

### 2. Security Utilities (`apps/api/core/security.py`)

Provides role-checking dependencies:
- `get_current_user_profile()` - Retrieves current user's profile
- `require_role(required_role)` - Decorator to restrict endpoints by role
- Pre-built dependencies: `customer_required`, `driver_required`, `shop_owner_required`

### 3. Profile Router (`apps/api/routers/profiles.py`)

Endpoints:
- `GET /api/v1/profiles/me` - Get current user's profile
- `PATCH /api/v1/profiles/me` - Update current user's profile
- `GET /api/v1/profiles/check-role` - Quick role check for frontend routing

### 4. Orders Router Enhancement

Added endpoint:
- `GET /api/v1/orders/my-orders?user_id={uuid}` - Fetch all orders for a specific user

---

## Frontend Implementation

### 1. ProtectedRoute Component (`components/ProtectedRoute.tsx`)

A reusable wrapper component that:
- Checks authentication status
- Validates user role against allowed roles
- Redirects to appropriate dashboard if unauthorized
- Shows loading state during verification

**Usage Example:**
```tsx
import ProtectedRoute from '@/components/ProtectedRoute';

export default function CustomerDashboard() {
  return (
    <ProtectedRoute allowedRoles={['customer']}>
      {/* Your protected content */}
    </ProtectedRoute>
  );
}
```

### 2. useRoleRedirect Hook (`hooks/useRoleRedirect.ts`)

Custom hooks for role-based redirects:
- `useRoleRedirect({ allowedRoles: ['customer'] })` - Generic hook
- `useCustomerOnly()` - Customer-specific
- `useDriverOnly()` - Driver-specific
- `useAdminOnly()` - Admin-specific
- `useShopOwnerOnly()` - Shop owner-specific

**Usage Example:**
```tsx
import { useCustomerOnly } from '@/hooks/useRoleRedirect';

export default function MyPage() {
  useCustomerOnly(); // Will redirect if not a customer
  
  return <div>Customer-only content</div>;
}
```

### 3. Middleware (`middleware.ts`)

Next.js middleware that:
- Checks for session token on protected routes
- Redirects unauthenticated users to login
- Sets security headers (CSP, X-Frame-Options, etc.)

Protected route prefixes:
- `/admin` - Admin portal
- `/driver` - Driver portal
- `/customer` - Customer portal
- `/profile` - Profile pages

---

## Portal Pages

### Customer Portal (`/customer`)
**File:** `apps/web/app/customer/page.tsx`

Features:
- Dashboard with order statistics
- Order history view
- Active order tracking
- Profile management
- Quick service request

Tabs:
1. **Overview** - Summary stats and recent orders
2. **My Orders** - Complete order history
3. **Profile** - User information and settings

### Driver Portal (`/driver`)
**File:** `apps/web/app/driver/page.tsx`

Features:
- Online/Offline toggle
- Available jobs list (radius-based)
- Job acceptance workflow
- Earnings tracking
- Mission status updates
- Customer communication chat

### Admin Portal (`/admin`)
**File:** `apps/web/app/admin/page.tsx`

Features:
- Real-time order dispatch board
- Driver management (add/update/delete)
- Live map tracking
- Customer/driver communication
- Order status management
- Fleet availability overview

---

## Authentication Flow

1. **Login** → User authenticates via OTP at `/auth/signin`
2. **Token Generation** → Backend returns JWT with role information
3. **Session Storage** → NextAuth stores role in JWT session
4. **Route Protection** → ProtectedRoute checks role on page load
5. **Redirect Logic**:
   - If role doesn't match → redirect to appropriate dashboard
   - If not authenticated → redirect to login with callback URL

---

## API Usage Examples

### Get Current User Profile
```typescript
const response = await fetch('/api/v1/profiles/me', {
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});
const profile = await response.json();
```

### Update Profile
```typescript
await fetch('/api/v1/profiles/me', {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`
  },
  body: JSON.stringify({
    avatar_url: 'https://...',
    bio: 'Customer since 2026',
    city: 'San Francisco'
  })
});
```

### Check User Role (Frontend)
```typescript
const response = await fetch('/api/v1/profiles/check-role');
const { role, is_active } = await response.json();
// role = 'customer' | 'driver' | 'shop_owner' | 'admin'
```

---

## Migration Setup

Run the migration to create the profiles table:

```bash
cd swifttor/apps/api
alembic upgrade head
```

This will execute the migration file:
`alembic/versions/a1b2c3d4e5f6_add_profiles_table.py`

---

## Environment Variables

Add these to your `.env` files:

### Backend (`.env`)
```env
# No additional env vars needed for profiles
# Existing database connection will be used
```

### Frontend (`.env.local`)
```env
NEXT_PUBLIC_ADMIN_EMAIL=your-admin-email@example.com
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## Security Considerations

1. **JWT Role Validation**: Role is stored in JWT and validated on each request
2. **Server-Side Checks**: All protected endpoints verify role using dependencies
3. **Profile-User Link**: Each profile is uniquely linked to a user (1:1 relationship)
4. **Cascade Deletes**: Deleting a user automatically deletes their profile
5. **Active Status Check**: Inactive profiles are blocked from accessing the system

---

## Testing the System

### 1. Create a Test User
```bash
# Use the auth endpoint to create a user
POST /api/v1/auth/send-otp
{
  "phone": "+14155550123"
}

# Verify and get tokens
POST /api/v1/auth/verify
{
  "phone": "+14155550123",
  "otp": "123456"
}
```

### 2. Create Profile
```bash
POST /api/v1/users/{user_id}/profile
{
  "role": "customer",
  "bio": "Test customer"
}
```

### 3. Test Access
- Navigate to `/customer` → Should allow access
- Navigate to `/driver` → Should redirect to `/customer`
- Navigate to `/admin` → Should redirect to `/customer`

---

## Future Enhancements

- [ ] Add profile creation on user signup
- [ ] Implement admin panel for role management
- [ ] Add profile image upload
- [ ] Create notifications based on role
- [ ] Add advanced permissions (granular access control)
- [ ] Implement role hierarchy (super admin, moderator, etc.)

---

## Troubleshooting

### Issue: User can't access their portal
**Solution:** Check that:
1. User has a profile record in the database
2. Profile `is_active` is `true`
3. Role matches the portal they're trying to access
4. Session token is valid (not expired)

### Issue: Endless redirect loop
**Solution:** Clear browser cookies and localStorage, then re-login

### Issue: Profile not found errors
**Solution:** Ensure the profiles table migration has been run:
```bash
alembic upgrade head
```

---

## Support

For issues or questions about the role-based routing system, contact the development team or refer to the main project README.
