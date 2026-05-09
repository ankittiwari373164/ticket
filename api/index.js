import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ==================== AUTHENTICATION ====================
class EazyBusinessAuth {
  constructor(sessionId = null) {
    this.sessionId = sessionId;
    this.cookies = {};
    this.baseURL = 'https://help.eazybusiness.in';
  }

  // Direct session ID validation
  validateSession(sessionId) {
    if (!sessionId || sessionId.length < 10) {
      return false;
    }
    this.sessionId = sessionId;
    console.log('✅ Session ID set');
    return true;
  }

  async login(email, password) {
    try {
      console.log('🔐 Logging in...');
      const response = await axios.post(
        `${this.baseURL}/api/login`,
        { email, password },
        {
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
          }
        }
      );

      // Extract session from response
      if (response.data.sessionId) {
        this.sessionId = response.data.sessionId;
        console.log('✅ Login successful');
        return true;
      }
      if (response.data.token) {
        this.sessionId = response.data.token;
        console.log('✅ Login successful (token)');
        return true;
      }
      
      // Store cookies if available
      const setCookie = response.headers['set-cookie'];
      if (setCookie) {
        this.cookies = setCookie;
      }
      
      return false;
    } catch (error) {
      console.error('❌ Login failed:', error.message);
      return false;
    }
  }

  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
    };

    if (this.sessionId) {
      headers['Authorization'] = `Bearer ${this.sessionId}`;
      headers['X-Session-ID'] = this.sessionId;
      headers['Cookie'] = `XSRF-TOKEN=${this.sessionId}`;
    }

    if (this.cookies) {
      headers['Cookie'] = this.cookies;
    }

    return headers;
  }
}

// ==================== TICKET CREATION ====================
class TicketAutomation {
  constructor(auth) {
    this.auth = auth;
    this.baseURL = 'https://help.eazybusiness.in';
    this.subjectMapping = {
      'Login Issue': { category: 'Login Issue', rca: 'Restart App' },
      'Distributor Mapping Issue': { category: 'Route Management Issue', rca: 'Ask Mis Admin' },
      'Reset Device Issue': { category: 'Reset Device', rca: 'Reset Device In Portal' },
      'Knowledge Gap Issue': { category: 'Application Knowledge Gap', rca: 'Traning Provided' },
      'Logout Issue': { category: 'Logout Issues', rca: 'Not Able To Login Twice In A Same Day' },
      'Live Location Tracking Issue': { category: 'Live Location Tracking', rca: 'Restart And Sync' },
      'Invalid City': { category: 'Data Issue', rca: 'Sync Is Not Happend' },
      'Sync Issue': { category: 'Data Issue', rca: 'Restart And Sync' }
    };
  }

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async createTicket(ticketData) {
    try {
      const payload = {
        contactName: ticketData.contactName,
        name: ticketData.subject,
        category_c: ticketData.category,
        rca_type_c: ticketData.rca,
        sales_info_c: ticketData.employeeName || ticketData.contactName,
        support_mode: 'Bug',
        status: 'Resolved',
        case_origin_c: 'Self',
        phone_no: ticketData.phone,
        email_id: ticketData.email,
        company: ticketData.company
      };

      console.log(`🎫 Creating ticket: ${ticketData.subject}`);

      const response = await axios.post(
        `${this.baseURL}/api/records/Ticket`,
        payload,
        { headers: this.auth.getHeaders() }
      );

      if (response.status === 200 || response.status === 201) {
        console.log(`✅ Ticket created: ${response.data.id || 'Success'}`);
        return { success: true, ticketId: response.data.id };
      }

      return { success: false, error: 'Unknown error' };
    } catch (error) {
      console.error(`❌ Failed to create ticket:`, error.message);
      return { success: false, error: error.message };
    }
  }

  async createMultipleTickets(contactData, count = 10, delayMs = 3000) {
    const results = [];

    for (let i = 0; i < count; i++) {
      try {
        const subjectKeys = Object.keys(this.subjectMapping);
        const randomSubject = subjectKeys[i % subjectKeys.length];
        const logic = this.subjectMapping[randomSubject];

        const ticketData = {
          contactName: contactData.contactName,
          employeeName: contactData.employeeName || contactData.contactName,
          phone: contactData.phone,
          email: contactData.email,
          company: contactData.company,
          subject: `${randomSubject} - Ticket ${i + 1}`,
          category: logic.category,
          rca: logic.rca
        };

        const result = await this.createTicket(ticketData);
        results.push({
          ticketNumber: i + 1,
          ...result
        });

        if (i < count - 1) {
          console.log(`⏳ Waiting ${delayMs}ms before next ticket...`);
          await this.sleep(delayMs);
        }
      } catch (err) {
        results.push({
          ticketNumber: i + 1,
          success: false,
          error: err.message
        });
      }
    }

    return results;
  }
}

// ==================== API ROUTES ====================

// Health check
app.get('/', (req, res) => {
  res.json({
    status: 'running',
    message: 'EazyBusiness Ticket Automation Server',
    version: '3.0.0',
    endpoints: {
      login: 'POST /api/login (email/password)',
      validateSession: 'POST /api/validate-session (sessionId)',
      createTicket: 'POST /api/create-ticket',
      createMultiple: 'POST /api/create-tickets',
      status: 'GET /api/status'
    }
  });
});

// Dashboard UI
app.get('/dashboard', (req, res) => {
  res.send(getDashboardHTML());
});

// Login endpoint (with email/password)
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  const auth = new EazyBusinessAuth();
  const success = await auth.login(email, password);

  if (success) {
    res.json({
      success: true,
      sessionId: auth.sessionId,
      message: 'Login successful'
    });
  } else {
    res.status(401).json({
      success: false,
      error: 'Login failed'
    });
  }
});

// Validate session endpoint
app.post('/api/validate-session', (req, res) => {
  const { sessionId } = req.body;

  if (!sessionId) {
    return res.status(400).json({ error: 'Session ID required' });
  }

  const auth = new EazyBusinessAuth();
  const isValid = auth.validateSession(sessionId);

  if (isValid) {
    res.json({
      success: true,
      sessionId: sessionId,
      message: 'Session validated'
    });
  } else {
    res.status(401).json({
      success: false,
      error: 'Invalid session ID'
    });
  }
});

// Create single ticket
app.post('/api/create-ticket', async (req, res) => {
  const { sessionId, ticketData } = req.body;

  if (!sessionId || !ticketData) {
    return res.status(400).json({ error: 'Session ID and ticket data required' });
  }

  const auth = new EazyBusinessAuth(sessionId);
  const automation = new TicketAutomation(auth);
  const result = await automation.createTicket(ticketData);

  res.json(result);
});

// Create multiple tickets
app.post('/api/create-tickets', async (req, res) => {
  const { sessionId, contactData, count = 10, delayMs = 3000 } = req.body;

  if (!sessionId || !contactData) {
    return res.status(400).json({ error: 'Session ID and contact data required' });
  }

  const auth = new EazyBusinessAuth(sessionId);
  const automation = new TicketAutomation(auth);
  const results = await automation.createMultipleTickets(contactData, count, delayMs);

  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  res.json({
    success: true,
    summary: {
      total: results.length,
      successful,
      failed
    },
    results
  });
});

// Status endpoint
app.get('/api/status', (req, res) => {
  res.json({
    status: 'operational',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Dashboard HTML generator
function getDashboardHTML() {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>EazyBusiness Ticket Automation</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
        }

        .container {
            background: white;
            padding: 40px;
            border-radius: 10px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            max-width: 500px;
            width: 100%;
        }

        h1 {
            color: #333;
            margin-bottom: 10px;
            text-align: center;
        }

        .subtitle {
            color: #666;
            text-align: center;
            margin-bottom: 30px;
            font-size: 14px;
        }

        .auth-method-tabs {
            display: flex;
            gap: 10px;
            margin-bottom: 30px;
            border-bottom: 2px solid #eee;
        }

        .auth-method-tabs button {
            flex: 1;
            padding: 12px;
            border: none;
            background: #888;
            color: white;
            cursor: pointer;
            font-size: 14px;
            font-weight: 600;
            transition: all 0.3s;
        }

        .auth-method-tabs button.active {
            background: #667eea;
        }

        .form-group {
            margin-bottom: 20px;
        }

        label {
            display: block;
            margin-bottom: 8px;
            color: #333;
            font-weight: 600;
            font-size: 14px;
        }

        input[type="text"],
        input[type="email"],
        input[type="password"],
        input[type="tel"],
        input[type="number"] {
            width: 100%;
            padding: 12px;
            border: 2px solid #eee;
            border-radius: 5px;
            font-size: 14px;
            transition: border-color 0.3s;
        }

        input:focus {
            outline: none;
            border-color: #667eea;
        }

        .btn-login,
        .btn-single,
        .btn-multiple {
            width: 100%;
            padding: 12px;
            border: none;
            border-radius: 5px;
            color: white;
            font-weight: 600;
            cursor: pointer;
            font-size: 14px;
            transition: all 0.3s;
            margin-top: 10px;
        }

        .btn-login {
            background: #667eea;
        }

        .btn-login:hover {
            background: #5568d3;
            transform: translateY(-2px);
        }

        .btn-single {
            background: #48bb78;
        }

        .btn-single:hover {
            background: #38a169;
        }

        .btn-multiple {
            background: #ed8936;
        }

        .btn-multiple:hover {
            background: #dd6b20;
        }

        .button-group {
            display: flex;
            gap: 10px;
        }

        .button-group button {
            flex: 1;
            margin: 0 !important;
        }

        .status {
            padding: 15px;
            border-radius: 5px;
            margin-top: 20px;
            text-align: center;
            font-weight: 600;
            display: none;
        }

        .status.success {
            display: block;
            background: #c6f6d5;
            color: #22543d;
        }

        .status.error {
            display: block;
            background: #fed7d7;
            color: #742a2a;
        }

        .status.loading {
            display: block;
            background: #bee3f8;
            color: #2c5282;
        }

        .results {
            margin-top: 20px;
            padding: 15px;
            background: #f7fafc;
            border-radius: 5px;
            max-height: 300px;
            overflow-y: auto;
        }

        .result-item {
            padding: 8px;
            margin: 5px 0;
            border-radius: 3px;
            font-size: 13px;
        }

        .result-item.success {
            background: #c6f6d5;
            color: #22543d;
        }

        .result-item.error {
            background: #fed7d7;
            color: #742a2a;
        }

        .advanced {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 2px solid #eee;
        }

        #emailAuth,
        #sessionAuth {
            display: none;
        }

        #emailAuth.show,
        #sessionAuth.show {
            display: block;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎫 EazyBusiness Tickets</h1>
        <p class="subtitle">Automated Ticket Creation System</p>

        <div class="auth-method-tabs">
            <button id="methodEmail" class="active" onclick="setAuthMethod('email')">Email & Password</button>
            <button id="methodSession" onclick="setAuthMethod('session')">Session ID</button>
        </div>

        <div id="emailAuth" class="show">
            <div class="form-group">
                <label>📧 Email</label>
                <input type="email" id="email" placeholder="your@email.com" required>
            </div>

            <div class="form-group">
                <label>🔑 Password</label>
                <input type="password" id="password" placeholder="Enter password" required>
            </div>

            <button class="btn-login" onclick="handleLogin()">Login</button>
        </div>

        <div id="sessionAuth">
            <div class="form-group">
                <label>🔐 Session ID</label>
                <input type="text" id="sessionInput" placeholder="Enter your session ID" required>
            </div>

            <button class="btn-login" onclick="handleSessionValidation()">Validate Session ID</button>
        </div>

        <div id="loggedInSection" style="display:none; margin-top: 30px;">
            <h3 style="margin-bottom: 20px; color: #333;">Contact Information</h3>

            <div class="form-group">
                <label>👤 Contact Name</label>
                <input type="text" id="contactName" placeholder="John Doe" required>
            </div>

            <div class="form-group">
                <label>📱 Phone</label>
                <input type="tel" id="phone" placeholder="+91 9876543210" required>
            </div>

            <div class="form-group">
                <label>✉️ Email</label>
                <input type="email" id="contactEmail" placeholder="contact@email.com" required>
            </div>

            <div class="form-group">
                <label>🏢 Company</label>
                <input type="text" id="company" placeholder="Company Name" required>
            </div>

            <div class="advanced">
                <h3 style="margin-bottom: 15px; color: #333;">Create Tickets</h3>

                <div class="form-group">
                    <label>🔢 Number of Tickets</label>
                    <input type="number" id="ticketCount" value="10" min="1" max="50">
                </div>

                <div class="form-group">
                    <label>⏱️ Delay Between Tickets (ms)</label>
                    <input type="number" id="delay" value="3000" min="1000" step="1000">
                </div>

                <div class="button-group">
                    <button class="btn-single" onclick="createSingleTicket()">Create 1 Ticket</button>
                    <button class="btn-multiple" onclick="createMultipleTickets()">Create Multiple</button>
                </div>
            </div>
        </div>

        <div id="status" class="status"></div>
        <div id="results" class="results" style="display:none;"></div>
    </div>

    <script>
        let sessionId = null;
        let authMethod = 'email';

        function setAuthMethod(method) {
            authMethod = method;
            const emailDiv = document.getElementById('emailAuth');
            const sessionDiv = document.getElementById('sessionAuth');
            const emailBtn = document.getElementById('methodEmail');
            const sessionBtn = document.getElementById('methodSession');

            if (method === 'email') {
                emailDiv.style.display = 'block';
                sessionDiv.style.display = 'none';
                emailBtn.style.background = '#667eea';
                sessionBtn.style.background = '#888';
            } else {
                emailDiv.style.display = 'none';
                sessionDiv.style.display = 'block';
                emailBtn.style.background = '#888';
                sessionBtn.style.background = '#667eea';
            }
        }

        async function handleSessionValidation() {
            const sessionInput = document.getElementById('sessionInput').value;

            if (!sessionInput) {
                showStatus('error', 'Please enter your session ID');
                return;
            }

            showStatus('loading', 'Validating session ID...');

            try {
                const response = await fetch('/api/validate-session', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ sessionId: sessionInput })
                });

                if (response.ok) {
                    const data = await response.json();
                    sessionId = data.sessionId;
                    showStatus('success', '✅ Session validated! You can now create tickets.');
                    document.getElementById('loggedInSection').style.display = 'block';
                } else {
                    showStatus('error', 'Session validation failed. Please check your session ID.');
                }
            } catch (err) {
                showStatus('error', 'Error: ' + err.message);
            }
        }

        async function handleLogin() {
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            if (!email || !password) {
                showStatus('error', 'Please enter email and password');
                return;
            }

            showStatus('loading', 'Logging in...');

            try {
                const response = await fetch('/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                if (response.ok) {
                    const data = await response.json();
                    sessionId = data.sessionId;
                    showStatus('success', '✅ Login successful! You can now create tickets.');
                    document.getElementById('loggedInSection').style.display = 'block';
                } else {
                    showStatus('error', 'Login failed. Please check your credentials.');
                }
            } catch (err) {
                showStatus('error', 'Error: ' + err.message);
            }
        }

        async function createSingleTicket() {
            if (!sessionId) {
                showStatus('error', 'Please login first');
                return;
            }

            const ticketData = {
                contactName: document.getElementById('contactName').value,
                phone: document.getElementById('phone').value,
                email: document.getElementById('contactEmail').value,
                company: document.getElementById('company').value,
                subject: 'Login Issue - Ticket 1',
                category: 'Login Issue',
                rca: 'Restart App'
            };

            showStatus('loading', 'Creating ticket...');

            try {
                const response = await fetch('/api/create-ticket', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ sessionId, ticketData })
                });

                const data = await response.json();
                if (data.success) {
                    showStatus('success', '✅ Ticket created successfully!');
                } else {
                    showStatus('error', 'Failed: ' + data.error);
                }
            } catch (err) {
                showStatus('error', 'Error: ' + err.message);
            }
        }

        async function createMultipleTickets() {
            if (!sessionId) {
                showStatus('error', 'Please login first');
                return;
            }

            const contactData = {
                contactName: document.getElementById('contactName').value,
                phone: document.getElementById('phone').value,
                email: document.getElementById('contactEmail').value,
                company: document.getElementById('company').value
            };

            const count = parseInt(document.getElementById('ticketCount').value);
            const delayMs = parseInt(document.getElementById('delay').value);

            showStatus('loading', \`Creating \${count} tickets with \${delayMs}ms delay...\`);

            try {
                const response = await fetch('/api/create-tickets', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ sessionId, contactData, count, delayMs })
                });

                const data = await response.json();
                const resultsDiv = document.getElementById('results');
                resultsDiv.innerHTML = \`<strong>Summary:</strong><br>✅ Successful: \${data.summary.successful}<br>❌ Failed: \${data.summary.failed}<br><br><strong>Details:</strong>\`;
                
                data.results.forEach(r => {
                    const div = document.createElement('div');
                    div.className = \`result-item \${r.success ? 'success' : 'error'}\`;
                    div.textContent = \`Ticket \${r.ticketNumber}: \${r.success ? '✅ Created' : '❌ ' + r.error}\`;
                    resultsDiv.appendChild(div);
                });

                resultsDiv.style.display = 'block';
                showStatus('success', \`✅ Batch creation complete! \${data.summary.successful}/\${count} successful\`);
            } catch (err) {
                showStatus('error', 'Error: ' + err.message);
            }
        }

        function showStatus(type, message) {
            const statusDiv = document.getElementById('status');
            statusDiv.className = \`status \${type}\`;
            statusDiv.textContent = message;
        }
    </script>
</body>
</html>
  `;
}

// Export the Express app as a serverless handler for Vercel
export default app;