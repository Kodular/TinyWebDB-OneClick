import { describe, it, expect, beforeEach } from 'vitest';
import { StoreValueHandler } from './StoreValueHandler.js';
import { GetValueHandler } from './GetValueHandler.js';
import { DeleteEntryHandler } from './DeleteEntryHandler.js';
import { TinyWebDBService } from '../../domain/services/index.js';
import { InMemoryStorage } from '../../adapters/storage/InMemoryStorage.js';
import { HttpRequest } from './types.js';

describe('HTTP Handlers', () => {
  let service: TinyWebDBService;
  let storage: InMemoryStorage;

  beforeEach(() => {
    storage = new InMemoryStorage();
    service = new TinyWebDBService(storage);
  });

  describe('StoreValueHandler', () => {
    let handler: StoreValueHandler;

    beforeEach(() => {
      handler = new StoreValueHandler(service);
    });

    it('should store a value successfully', async () => {
      const request: HttpRequest = {
        method: 'POST',
        path: '/storeavalue',
        body: { tag: 'testTag', value: 'testValue' },
        query: {},
      };

      const response = await handler.handle(request);

      expect(response.status).toBe(200);
      expect(response.headers['Content-Type']).toBe('application/json');
      expect(JSON.parse(response.body)).toEqual(['STORED', 'testTag', 'testValue']);
    });

    it('should return error when tag is missing', async () => {
      const request: HttpRequest = {
        method: 'POST',
        path: '/storeavalue',
        body: { value: 'testValue' },
        query: {},
      };

      const response = await handler.handle(request);

      expect(response.status).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.error).toBe('Bad Request');
      expect(body.message).toContain('tag');
    });

    it('should return error when value is missing', async () => {
      const request: HttpRequest = {
        method: 'POST',
        path: '/storeavalue',
        body: { tag: 'testTag' },
        query: {},
      };

      const response = await handler.handle(request);

      expect(response.status).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.message).toContain('value');
    });
  });

  describe('GetValueHandler', () => {
    let handler: GetValueHandler;

    beforeEach(() => {
      handler = new GetValueHandler(service);
    });

    it('should retrieve existing value', async () => {
      await service.storeValue('testTag', 'testValue');

      const request: HttpRequest = {
        method: 'POST',
        path: '/getvalue',
        body: { tag: 'testTag' },
        query: {},
      };

      const response = await handler.handle(request);

      expect(response.status).toBe(200);
      expect(JSON.parse(response.body)).toEqual(['VALUE', 'testTag', 'testValue']);
    });

    it('should return empty string for non-existent tag', async () => {
      const request: HttpRequest = {
        method: 'POST',
        path: '/getvalue',
        body: { tag: 'nonExistent' },
        query: {},
      };

      const response = await handler.handle(request);

      expect(response.status).toBe(200);
      expect(JSON.parse(response.body)).toEqual(['VALUE', 'nonExistent', '']);
    });

    it('should return error when tag is missing', async () => {
      const request: HttpRequest = {
        method: 'POST',
        path: '/getvalue',
        body: {},
        query: {},
      };

      const response = await handler.handle(request);

      expect(response.status).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.message).toContain('tag');
    });
  });

  describe('DeleteEntryHandler', () => {
    let handler: DeleteEntryHandler;

    beforeEach(() => {
      handler = new DeleteEntryHandler(service);
    });

    it('should delete existing entry', async () => {
      await service.storeValue('testTag', 'testValue');

      const request: HttpRequest = {
        method: 'POST',
        path: '/deleteentry',
        body: { tag: 'testTag' },
        query: {},
      };

      const response = await handler.handle(request);

      expect(response.status).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.deleted).toBe(true);
      expect(body.tag).toBe('testTag');

      const getValue = await service.getValue('testTag');
      expect(getValue.value).toBe('');
    });

    it('should return false for non-existent entry', async () => {
      const request: HttpRequest = {
        method: 'POST',
        path: '/deleteentry',
        body: { tag: 'nonExistent' },
        query: {},
      };

      const response = await handler.handle(request);

      expect(response.status).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.deleted).toBe(false);
    });

    it('should return error when tag is missing', async () => {
      const request: HttpRequest = {
        method: 'POST',
        path: '/deleteentry',
        body: {},
        query: {},
      };

      const response = await handler.handle(request);

      expect(response.status).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.message).toContain('tag');
    });
  });
});
