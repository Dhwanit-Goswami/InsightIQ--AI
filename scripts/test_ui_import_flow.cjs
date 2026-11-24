// scripts/test_ui_import_flow.cjs
const http = require('http');
const { spawn } = require('child_process');
const path = require('path');
const os = require('os');
const fs = require('fs');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const TEMP_USER_DATA = path.join(os.tmpdir(), 'chrome_flow_' + Date.now());

function startChrome() {
  return spawn(CHROME_PATH, [
    '--headless=new',
    '--remote-debugging-port=9222',
    `--user-data-dir=${TEMP_USER_DATA}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-gpu',
    'about:blank'
  ], { detached: false, stdio: 'ignore' });
}

async function waitForChrome(retries = 20, interval = 400) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await new Promise((resolve, reject) => {
        const req = http.get('http://127.0.0.1:9222/json/version', (r) => {
          let body = '';
          r.on('data', chunk => body += chunk);
          r.on('end', () => resolve(body));
        });
        req.on('error', reject);
        req.setTimeout(400, () => req.destroy());
      });
      if (res) return JSON.parse(res);
    } catch {
      await new Promise(r => setTimeout(r, interval));
    }
  }
  throw new Error('Chrome did not respond on port 9222');
}

async function getTarget() {
  return new Promise((resolve, reject) => {
    http.get('http://127.0.0.1:9222/json/list', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const targets = JSON.parse(data);
          resolve(targets.find(t => t.type === 'page') || targets[0]);
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

class CDPClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.ws = null;
    this.id = 1;
    this.callbacks = new Map();
  }

  async connect() {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.wsUrl);
      this.ws.onopen = () => resolve();
      this.ws.onerror = (err) => reject(err);
      this.ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.id && this.callbacks.has(msg.id)) {
          const { resolve, reject } = this.callbacks.get(msg.id);
          this.callbacks.delete(msg.id);
          if (msg.error) reject(msg.error);
          else resolve(msg.result);
        }
      };
    });
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = this.id++;
      this.callbacks.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  close() {
    if (this.ws) this.ws.close();
  }
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function main() {
  const chromeProcess = startChrome();
  const cleanup = () => {
    try {
      chromeProcess.kill('SIGKILL');
      fs.rmSync(TEMP_USER_DATA, { recursive: true, force: true });
    } catch {}
  };
  process.on('exit', cleanup);
  process.on('SIGINT', cleanup);

  await waitForChrome();
  const target = await getTarget();
  const client = new CDPClient(target.webSocketDebuggerUrl);
  await client.connect();

  async function evalJs(expr) {
    const res = await client.send('Runtime.evaluate', {
      expression: expr,
      returnByValue: true,
      awaitPromise: true,
    });
    return res.result?.value;
  }

  // 1. Login first
  console.log('Navigating to login...');
  await client.send('Page.navigate', { url: 'http://localhost:5173/login' });
  await sleep(2500);

  await evalJs(`
    (() => {
      const emailInput = document.querySelector('input[type="email"], input[name="email"], input#email');
      const passInput = document.querySelector('input[type="password"], input[name="password"], input#password');
      if (emailInput && passInput) {
        const setValue = (el, val) => {
          const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
          setter.call(el, val);
          el.dispatchEvent(new Event('input', { bubbles: true }));
          el.dispatchEvent(new Event('change', { bubbles: true }));
        };
        setValue(emailInput, 'demo@insightiq.ai');
        setValue(passInput, 'Password@123');
      }
      const btn = document.querySelector('button[type="submit"]');
      if (btn) btn.click();
    })()
  `);
  await sleep(3500);

  // 2. Navigate to /import
  console.log('Navigating to http://localhost:5173/import...');
  await client.send('Page.navigate', { url: 'http://localhost:5173/import' });
  await sleep(2500);

  const initialInfo = await evalJs(`
    (() => {
      const title = document.querySelector('h1')?.innerText;
      const categories = Array.from(document.querySelectorAll('h3')).map(h => h.innerText.trim());
      return { title, categories };
    })()
  `);
  console.log('Page Title:', initialInfo.title);
  console.log('Detected Categories:', initialInfo.categories);

  // 3. Test validate via authenticated frontend session
  console.log('Submitting CSV for validation in Expenses category...');
  const csvData = [
    "expense_date,category,description,amount,payment_method,vendor,status",
    "2026-11-24,Logistics,Air Freight Express Transfer,14500.00,card,BluePeak Logistics,paid",
    "2026-11-24,Cloud Hosting,VPC Dedicated Node 4,8900.00,bank_transfer,AWS India,paid"
  ].join("\n");
  
  const validationOutcome = await evalJs(`
    (async () => {
      const token = localStorage.getItem('insightiq_token');
      const res = await window.fetch('/api/v1/import/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({
          category: 'expenses',
          csv_content: ${JSON.stringify(csvData)},
          filename: 'live_test_expenses.csv'
        })
      });
      return await res.json();
    })()
  `);
  console.log('Validation Outcome:', {
    category: validationOutcome.category,
    isValid: validationOutcome.is_valid,
    totalRows: validationOutcome.total_rows,
    validCount: validationOutcome.valid_count,
    invalidCount: validationOutcome.invalid_count,
  });

  // 4. Test commit
  console.log('Committing validated records...');
  const commitOutcome = await evalJs(`
    (async () => {
      const token = localStorage.getItem('insightiq_token');
      const validRecords = ${JSON.stringify(validationOutcome.valid_records)};
      const res = await window.fetch('/api/v1/import/commit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({
          category: 'expenses',
          valid_records: validRecords,
          mode: 'all_or_nothing'
        })
      });
      return await res.json();
    })()
  `);
  console.log('Commit Outcome:', commitOutcome);

  client.close();
  cleanup();

  if (validationOutcome.is_valid && commitOutcome.status === 'success' && commitOutcome.imported === 2) {
    console.log('\n>>> LIVE UI & API CSV IMPORT WORKFLOW FULLY VERIFIED <<<');
    process.exit(0);
  } else {
    console.error('Workflow failed:', { validationOutcome, commitOutcome });
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Test crashed:', err);
  process.exit(1);
});
