import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../app.js';

let farmerToken;
let coordinatorToken;
let expertToken;
let adminToken;

test('health endpoint reports the API as available', async () => {
  const response = await request(app).get('/api/health');
  assert.equal(response.status, 200);
  assert.equal(response.body.data.status, 'ok');
});

test('seeded farmer can authenticate and access inventory', async () => {
  const login = await request(app).post('/api/auth/login').send({ mobile: '9000000004', password: 'Farmer@123' });
  assert.equal(login.status, 200);
  assert.equal(login.body.data.user.role, 'Farmer');
  farmerToken = login.body.data.token;
  const inventory = await request(app).get('/api/inventory').set('Authorization', `Bearer ${farmerToken}`);
  assert.equal(inventory.status, 200);
  assert.equal(inventory.body.data.length, 3);
});

test('farmer cannot perform a coordinator stock operation', async () => {
  const response = await request(app)
    .post('/api/inventory/VAR-RAJMA/stock')
    .set('Authorization', `Bearer ${farmerToken}`)
    .send({ operation: 'add', quantity: 1, reason: 'Unauthorized check' });
  assert.equal(response.status, 403);
  assert.equal(response.body.error, 'FORBIDDEN');
});

test('seeded coordinator can read the stock ledger', async () => {
  const login = await request(app).post('/api/auth/login').send({ mobile: '9000000002', password: 'Coord@123' });
  assert.equal(login.status, 200);
  coordinatorToken = login.body.data.token;
  const ledger = await request(app).get('/api/inventory/ledger').set('Authorization', `Bearer ${coordinatorToken}`);
  assert.equal(ledger.status, 200);
  assert.ok(ledger.body.data.length >= 5);
});

test('expert publishes an administrator article after review', async () => {
  const adminLogin = await request(app).post('/api/auth/login').send({ mobile: '9000000001', password: 'Admin@123' });
  adminToken = adminLogin.body.data.token;
  const draft = await request(app).post('/api/articles').set('Authorization', `Bearer ${adminToken}`).send({
    title: 'Integration Seed Storage Guide', content: 'Store fully dried local seed in labelled and airtight containers away from moisture.', category: 'seeds'
  });
  assert.equal(draft.status, 200);
  const articleId = draft.body.data.articleId;
  const submitted = await request(app).post(`/api/articles/${articleId}/submit`).set('Authorization', `Bearer ${adminToken}`).send({});
  assert.equal(submitted.status, 200);
  const expertLogin = await request(app).post('/api/auth/login').send({ mobile: '9000000003', password: 'Expert@123' });
  expertToken = expertLogin.body.data.token;
  const reviewed = await request(app).post(`/api/articles/${articleId}/review`).set('Authorization', `Bearer ${expertToken}`).send({ decision: 'approve', note: 'Suitable for publication.' });
  assert.equal(reviewed.status, 200);
  const farmerArticles = await request(app).get('/api/articles').set('Authorization', `Bearer ${farmerToken}`);
  assert.ok(farmerArticles.body.data.some(article => article.article_id === articleId && article.review_status === 'Published'));
});

test('farmer question is answered by expert and then closed', async () => {
  const farmerTwoLogin = await request(app).post('/api/auth/login').send({ mobile: '9000000005', password: 'Farmer@123' });
  const farmerTwo = farmerTwoLogin.body.data.token;
  const created = await request(app).post('/api/queries').set('Authorization', `Bearer ${farmerTwo}`).send({ question: 'How should Maize Yellow seed be dried before storage?' });
  assert.equal(created.status, 200);
  const queryId = created.body.data.queryId;
  const response = await request(app).post(`/api/queries/${queryId}/response`).set('Authorization', `Bearer ${expertToken}`).send({ response: 'Dry the seed in shade until moisture is low, then store it in a clean airtight container.' });
  assert.equal(response.status, 200);
  const closed = await request(app).patch(`/api/queries/${queryId}/close`).set('Authorization', `Bearer ${farmerTwo}`).send({});
  assert.equal(closed.status, 200);
});

test('administrator creates an event and a farmer registers once', async () => {
  const event = await request(app).post('/api/events').set('Authorization', `Bearer ${adminToken}`).send({
    title: 'Integration Community Seed Meeting', eventDate: new Date(Date.now() + 86400000 * 10).toISOString(), location: 'Demo Hall', description: 'A community seed exchange and learning event.'
  });
  assert.equal(event.status, 200);
  const registered = await request(app).post(`/api/events/${event.body.data.eventId}/participate`).set('Authorization', `Bearer ${farmerToken}`).send({});
  assert.equal(registered.status, 200);
  const duplicate = await request(app).post(`/api/events/${event.body.data.eventId}/participate`).set('Authorization', `Bearer ${farmerToken}`).send({});
  assert.equal(duplicate.status, 409);
});

test('loan follows Pending to Validated to Approved to Issued to Returned', async () => {
  const farmerLogin = await request(app).post('/api/auth/login').send({ mobile: '9000000005', password: 'Farmer@123' });
  const farmer = farmerLogin.body.data.token;
  const created = await request(app)
    .post('/api/loans')
    .set('Authorization', `Bearer ${farmer}`)
    .send({ varietyId: 'VAR-MAIZE', quantity: 1, purpose: 'Integration test lifecycle' });
  assert.equal(created.status, 200);
  const loanId = created.body.data.loanId;

  const validate = await request(app).patch(`/api/loans/${loanId}/validate`).set('Authorization', `Bearer ${coordinatorToken}`).send({});
  assert.equal(validate.status, 200);
  assert.equal(validate.body.data.status, 'Validated');
  const approve = await request(app).patch(`/api/loans/${loanId}/approve`).set('Authorization', `Bearer ${coordinatorToken}`).send({});
  assert.equal(approve.status, 200);
  assert.equal(approve.body.data.status, 'Approved');
  const issue = await request(app).patch(`/api/loans/${loanId}/issue`).set('Authorization', `Bearer ${coordinatorToken}`).send({ issuedQuantity: 1 });
  assert.equal(issue.status, 200);
  assert.equal(issue.body.data.status, 'Issued');
  const returned = await request(app).post('/api/returns').set('Authorization', `Bearer ${coordinatorToken}`).send({ loanId, quantity: 1 });
  assert.equal(returned.status, 200);
  assert.equal(returned.body.data.status, 'Returned');
  assert.equal(returned.body.data.outstandingQuantity, 0);
});
