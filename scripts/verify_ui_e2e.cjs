// scripts/verify_ui_e2e.cjs
const http = require('http');
const { spawn } = require('child_process');
const path = require('path');
const os = require('os');
const fs = require('fs');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const TEMP_USER_DATA = path.join(os.tmpdir(), 'chrome_e2e_' + Date.now());

function startChrome() {
  console.log(`Starting Headless Chrome on port 9222 with user-data-dir: ${TEMP_USER_DATA}`);
  const chromeProcess = spawn(CHROME_PATH, [
    '--headless=new',
    '--remote-debugging-port=9222',
    `--user-data-dir=${TEMP_USER_DATA}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-background-networking',
    '--disable-sync',
    '--disable-translate',
    '--disable-gpu',
    'about:blank'
  ], {
    detached: false,
    stdio: 'ignore'
  });

  return chromeProcess;
}

async function waitForChrome(retries = 30, interval = 500) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await new Promise((resolve, reject) => {
        const req = http.get('http://127.0.0.1:9222/json/version', (r) => {
          let body = '';
          r.on('data', chunk => body += chunk);
          r.on('end', () => resolve(body));
        });
        req.on('error', reject);
        req.setTimeout(500, () => req.destroy());
      });
      if (res) return JSON.parse(res);
    } catch {
      await new Promise(r => setTimeout(r, interval));
    }
  }
  throw new Error('Chrome did not respond on port 9222 in time');
}

async function getTarget() {
  return new Promise((resolve, reject) => {
    http.get('http://127.0.0.1:9222/json/list', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const targets = JSON.parse(data);
          const page = targets.find(t => t.type === 'page') || targets[0];
          resolve(page);
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
    this.eventHandlers = new Map();
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
        } else if (msg.method && this.eventHandlers.has(msg.method)) {
          this.eventHandlers.get(msg.method)(msg.params);
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

  on(event, handler) {
    this.eventHandlers.set(event, handler);
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

  try {
    const version = await waitForChrome();
    console.log('Connected to Chrome:', version.Browser);

    const target = await getTarget();
    console.log('Created Target:', target.id);

    const client = new CDPClient(target.webSocketDebuggerUrl);
    await client.connect();

    const consoleErrors = [];
    const uncaughtExceptions = [];

    await client.send('Page.enable');
    await client.send('Runtime.enable');
    await client.send('DOM.enable');

    client.on('Runtime.exceptionThrown', (params) => {
      const text = params.exceptionDetails.text + (params.exceptionDetails.exception?.description || '');
      uncaughtExceptions.push(text);
      console.error(' [BROWSER EXCEPTION]', text);
    });

    client.on('Runtime.consoleAPICalled', (params) => {
      if (params.type === 'error') {
        const text = params.args.map(a => a.value || a.description || '').join(' ');
        consoleErrors.push(text);
        console.error(' [BROWSER CONSOLE ERROR]', text);
      }
    });

    async function evalJs(expr) {
      const res = await client.send('Runtime.evaluate', {
        expression: expr,
        returnByValue: true,
        awaitPromise: true,
      });
      return res.result?.value;
    }

    async function goto(url, waitMs = 2500) {
      await client.send('Page.navigate', { url });
      await sleep(waitMs);
    }

    const results = [];

    async function inspectPage(name, path) {
      console.log(`\n================ Testing: ${name} (${path}) ================`);
      const initialErrors = consoleErrors.length;
      const initialExceptions = uncaughtExceptions.length;

      await goto(`http://localhost:5173${path}`, 3000);

      const docState = await evalJs(`
        (() => {
          const root = document.getElementById('root');
          const text = root ? root.innerText.trim() : '';
          const hasErrorBoundary = text.includes('An unexpected view error occurred');
          const pageTitle = document.querySelector('h1, h2, h3')?.innerText || document.title;
          const htmlLength = root ? root.innerHTML.length : 0;
          const cardsCount = document.querySelectorAll('.card, [class*="rounded"]').length;
          const tablesCount = document.querySelectorAll('table').length;
          const svgsCount = document.querySelectorAll('svg').length;
          const buttonsCount = document.querySelectorAll('button').length;

          return {
            isEmpty: htmlLength < 50 || text.length === 0,
            hasErrorBoundary,
            pageTitle,
            textSample: text.slice(0, 160).replace(/\\s+/g, ' '),
            cardsCount,
            tablesCount,
            svgsCount,
            buttonsCount
          };
        })()
      `);

      const newErrors = consoleErrors.slice(initialErrors);
      const newExceptions = uncaughtExceptions.slice(initialExceptions);

      const status = (docState.isEmpty || docState.hasErrorBoundary || newExceptions.length > 0)
        ? 'FAILED'
        : (newErrors.length > 0 ? 'WARNING' : 'PASSED');

      const result = {
        name,
        path,
        status,
        pageTitle: docState.pageTitle,
        cardsCount: docState.cardsCount,
        tablesCount: docState.tablesCount,
        svgsCount: docState.svgsCount,
        buttonsCount: docState.buttonsCount,
        hasErrorBoundary: docState.hasErrorBoundary,
        newErrors,
        newExceptions,
        preview: docState.textSample
      };

      results.push(result);
      console.log(`Result: ${status}`);
      console.log(` - Title: ${docState.pageTitle}`);
      console.log(` - Elements: ${docState.cardsCount} cards/boxes, ${docState.tablesCount} tables, ${docState.svgsCount} svgs, ${docState.buttonsCount} buttons`);
      console.log(` - Has Error Boundary: ${docState.hasErrorBoundary}`);
      console.log(` - Preview: "${docState.textSample}..."`);
      if (newErrors.length) console.log(` - Console Errors:`, newErrors);
      if (newExceptions.length) console.log(` - Uncaught Exceptions:`, newExceptions);
    }

    // 1. Landing Page
    await inspectPage('Landing Page', '/');

    // 2. Login Page
    await inspectPage('Login Page', '/login');

    // 3. Perform Login
    console.log('\n--- Submitting Login credentials (demo@insightiq.ai) ---');
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
      })()
    `);
    await sleep(400);

    await evalJs(`
      (() => {
        const btn = document.querySelector('button[type="submit"]');
        if (btn) btn.click();
      })()
    `);
    console.log('Submitted login credentials. Waiting 3.5s for authentication token and redirect...');
    await sleep(3500);

    // 4. Test all core application routes
    await inspectPage('Dashboard', '/dashboard');
    await inspectPage('Analytics', '/analytics');
    await inspectPage('Sales', '/sales');
    await inspectPage('Inventory', '/inventory');
    await inspectPage('Customers', '/customers');
    await inspectPage('Expenses', '/expenses');
    await inspectPage('Reports', '/reports');
    await inspectPage('AI Insights', '/ai-insights');
    await inspectPage('AI Assistant', '/ai-assistant');
    await inspectPage('Company Profile', '/company');
    await inspectPage('Personal Profile', '/profile');
    await inspectPage('Settings', '/settings');
    await inspectPage('Data Import', '/import');

    console.log('\n========================================================================================');
    console.log('                       INSIGHTIQ BROWSER VERIFICATION SUMMARY                          ');
    console.log('========================================================================================');
    console.table(results.map(r => ({
      Route: r.path,
      Page: r.name,
      Status: r.status,
      'Cards/Boxes': r.cardsCount,
      Tables: r.tablesCount,
      SVGs: r.svgsCount,
      Buttons: r.buttonsCount,
      'Console Errs': r.newErrors.length,
      'Uncaught Excs': r.newExceptions.length,
    })));

    client.close();
    cleanup();

    const allPassed = results.every(r => r.status === 'PASSED' || r.status === 'WARNING');
    const failures = results.filter(r => r.status === 'FAILED');
    if (!allPassed) {
      console.error(`\nFAILED PAGES (${failures.length}):`, failures.map(f => `${f.name} (${f.path})`));
      process.exit(1);
    } else {
      console.log('\nALL 14 ROUTES LOADED AND VERIFIED SUCCESSFULLY WITH 0 WHITE SCREENS AND 0 UNCAUGHT EXCEPTIONS!');
      process.exit(0);
    }
  } catch (err) {
    console.error('Test execution failed:', err);
    cleanup();
    process.exit(1);
  }
}

main();
