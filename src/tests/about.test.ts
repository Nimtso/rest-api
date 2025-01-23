import request from 'supertest';

import { createServer } from '../server';

const app = createServer()

describe('Health API', () => {
  it('should return "Hello World"', async () => {
    const response = await request(app).get('/about');
    expect(response.status).toBe(200);
    expect(response.text).toBe('Hello World');
  });
});
