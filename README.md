# EazyBusiness Ticket Automation - Vercel Edition

Automated ticket creation system for EazyBusiness running on Vercel infrastructure. Create 10, 50, or 100 tickets automatically with sequential breaks.

## 🚀 Features

- **Web-based Dashboard**: Easy-to-use UI for authentication and ticket creation
- **Batch Processing**: Create multiple tickets automatically with configurable delays
- **Responsive Design**: Works on desktop and mobile
- **Session Management**: Secure session handling
- **RESTful API**: Full API for programmatic access
- **Sequential Breaks**: Configurable delays between ticket creation
- **Error Handling**: Comprehensive error reporting

## 📋 Prerequisites

- Node.js 16+ (for local development)
- Vercel Account (for deployment)
- EazyBusiness credentials

## 🛠️ Local Setup

### 1. Clone or Download

```bash
cd eazy-ticket-automation
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

```bash
cp .env.example .env
# Edit .env with your settings
```

### 4. Run Locally

```bash
npm run dev
# Server will run on http://localhost:3000
```

### 5. Access Dashboard

Open your browser and go to:
```
http://localhost:3000/dashboard
```

## 🚀 Vercel Deployment

### Option 1: Deploy via Vercel CLI

```bash
# Install Vercel CLI globally
npm i -g vercel

# Deploy from project directory
vercel

# Follow the prompts to connect your GitHub and deploy
```

### Option 2: Deploy via GitHub

1. Push your code to GitHub
2. Go to https://vercel.com/new
3. Import your GitHub repository
4. Vercel will auto-detect the configuration
5. Add environment variables in Vercel dashboard
6. Click "Deploy"

### Option 3: Deploy via Vercel UI

1. Go to https://vercel.com/new
2. Select "Other" (if not GitHub)
3. Paste your repository URL
4. Configure and deploy

## 📝 Configuration

### Environment Variables

Set these in `.env` (local) or Vercel dashboard (production):

```
PORT=3000
NODE_ENV=production
EAZY_BASE_URL=https://help.eazybusiness.in
CORS_ORIGIN=*
```

## 📱 API Endpoints

### 1. Dashboard UI
```
GET /dashboard
```
Access the web interface.

### 2. Login
```
POST /api/login
Content-Type: application/json

{
  "email": "your@email.com",
  "password": "your-password"
}

Response:
{
  "success": true,
  "sessionId": "abc123...",
  "message": "Login successful"
}
```

### 3. Create Single Ticket
```
POST /api/create-ticket
Content-Type: application/json

{
  "sessionId": "abc123...",
  "ticketData": {
    "contactName": "John Doe",
    "phone": "+91 9876543210",
    "email": "john@example.com",
    "company": "ABC Corp",
    "subject": "Login Issue",
    "category": "Login Issue",
    "rca": "Restart App"
  }
}
```

### 4. Create Multiple Tickets
```
POST /api/create-tickets
Content-Type: application/json

{
  "sessionId": "abc123...",
  "contactData": {
    "contactName": "John Doe",
    "phone": "+91 9876543210",
    "email": "john@example.com",
    "company": "ABC Corp"
  },
  "count": 10,
  "delayMs": 3000
}

Response:
{
  "success": true,
  "totalRequested": 10,
  "results": [
    {
      "ticketNumber": 1,
      "success": true,
      "ticketId": "TKT-12345"
    },
    ...
  ],
  "summary": {
    "successful": 10,
    "failed": 0
  }
}
```

### 5. Status Check
```
GET /api/status

Response:
{
  "status": "active",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 3600.123
}
```

## 🎯 Usage

### Web Dashboard

1. Open `https://your-vercel-app.vercel.app/dashboard`
2. Enter your EazyBusiness credentials
3. Click "Login & Authenticate"
4. Fill in contact information
5. Configure ticket count and delay
6. Click "Create Multiple" to start automation

### Command Line / Postman

1. Login first to get sessionId
2. Use the `/api/create-tickets` endpoint
3. Monitor results

## 🔄 Ticket Types

The system automatically rotates through these predefined ticket types:

- Login Issue → `Restart App`
- Distributor Mapping Issue → `Ask Mis Admin`
- Reset Device Issue → `Reset Device In Portal`
- Knowledge Gap Issue → `Traning Provided`
- Logout Issue → `Not Able To Login Twice In A Same Day`
- Live Location Tracking Issue → `Restart And Sync`
- Invalid City → `Sync Is Not Happend`
- Sync Issue → `Restart And Sync`

## ⏱️ Timing Control

### Sequential Breaks

The `delayMs` parameter controls delays between ticket creation:

- **1000ms (1 sec)**: Fastest, good for testing
- **3000ms (3 sec)**: Default, recommended
- **5000ms (5 sec)**: Conservative, safe

Example: Creating 10 tickets with 3000ms delay takes ~30 seconds.

## 🔐 Security

- Never commit `.env` file
- Use Vercel's encrypted environment variables
- Credentials are sent over HTTPS only
- Sessions are server-side managed

## 📊 Monitoring

Check your Vercel dashboard for:
- Function logs
- Error reports
- Request metrics
- Usage statistics

## 🐛 Troubleshooting

### Login Fails
- Verify credentials are correct
- Check internet connection
- Ensure EazyBusiness server is accessible

### Tickets Not Creating
- Verify login was successful
- Check contact data is complete
- Review API logs for errors
- Ensure delay is sufficient

### High Error Rate
- Increase `delayMs` value
- Check contact information format
- Verify API rate limits aren't hit

### Vercel Deployment Issues

```bash
# Check build logs
vercel logs

# Rebuild and deploy
vercel --prod
```

## 📈 Scaling

For creating 100+ tickets:

1. Increase `delayMs` to 5000ms+
2. Use multiple sessions if available
3. Monitor Vercel's usage limits
4. Consider batch processing

## 🔗 Project Structure

```
eazy-ticket-automation/
├── api/
│   └── index.js          # Main server file
├── package.json          # Dependencies
├── vercel.json          # Vercel config
├── .env.example         # Environment template
├── .gitignore          # Git ignore rules
└── README.md           # This file
```

## 📦 Dependencies

- **express**: Web framework
- **axios**: HTTP client
- **cors**: Cross-origin support
- **body-parser**: JSON parsing
- **dotenv**: Environment variables

## 📄 License

MIT

## 🤝 Support

For issues or features:
1. Check the troubleshooting section
2. Review API logs
3. Check EazyBusiness documentation

## ⚠️ Disclaimer

This tool is for authorized use only. Ensure you have proper permissions to create tickets on your EazyBusiness portal.

---

**Version**: 3.0.0  
**Last Updated**: 2024
