# API Documentation

## Base URL

- **Local**: `http://localhost:3000`
- **Vercel**: `https://your-project.vercel.app`

## Authentication

All protected endpoints require a valid `sessionId` obtained from the login endpoint.

---

## Endpoints

### 1. Health Check

```http
GET /
```

**Response:**
```json
{
  "status": "running",
  "message": "EazyBusiness Ticket Automation Server",
  "version": "3.0.0",
  "endpoints": {
    "login": "POST /api/login",
    "createTicket": "POST /api/create-ticket",
    "createMultiple": "POST /api/create-tickets",
    "status": "GET /api/status"
  }
}
```

---

### 2. Dashboard UI

```http
GET /dashboard
```

**Description**: Returns HTML dashboard interface

**Response**: HTML page with web UI

---

### 3. Login

```http
POST /api/login
```

**Request Body:**
```json
{
  "email": "user@eazybusiness.in",
  "password": "your_password"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "sessionId": "eyJpdiI6ImNRYzhVQUNPNTdDSWFt...",
  "message": "Login successful"
}
```

**Error Response (401):**
```json
{
  "error": "Login failed"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@eazybusiness.in",
    "password": "password123"
  }'
```

---

### 4. Create Single Ticket

```http
POST /api/create-ticket
```

**Request Body:**
```json
{
  "sessionId": "eyJpdiI6ImNRYzhVQUNPNTdDSWFt...",
  "ticketData": {
    "contactName": "John Doe",
    "employeeName": "John Doe",
    "phone": "+91 9876543210",
    "email": "john@example.com",
    "company": "ABC Corporation",
    "subject": "Login Issue - Test 1",
    "category": "Login Issue",
    "rca": "Restart App"
  }
}
```

**Success Response (200):**
```json
{
  "success": true,
  "ticketId": "TKT-2024-001"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Invalid session or missing fields"
}
```

**JavaScript Fetch Example:**
```javascript
const response = await fetch('/api/create-ticket', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    sessionId: 'your_session_id',
    ticketData: {
      contactName: 'John Doe',
      phone: '+91 9876543210',
      email: 'john@example.com',
      company: 'ABC Corporation',
      subject: 'Login Issue',
      category: 'Login Issue',
      rca: 'Restart App'
    }
  })
});

const data = await response.json();
console.log(data);
```

---

### 5. Create Multiple Tickets

```http
POST /api/create-tickets
```

**Request Body:**
```json
{
  "sessionId": "eyJpdiI6ImNRYzhVQUNPNTdDSWFt...",
  "contactData": {
    "contactName": "John Doe",
    "employeeName": "John Doe",
    "phone": "+91 9876543210",
    "email": "john@example.com",
    "company": "ABC Corporation"
  },
  "count": 10,
  "delayMs": 3000
}
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| sessionId | string | Yes | Authentication token from login |
| contactData | object | Yes | Contact information for tickets |
| count | number | No | Number of tickets to create (default: 10) |
| delayMs | number | No | Milliseconds between tickets (default: 3000) |

**Contact Data Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| contactName | string | Yes | Customer name |
| employeeName | string | No | Employee handling ticket |
| phone | string | Yes | Contact phone |
| email | string | Yes | Contact email |
| company | string | Yes | Company name |

**Success Response (200):**
```json
{
  "success": true,
  "totalRequested": 10,
  "results": [
    {
      "ticketNumber": 1,
      "success": true,
      "ticketId": "TKT-2024-001"
    },
    {
      "ticketNumber": 2,
      "success": true,
      "ticketId": "TKT-2024-002"
    },
    {
      "ticketNumber": 3,
      "success": false,
      "error": "Duplicate entry"
    }
  ],
  "summary": {
    "successful": 9,
    "failed": 1
  }
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/create-tickets \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "your_session_id",
    "contactData": {
      "contactName": "John Doe",
      "phone": "+91 9876543210",
      "email": "john@example.com",
      "company": "ABC Corporation"
    },
    "count": 10,
    "delayMs": 3000
  }'
```

---

### 6. Status Check

```http
GET /api/status
```

**Response:**
```json
{
  "status": "active",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 3600.123
}
```

---

## Error Handling

All error responses include:

```json
{
  "error": "Description of error",
  "code": "ERROR_CODE"
}
```

### Common Error Codes

| Code | Status | Description |
|------|--------|-------------|
| INVALID_CREDENTIALS | 401 | Email/password incorrect |
| MISSING_FIELDS | 400 | Required fields missing |
| INVALID_SESSION | 401 | Session expired or invalid |
| RATE_LIMIT | 429 | Too many requests |
| SERVER_ERROR | 500 | Internal server error |

---

## Rate Limiting

- No enforced rate limit on free tier
- Recommended: 1 request per second minimum

---

## Testing with Postman

### 1. Import Collection

Create a new collection with these requests:

**Login:**
```
POST http://localhost:3000/api/login
Body (JSON):
{
  "email": "user@eazybusiness.in",
  "password": "password"
}
```

**Create Multiple:**
```
POST http://localhost:3000/api/create-tickets
Headers: Content-Type: application/json
Body (JSON):
{
  "sessionId": "{{sessionId}}",
  "contactData": {
    "contactName": "Test User",
    "phone": "+91 9999999999",
    "email": "test@example.com",
    "company": "Test Corp"
  },
  "count": 5,
  "delayMs": 2000
}
```

### 2. Set Variables

In Postman, set `sessionId` from login response:
1. Run login request
2. Copy `sessionId` from response
3. Set as environment variable
4. Use in subsequent requests

---

## Webhook Integration (Advanced)

To add webhook notifications:

```javascript
// In api/index.js
async function notifyWebhook(event) {
  await axios.post(process.env.WEBHOOK_URL, {
    event: event.type,
    timestamp: new Date(),
    data: event.data
  });
}
```

Set in environment:
```
WEBHOOK_URL=https://your-webhook-endpoint.com/notify
```

---

## Rate Limiting Strategy

For creating 100+ tickets safely:

```javascript
const ticketCount = 100;
const delayMs = 5000; // 5 seconds between tickets
const totalTime = (ticketCount * delayMs) / 1000 / 60; // ~8.3 minutes
```

---

## Troubleshooting

### "Invalid Session" Error

- Session may have expired
- Perform login again to get new session
- Session IDs are long strings, not passwords

### "Duplicate Entry" Error

- Ticket with same contact/subject exists
- Use different contact or subject
- Wait before creating similar tickets

### Timeouts

- Increase `delayMs` value
- Verify internet connection
- Check server logs: `vercel logs`

---

## Best Practices

1. **Always store sessionId securely**
   ```javascript
   // Bad
   console.log(sessionId);
   
   // Good
   localStorage.setItem('sessionId', sessionId); // Client-side only
   ```

2. **Handle errors gracefully**
   ```javascript
   try {
     const result = await createTickets();
   } catch (error) {
     if (error.response?.status === 401) {
       // Redirect to login
     }
   }
   ```

3. **Monitor batch operations**
   ```javascript
   // Track progress
   results.forEach(r => {
     if (r.success) {
       console.log(`✅ Ticket ${r.ticketNumber}`);
     } else {
       console.error(`❌ Ticket ${r.ticketNumber}: ${r.error}`);
     }
   });
   ```

4. **Implement retry logic**
   ```javascript
   async function createWithRetry(ticketData, maxRetries = 3) {
     for (let i = 0; i < maxRetries; i++) {
       try {
         return await createTicket(ticketData);
       } catch (error) {
         if (i === maxRetries - 1) throw error;
         await sleep(2000 * (i + 1)); // Exponential backoff
       }
     }
   }
   ```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 3.0.0 | 2024 | Vercel deployment, REST API |
| 2.6.4 | 2023 | TamperMonkey script |
| 1.0.0 | 2023 | Initial release |

---

## Support & Issues

- GitHub Issues: Submit bug reports
- Documentation: Check README.md
- Community: Ask in discussions

