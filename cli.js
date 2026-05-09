#!/usr/bin/env node

import axios from 'axios';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const API_URL = process.env.API_URL || 'http://localhost:3000';

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function main() {
  console.log('\n🎫 EazyBusiness Ticket Automation CLI\n');

  const email = await question('📧 Email: ');
  const password = await question('🔑 Password: ');

  try {
    console.log('\n⏳ Authenticating...');
    const loginResponse = await axios.post(`${API_URL}/api/login`, {
      email,
      password
    });

    const sessionId = loginResponse.data.sessionId;
    console.log('✅ Authentication successful!\n');

    const contactName = await question('👤 Contact Name: ');
    const phone = await question('📱 Phone: ');
    const contactEmail = await question('✉️ Email: ');
    const company = await question('🏢 Company: ');
    const count = parseInt(await question('🔢 Number of Tickets (default 10): ') || '10');
    const delayMs = parseInt(await question('⏱️ Delay in ms (default 3000): ') || '3000');

    console.log(`\n⏳ Creating ${count} tickets with ${delayMs}ms delay...\n`);

    const response = await axios.post(`${API_URL}/api/create-tickets`, {
      sessionId,
      contactData: {
        contactName,
        phone,
        email: contactEmail,
        company
      },
      count,
      delayMs
    });

    console.log(`\n✅ Batch Complete!\n`);
    console.log(`Successful: ${response.data.summary.successful}/${count}`);
    console.log(`Failed: ${response.data.summary.failed}/${count}\n`);

    response.data.results.forEach(r => {
      const status = r.success ? '✅' : '❌';
      console.log(`${status} Ticket ${r.ticketNumber}: ${r.success ? 'Created' : r.error}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  }

  rl.close();
}

main();
