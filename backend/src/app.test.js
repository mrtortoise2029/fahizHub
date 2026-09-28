import request from 'supertest';
import { app } from './app.js';
describe('API foundation',()=>{test('reports service health',async()=>{const response=await request(app).get('/api/health');expect(response.status).toBe(200);expect(response.body.data.status).toBe('ok')});test('returns a safe 404 response',async()=>{const response=await request(app).get('/api/does-not-exist');expect(response.status).toBe(404);expect(response.body.success).toBe(false)})});

