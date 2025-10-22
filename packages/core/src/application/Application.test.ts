import { describe, it, expect, beforeEach } from 'vitest';
import { Application } from './Application.js';
import { InMemoryStorage } from '../adapters/storage';
import { HttpRequest } from './handlers';

describe('Application', () => {
  let app: Application;

  beforeEach(() => {
    const storage = new InMemoryStorage();
    app = new Application(storage);
  });

  describe('routing', () => {
    it('should route to store handler', async () => {
      const request: HttpRequest = {
        method: 'POST',
        path: '/storeavalue',
        body: { tag: 'test', value: 'value' },
        query: {},
      };

      const response = await app.handleRequest(request);

      expect(response.status).toBe(200);
      expect(JSON.parse(response.body)).toEqual(['STORED', 'test', 'value']);
    });

    it('should route to get handler', async () => {
      const storeRequest: HttpRequest = {
        method: 'POST',
        path: '/storeavalue',
        body: { tag: 'test', value: 'value' },
        query: {},
      };
      await app.handleRequest(storeRequest);

      const getRequest: HttpRequest = {
        method: 'POST',
        path: '/getvalue',
        body: { tag: 'test' },
        query: {},
      };

      const response = await app.handleRequest(getRequest);

      expect(response.status).toBe(200);
      expect(JSON.parse(response.body)).toEqual(['VALUE', 'test', 'value']);
    });

    it('should route to delete handler', async () => {
      const storeRequest: HttpRequest = {
        method: 'POST',
        path: '/storeavalue',
        body: { tag: 'test', value: 'value' },
        query: {},
      };
      await app.handleRequest(storeRequest);

      const deleteRequest: HttpRequest = {
        method: 'POST',
        path: '/deleteentry',
        body: { tag: 'test' },
        query: {},
      };

      const response = await app.handleRequest(deleteRequest);

      expect(response.status).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.deleted).toBe(true);
    });

    it('should handle case-insensitive paths', async () => {
      const request: HttpRequest = {
        method: 'POST',
        path: '/StoreAValue',
        body: { tag: 'test', value: 'value' },
        query: {},
      };

      const response = await app.handleRequest(request);

      expect(response.status).toBe(200);
    });

    it('should handle paths with trailing slash', async () => {
      const request: HttpRequest = {
        method: 'POST',
        path: '/storeavalue/',
        body: { tag: 'test', value: 'value' },
        query: {},
      };

      const response = await app.handleRequest(request);

      expect(response.status).toBe(200);
    });

    it('should return 404 for unknown paths', async () => {
      const request: HttpRequest = {
        method: 'GET',
        path: '/unknown',
        body: {},
        query: {},
      };

      const response = await app.handleRequest(request);

      expect(response.status).toBe(404);
      const body = JSON.parse(response.body);
      expect(body.error).toBe('Not Found');
    });
  });
});
