# WhatsApp Configuration Guide

## Overview

The WhatsApp configuration system allows you to manage WhatsApp Business API settings directly from the database. You can configure phone numbers, business hours, auto-replies, and webhook URLs through a REST API.

## Database Schema

### Table: `whatsapp_config`

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `phone_number` | String | WhatsApp phone number (without country code) |
| `country_code` | String | Country calling code (e.g., +1, +254) |
| `display_name` | String | Business display name shown to customers |
| `is_active` | Boolean | Whether this config is currently active |
| `webhook_url` | String | URL to receive incoming WhatsApp messages |
| `api_token` | String | WhatsApp Business API authentication token |
| `auto_reply_enabled` | Boolean | Enable/disable automatic replies |
| `business_hours_start` | String | Business hours start time (HH:MM format) |
| `business_hours_end` | String | Business hours end time (HH:MM format) |
| `timezone` | String | Timezone for business hours (e.g., "America/New_York") |
| `created_at` | DateTime | Record creation timestamp |
| `updated_at` | DateTime | Last update timestamp |

**Indexes:**
- `ix_whatsapp_config_is_active` - For quick active config lookups
- `ix_whatsapp_config_created_at` - For sorting by creation date

## Setup Instructions

### 1. Run Migration

```bash
cd apps/api
alembic upgrade head
```

This creates the `whatsapp_config` table in your PostgreSQL database.

### 2. Seed Initial Configuration

Set environment variables (optional):
```bash
export WHATSAPP_PHONE="745026933"
export WHATSAPP_COUNTRY_CODE="+254"
export WHATSAPP_DISPLAY_NAME="SwiftTor Kenya"
export WHATSAPP_TIMEZONE="Africa/Nairobi"
```

Run seed script:
```bash
python apps/api/seed_whatsapp.py
```

**Example output:**
```
✓ WhatsApp configuration created successfully!
  ID: 550e8400-e29b-41d4-a716-446655440000
  Phone: +254 745026933
  Display Name: SwiftTor Kenya
  Active: True

To update the configuration, use the API endpoints:
  GET    /api/v1/whatsapp/config
  PUT    /api/v1/whatsapp/config/550e8400-e29b-41d4-a716-446655440000
  POST   /api/v1/whatsapp/config/550e8400-e29b-41d4-a716-446655440000/activate
```

## API Endpoints

### Get All Configurations

```http
GET /api/v1/whatsapp/config?skip=0&limit=10&active_only=true
```

**Query Parameters:**
- `skip` (optional): Number of records to skip for pagination (default: 0)
- `limit` (optional): Maximum records to return (default: 10)
- `active_only` (optional): Only return active configurations (default: false)

**Response:**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "phone_number": "745026933",
    "country_code": "+254",
    "full_number": "+254745026933",
    "display_name": "SwiftTor Kenya",
    "is_active": true,
    "webhook_url": "https://api.swifttor.com/webhooks/whatsapp",
    "auto_reply_enabled": true,
    "business_hours_start": "09:00",
    "business_hours_end": "17:00",
    "timezone": "Africa/Nairobi",
    "created_at": "2026-03-26T12:00:00Z",
    "updated_at": "2026-03-26T12:00:00Z"
  }
]
```

---

### Get Active Configuration

```http
GET /api/v1/whatsapp/config/active
```

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "phone_number": "745026933",
  "country_code": "+254",
  "full_number": "+254745026933",
  "display_name": "SwiftTor Kenya",
  "is_active": true,
  "webhook_url": "https://api.swifttor.com/webhooks/whatsapp",
  "auto_reply_enabled": true,
  "business_hours_start": "09:00",
  "business_hours_end": "17:00",
  "timezone": "Africa/Nairobi",
  "created_at": "2026-03-26T12:00:00Z",
  "updated_at": "2026-03-26T12:00:00Z"
}
```

**Returns `null` if no active configuration exists.**

---

### Get Specific Configuration

```http
GET /api/v1/whatsapp/config/{config_id}
```

**Response:** Same as above

---

### Create New Configuration

```http
POST /api/v1/whatsapp/config
Content-Type: application/json

{
  "phone_number": "745026933",
  "country_code": "+254",
  "display_name": "SwiftTor Kenya",
  "webhook_url": "https://api.swifttor.com/webhooks/whatsapp",
  "api_token": "your_api_token_here",
  "auto_reply_enabled": true,
  "business_hours_start": "09:00",
  "business_hours_end": "17:00",
  "timezone": "Africa/Nairobi"
}
```

**Response:** Returns created configuration (201 Created)

**Note:** Creating a new configuration automatically deactivates all existing configurations.

---

### Update Configuration

```http
PUT /api/v1/whatsapp/config/{config_id}
Content-Type: application/json

{
  "phone_number": "712345678",
  "display_name": "SwiftTor Updated",
  "auto_reply_enabled": false
}
```

**Request Body:** All fields are optional - only provided fields will be updated.

**Response:** Returns updated configuration

---

### Delete Configuration

```http
DELETE /api/v1/whatsapp/config/{config_id}
```

**Response:**
```json
{
  "message": "WhatsApp configuration deleted successfully"
}
```

---

### Activate Configuration

```http
POST /api/v1/whatsapp/config/{config_id}/activate
```

**Response:**
```json
{
  "message": "WhatsApp configuration activated successfully",
  "config_id": "550e8400-e29b-41d4-a716-446655440000",
  "full_number": "+254745026933"
}
```

**Note:** Activating a configuration automatically deactivates all others.

---

## Usage Examples

### cURL Examples

#### 1. Get Active Configuration
```bash
curl -X GET "http://localhost:8000/api/v1/whatsapp/config/active"
```

#### 2. Create New Configuration
```bash
curl -X POST "http://localhost:8000/api/v1/whatsapp/config" \
  -H "Content-Type: application/json" \
  -d '{
    "phone_number": "745026933",
    "country_code": "+254",
    "display_name": "SwiftTor Kenya",
    "auto_reply_enabled": true,
    "business_hours_start": "08:00",
    "business_hours_end": "20:00",
    "timezone": "Africa/Nairobi"
  }'
```

#### 3. Update Configuration
```bash
curl -X PUT "http://localhost:8000/api/v1/whatsapp/config/550e8400-e29b-41d4-a716-446655440000" \
  -H "Content-Type: application/json" \
  -d '{
    "display_name": "SwiftTor Support 24/7",
    "auto_reply_enabled": true
  }'
```

#### 4. Activate Configuration
```bash
curl -X POST "http://localhost:8000/api/v1/whatsapp/config/550e8400-e29b-41d4-a716-446655440000/activate"
```

#### 5. Delete Configuration
```bash
curl -X DELETE "http://localhost:8000/api/v1/whatsapp/config/550e8400-e29b-41d4-a716-446655440000"
```

### JavaScript/Fetch Examples

```javascript
// Get active WhatsApp configuration
const response = await fetch('http://localhost:8000/api/v1/whatsapp/config/active');
const config = await response.json();
console.log('Active WhatsApp:', config.full_number);

// Create new configuration
const newConfig = await fetch('http://localhost:8000/api/v1/whatsapp/config', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    phone_number: '745026933',
    country_code: '+254',
    display_name: 'SwiftTor Kenya',
    auto_reply_enabled: true,
    business_hours_start: '08:00',
    business_hours_end: '20:00',
    timezone: 'Africa/Nairobi'
  })
});

// Update configuration
await fetch(`http://localhost:8000/api/v1/whatsapp/config/${configId}`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    display_name: 'Updated Name'
  })
});

// Activate configuration
await fetch(`http://localhost:8000/api/v1/whatsapp/config/${configId}/activate`, {
  method: 'POST'
});
```

### Python Requests Examples

```python
import requests

BASE_URL = "http://localhost:8000"

# Get active configuration
response = requests.get(f"{BASE_URL}/api/v1/whatsapp/config/active")
config = response.json()
print(f"Active WhatsApp: {config['full_number']}")

# Create new configuration
new_config = requests.post(
    f"{BASE_URL}/api/v1/whatsapp/config",
    json={
        "phone_number": "745026933",
        "country_code": "+254",
        "display_name": "SwiftTor Kenya",
        "auto_reply_enabled": True,
        "business_hours_start": "08:00",
        "business_hours_end": "20:00",
        "timezone": "Africa/Nairobi"
    }
)

# Update configuration
requests.put(
    f"{BASE_URL}/api/v1/whatsapp/config/{config_id}",
    json={"display_name": "Updated Name"}
)

# Activate configuration
requests.post(f"{BASE_URL}/api/v1/whatsapp/config/{config_id}/activate")
```

## Environment Variables

You can configure default values using environment variables:

```bash
# WhatsApp Phone Number (without country code)
WHATSAPP_PHONE=745026933

# Country calling code
WHATSAPP_COUNTRY_CODE=+254

# Business display name
WHATSAPP_DISPLAY_NAME=SwiftTor Kenya

# Webhook URL for receiving messages
WHATSAPP_WEBHOOK_URL=https://api.swifttor.com/webhooks/whatsapp

# WhatsApp Business API token
WHATSAPP_API_TOKEN=your_token_here

# Business hours timezone
WHATSAPP_TIMEZONE=Africa/Nairobi
```

## Best Practices

### 1. Single Active Configuration
Only one WhatsApp configuration should be active at a time. The API automatically deactivates others when you create or activate a new config.

### 2. Phone Number Format
- Store phone numbers without the country code in `phone_number`
- Use `country_code` field for the country prefix (e.g., +1, +254, +44)
- The API combines them into `full_number` for display

**Examples:**
- USA: `country_code="+1"`, `phone_number="5551234567"` → `full_number="+15551234567"`
- Kenya: `country_code="+254"`, `phone_number="745026933"` → `full_number="+254745026933"`
- UK: `country_code="+44"`, `phone_number="7911123456"` → `full_number="+447911123456"`

### 3. Business Hours
Use 24-hour format (HH:MM):
- Start: `"09:00"`
- End: `"17:00"`
- For 24/7 support: Set both to `null` or use `"00:00"` and `"23:59"`

### 4. Timezones
Use IANA timezone names:
- `"Africa/Nairobi"` (East Africa Time)
- `"America/New_York"` (Eastern Time)
- `"Europe/London"` (GMT/BST)
- `"UTC"` (Coordinated Universal Time)

### 5. Security
- **Never** expose `api_token` in frontend code
- Encrypt tokens before storing in database (in production)
- Use HTTPS for webhook URLs
- Validate webhook signatures from WhatsApp

## Testing

### Check Database Directly

```sql
-- View all configurations
SELECT id, country_code, phone_number, display_name, is_active, created_at
FROM whatsapp_config;

-- View only active configuration
SELECT * FROM whatsapp_config WHERE is_active = true;
```

### Test with Swagger UI

1. Start the API server: `python apps/api/main.py`
2. Open Swagger UI: `http://localhost:8000/docs`
3. Navigate to the `whatsapp` tag
4. Try out all endpoints interactively

## Troubleshooting

### Issue: Configuration not found (404)
**Solution:** Ensure the configuration ID exists:
```bash
curl http://localhost:8000/api/v1/whatsapp/config
```

### Issue: Multiple active configurations
**Solution:** This shouldn't happen with the API, but if it does:
```sql
UPDATE whatsapp_config SET is_active = false;
UPDATE whatsapp_config SET is_active = true WHERE id = 'your-desired-active-id';
```

### Issue: Phone number format incorrect
**Solution:** Use the `full_number` field from API responses, which is properly formatted.

### Issue: Migration fails
**Solution:** Ensure PostgreSQL enum types exist:
```bash
cd apps/api
python fix_db.py  # If available
alembic upgrade head
```

## Next Steps

After configuring WhatsApp, you can:

1. **Integrate with messaging service**: Use the active config to send/receive messages
2. **Set up webhooks**: Configure `webhook_url` to receive incoming messages
3. **Enable auto-replies**: Set `auto_reply_enabled=true` and configure templates
4. **Monitor usage**: Track message volume and response times
5. **Configure business hours**: Set up automatic away messages outside business hours

## Files Created/Modified

### New Files:
- `apps/api/models/database.py` - Added `WhatsAppConfig` model
- `apps/api/routers/whatsapp.py` - WhatsApp CRUD endpoints
- `apps/api/alembic/versions/b2c3d4e5f6g7_add_whatsapp_config_table.py` - Migration
- `apps/api/seed_whatsapp.py` - Seed script
- `apps/api/main.py` - Registered WhatsApp router

### API Endpoints:
- `GET /api/v1/whatsapp/config` - List all configs
- `GET /api/v1/whatsapp/config/active` - Get active config
- `GET /api/v1/whatsapp/config/{id}` - Get specific config
- `POST /api/v1/whatsapp/config` - Create new config
- `PUT /api/v1/whatsapp/config/{id}` - Update config
- `DELETE /api/v1/whatsapp/config/{id}` - Delete config
- `POST /api/v1/whatsapp/config/{id}/activate` - Activate config

---

**Quick Start:**
```bash
# 1. Run migration
alembic upgrade head

# 2. Seed initial config
python apps/api/seed_whatsapp.py

# 3. Test API
curl http://localhost:8000/api/v1/whatsapp/config/active
```
