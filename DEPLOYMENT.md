# Vercel Deployment Guide

## Quick Start (5 minutes)

### Step 1: Prepare Your Project

```bash
# Clone or download the project
cd eazy-ticket-automation

# Install dependencies locally (optional for testing)
npm install
```

### Step 2: Create GitHub Repository

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/eazy-ticket-automation.git
git push -u origin main
```

### Step 3: Deploy to Vercel

#### Method A: Using GitHub (Recommended)

1. Go to https://vercel.com
2. Sign up / Log in with GitHub
3. Click "New Project"
4. Select your GitHub repository
5. Vercel auto-detects the configuration
6. Click "Deploy"
7. Your app will be live at `https://your-project.vercel.app`

#### Method B: Using Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy from project directory
vercel

# For production
vercel --prod
```

#### Method C: Direct Upload

1. Visit https://vercel.com/new
2. Select "Other" for custom project
3. Upload your project folder
4. Configure and deploy

### Step 4: Set Environment Variables

1. Go to your Vercel dashboard
2. Open your project settings
3. Click "Environment Variables"
4. Add:
   - `NODE_ENV`: `production`
   - `PORT`: `3000`
   - `EAZY_BASE_URL`: `https://help.eazybusiness.in`

### Step 5: Access Your Application

Open: `https://your-project.vercel.app/dashboard`

## Post-Deployment

### Monitor Logs

```bash
vercel logs your-project.vercel.app
```

### Redeploy

```bash
git push origin main  # Auto-redeploy on GitHub changes
# OR
vercel --prod
```

### Custom Domain

1. In Vercel dashboard, go to "Domains"
2. Add your custom domain
3. Update DNS records (instructions provided)

## Troubleshooting

### Build Fails

```bash
# Check build logs in Vercel dashboard
vercel logs --follow
```

### Function Errors

1. Check Vercel dashboard logs
2. Review `api/index.js` for errors
3. Ensure all dependencies are in `package.json`

### Session Expires

- Vercel functions are serverless; sessions won't persist across requests
- Implement session storage or ask user to login again

## Optimization Tips

1. **Add Caching**: Vercel automatically caches responses
2. **Monitor Usage**: Check Vercel's usage limits
3. **Use Edge Functions**: For ultra-low latency
4. **Add Analytics**: Vercel Web Analytics

## Scaling

### Handle More Requests

- Increase `delayMs` to prevent rate limiting
- Use Vercel Enterprise for unlimited functions
- Consider database caching for sessions

### Database Integration (Optional)

Add to `package.json`:
```json
"mongodb": "^5.0.0"
```

Then implement session persistence:
```javascript
// Store sessions in database instead of memory
// This allows scaling to multiple instances
```

## Security

1. Never commit `.env` to GitHub
2. Use Vercel's environment variables
3. Enable branch protection on main
4. Use GitHub secrets for CI/CD

## Monitoring & Analytics

### Vercel Dashboard

- Real-time function invocations
- Error tracking
- Response times
- Usage statistics

### Add Sentry for Error Tracking

```bash
npm install @sentry/node
```

Then in `api/index.js`:
```javascript
import * as Sentry from '@sentry/node';

Sentry.init({ dsn: process.env.SENTRY_DSN });
```

## Cost Estimation

**Free Tier**:
- 100,000 function invocations/month
- 24/7 uptime
- SSL included

**Pro Plan ($20/month)**:
- 1,000,000 invocations/month
- Priority support
- Advanced analytics

## Next Steps

1. ✅ Deploy to Vercel
2. Test the dashboard
3. Create a few test tickets
4. Monitor logs and performance
5. Share your app URL

## Support

- Vercel Docs: https://vercel.com/docs
- Community: https://github.com/vercel/community
- Status: https://vercel.statuspage.io

---

**Happy Automating!** 🚀
