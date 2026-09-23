import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import app from '../app.js';

let server;
let baseUrl;

before(async () => {
  server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  baseUrl = `http://localhost:${server.address().port}/api`;
});

after(() => server.close());

const get = async (path) => {
  const res = await fetch(baseUrl + path);
  return { status: res.status, headers: res.headers, body: await res.json() };
};

describe('GET /api/audiences', () => {
  it('returns all audiences', async () => {
    const { status, body } = await get('/audiences');
    assert.equal(status, 200);
    assert.deepEqual(body.map((a) => a.id), ['individual', 'senior', 'business']);
  });

  it('allows the Angular dev server origin', async () => {
    const { headers } = await get('/audiences');
    assert.equal(headers.get('access-control-allow-origin'), 'http://localhost:4200');
  });
});

describe('GET /api/audiences/:id', () => {
  it('returns one audience', async () => {
    const { status, body } = await get('/audiences/senior');
    assert.equal(status, 200);
    assert.equal(body.name, 'Seniors and retirees');
  });

  it('returns 404 for an unknown audience', async () => {
    const { status, body } = await get('/audiences/xyz');
    assert.equal(status, 404);
    assert.equal(body.message, 'Audience not found');
  });
});

describe('GET /api/products', () => {
  it('returns all products without a filter', async () => {
    const { status, body } = await get('/products');
    assert.equal(status, 200);
    assert.equal(body.length, 7);
  });

  it('filters by audience', async () => {
    const { body } = await get('/products?audience=senior');
    assert.ok(body.length > 0);
    assert.ok(body.every((p) => p.audience === 'senior'));
  });

  it('returns an empty list for an unknown audience', async () => {
    const { status, body } = await get('/products?audience=xyz');
    assert.equal(status, 200);
    assert.deepEqual(body, []);
  });
});

describe('GET /api/products/:id', () => {
  it('returns one product', async () => {
    const { status, body } = await get('/products/2');
    assert.equal(status, 200);
    assert.equal(body.name, 'Health Basic HMO');
  });

  it('returns 404 for an unknown product', async () => {
    const { status, body } = await get('/products/999');
    assert.equal(status, 404);
    assert.equal(body.message, 'Product not found');
  });
});
