#!/usr/bin/env node
/**
 * API Endpoint Testing Script
 * Tests all endpoints of the PatriotChat API using curl via child_process
 */

const { execSync } = require('child_process');

const API_URL = process.env.API_URL || 'http://localhost:3000';
const API_PREFIX = '/api';
const FULL_URL = `${API_URL}${API_PREFIX}`;

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

let testsPassed = 0;
let testsFailed = 0;

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function testEndpoint(method, endpoint, data, description) {
  log('', 'cyan');
  log(`Testing: ${description}`, 'yellow');
  log(`  Method: ${method}`);
  log(`  Endpoint: ${endpoint}`);

  try {
    let cmd;
    const fullUrl = `${API_URL}${endpoint}`;

    if (method === 'GET') {
      cmd = `curl -s -w "\\n%{http_code}" -X GET "${fullUrl}"`;
    } else if (method === 'POST') {
      log(`  Data: ${data}`);
      cmd = `curl -s -w "\\n%{http_code}" -X POST "${fullUrl}" -H "Content-Type: application/json" -d '${data}'`;
    } else if (method === 'OPTIONS') {
      cmd = `curl -s -w "\\n%{http_code}" -X OPTIONS "${fullUrl}"`;
    }

    const output = execSync(cmd, { encoding: 'utf-8' });
    const lines = output.trim().split('\n');
    const httpCode = lines[lines.length - 1];
    const body = lines.slice(0, -1).join('\n');

    log(`  Status: ${httpCode}`);

    const statusNum = parseInt(httpCode);
    if (statusNum >= 200 && statusNum < 300) {
      log(`  ✓ PASS`, 'green');
      log(`  Response:`);
      try {
        const json = JSON.parse(body);
        log(JSON.stringify(json, null, 2)
          .split('\n')
          .map(line => `    ${line}`)
          .join('\n'));
      } catch {
        log(`    ${body}`);
      }
      testsPassed++;
    } else if (statusNum >= 300 && statusNum < 400) {
      log(`  ⚠ WARNING (Status: ${httpCode})`, 'yellow');
      log(`  Response:`);
      log(`    ${body}`);
      testsFailed++;
    } else {
      log(`  ✗ FAIL`, 'red');
      log(`  Response:`);
      log(`    ${body}`);
      testsFailed++;
    }
  } catch (error) {
    log(`  ✗ ERROR`, 'red');
    log(`  ${error.message}`);
    testsFailed++;
  }
}

// Main test execution
log('================================================', 'cyan');
log('PatriotChat API Endpoint Testing (Node.js)', 'cyan');
log('================================================', 'cyan');
log(`Base URL: ${FULL_URL}`);
log(`Timestamp: ${new Date().toISOString()}`);

log('', 'cyan');
log('================================================', 'cyan');
log('1. ROOT ENDPOINT TESTS', 'cyan');
log('================================================', 'cyan');
testEndpoint('GET', API_PREFIX, '', 'GET /api - Root endpoint');

log('', 'cyan');
log('================================================', 'cyan');
log('2. STATUS ENDPOINT TESTS', 'cyan');
log('================================================', 'cyan');
testEndpoint('GET', `${API_PREFIX}/status`, '', 'GET /api/status - System status');

log('', 'cyan');
log('================================================', 'cyan');
log('3. QUERY ENDPOINT TESTS', 'cyan');
log('================================================', 'cyan');
testEndpoint('POST', `${API_PREFIX}/query`, JSON.stringify({ prompt: 'What is 2+2?' }), 'POST /api/query - Basic query');
testEndpoint('POST', `${API_PREFIX}/query`, JSON.stringify({ prompt: 'test prompt' }), 'POST /api/query - Test prompt');

log('', 'cyan');
log('================================================', 'cyan');
log('4. ERROR HANDLING TESTS', 'cyan');
log('================================================', 'cyan');
testEndpoint('POST', `${API_PREFIX}/query`, JSON.stringify({}), 'POST /api/query - Missing prompt field');
testEndpoint('GET', `${API_PREFIX}/nonexistent`, '', 'GET /api/nonexistent - Non-existent endpoint');

log('', 'cyan');
log('================================================', 'cyan');
log('5. CORS AND METHOD TESTS', 'cyan');
log('================================================', 'cyan');
testEndpoint('OPTIONS', API_PREFIX, '', 'OPTIONS /api - CORS preflight request');

// Summary
log('', 'cyan');
log('================================================', 'cyan');
log('TEST SUMMARY', 'cyan');
log('================================================', 'cyan');
log(`Passed: ${testsPassed}`, 'green');
log(`Failed: ${testsFailed}`, 'red');
log(`Total: ${testsPassed + testsFailed}`);
log('');

if (testsFailed === 0) {
  log('✓ All tests passed!', 'green');
  process.exit(0);
} else {
  log('✗ Some tests failed!', 'red');
  process.exit(1);
}
