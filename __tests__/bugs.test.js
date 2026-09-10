const request = require('supertest');
const app = require('../server');
const fs = require('fs');
const path = require('path');

describe('Candidate Check Tracker Bugs', () => {

  beforeEach(async () => {
    // Reset data before each test
    await request(app).post('/api/reset');
  });

  // 1. GET /api/checks/:id — wrong-status-code
  it('1. GET /api/checks/:id — should return 404 for non-existent check, not 200 {}', async () => {
    const res = await request(app).get('/api/checks/999');
    expect(res.status).toBe(404); // Fails because it's 200
  });

  // 2. POST /api/checks — wrong-status-code
  it('2. POST /api/checks — should return 201 Created, not 200 OK', async () => {
    const res = await request(app).post('/api/checks').send({ candidateId: 1, type: 'IDENTITY' });
    expect(res.status).toBe(201); // Fails because it's 200
  });

  // 3. POST /api/checks — missing-enum-validation
  it('3. POST /api/checks — should reject invalid type with 400', async () => {
    const res = await request(app).post('/api/checks').send({ candidateId: 1, type: 'INVALID_TYPE' });
    expect(res.status).toBe(400); // Fails because it's 200
  });

  // 4. POST /api/checks — wrong-date-time-handling
  it('4. POST /api/checks — should format createdAt as ISO 8601', async () => {
    const res = await request(app).post('/api/checks').send({ candidateId: 1, type: 'IDENTITY' });
    expect(res.body.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/); // Fails because it's like "Thu Sep 10 2026"
  });

  // 5. POST /api/checks — wrong-persisted-default
  it('5. POST /api/checks — should persist default status as PENDING (uppercase)', async () => {
    const res = await request(app).post('/api/checks').send({ candidateId: 1, type: 'IDENTITY' });
    expect(res.body.status).toBe('PENDING'); // Fails because it's "pending"
  });

  // 6. PATCH /api/checks/:id/status — missing-enum-validation
  it('6. PATCH /api/checks/:id/status — should reject invalid status with 400', async () => {
    const res = await request(app).patch('/api/checks/1/status').send({ status: 'BADSTATUS' });
    expect(res.status).toBe(400); // Fails because it's 200
  });

  // 10. GET /api/checks — case-sensitivity-mismatch
  it('10. GET /api/checks — status filter should be case-insensitive', async () => {
    const resLowerCase = await request(app).get('/api/checks?status=pending');
    expect(resLowerCase.body.length).toBeGreaterThan(0); // Fails because it returns []
  });

  // 11. GET /api/checks — substring-vs-exact-match
  it('11. GET /api/checks — type filter should use exact match, not substring', async () => {
    const res = await request(app).get('/api/checks?type=EDU');
    expect(res.body.length).toBe(0); // Fails because it returns EDUCATION checks
  });

  // 12. POST /api/checks — missing-reference-or-state-check
  it('12. POST /api/checks — should reject non-existent candidateId with 400', async () => {
    const res = await request(app).post('/api/checks').send({ candidateId: 999, type: 'IDENTITY' });
    expect(res.status).toBe(400); // Fails because it's 200
  });

  // 13. GET /api/checks — wrong-filter-boolean-logic
  it('13. GET /api/checks — candidateId filter should return matches', async () => {
    const res = await request(app).get('/api/checks?candidateId=1');
    expect(res.body.length).toBeGreaterThan(0); // Fails because it returns []
  });

});

describe('UI Bugs', () => {
  // 7. UI — wrong-dropdown-default-selection
  it('7. UI — Type dropdown should default to "All Types" (value="")', () => {
    const html = fs.readFileSync(path.join(__dirname, '../public/index.html'), 'utf8');
    // The bug is that IDENTITY is the first option under the filter-type select
    const match = html.match(/<select id="filter-type">\s*<option value="([^"]*)">/);
    expect(match[1]).toBe(''); // Fails because it is "IDENTITY"
  });

  // 9. UI — wrong-status-badge-color
  it('9. UI — DISCREPANCY color should not be the same as VERIFIED (green #036B26)', () => {
    const appJs = fs.readFileSync(path.join(__dirname, '../public/app.js'), 'utf8');
    const colorsMatch = appJs.match(/DISCREPANCY:\s*"([^"]+)"/);
    expect(colorsMatch[1]).not.toBe('#036B26'); // Fails because it IS #036B26
  });

  // 14. UI — wrong-date-time-handling
  it('14. UI — formatDate should format ISO to DD-MM-YYYY', () => {
    const appJs = fs.readFileSync(path.join(__dirname, '../public/app.js'), 'utf8');
    const formatDateFnString = appJs.match(/function formatDate\(iso\)\s*{[\s\S]*?}/)[0];
    const formatDate = new Function('iso', `
      ${formatDateFnString}
      return formatDate(iso);
    `);
    expect(formatDate('2026-07-01T09:12:00.000Z')).toMatch(/^\d{2}-\d{2}-\d{4}$/); // Fails because it returns raw ISO
  });

  // 8. UI — missing-ui-feedback-guard
  it('8. UI — Add Check should check res.ok before showing success', () => {
    const appJs = fs.readFileSync(path.join(__dirname, '../public/app.js'), 'utf8');
    const addCheckHandler = appJs.match(/document\.getElementById\("add-check-btn"\)\.addEventListener[\s\S]*?showToast/)[0];
    expect(addCheckHandler).toMatch(/res\.ok/); // Fails because res.ok is never checked
  });

});
