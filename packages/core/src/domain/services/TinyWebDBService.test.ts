import { describe, it, expect, beforeEach } from 'vitest';
import { TinyWebDBService } from './TinyWebDBService.js';
import { InMemoryStorage } from '../../adapters/storage';

describe('TinyWebDBService', () => {
  let service: TinyWebDBService;
  let storage: InMemoryStorage;

  beforeEach(() => {
    storage = new InMemoryStorage();
    service = new TinyWebDBService(storage);
  });

  describe('storeValue', () => {
    it('should store a new value', async () => {
      const result = await service.storeValue('testTag', 'testValue');

      expect(result).toEqual({
        action: 'STORED',
        tag: 'testTag',
        value: 'testValue',
      });

      const stored = await storage.get('testTag');
      expect(stored?.value).toBe('testValue');
    });

    it('should update existing value', async () => {
      await service.storeValue('tag', 'value1');
      const result = await service.storeValue('tag', 'value2');

      expect(result.value).toBe('value2');

      const stored = await storage.get('tag');
      expect(stored?.value).toBe('value2');
    });

    it('should throw error for empty tag', async () => {
      await expect(service.storeValue('', 'value')).rejects.toThrow('Tag cannot be empty');
    });

    it('should throw error for whitespace-only tag', async () => {
      await expect(service.storeValue('   ', 'value')).rejects.toThrow('Tag cannot be empty');
    });

    it('should allow empty value', async () => {
      const result = await service.storeValue('tag', '');
      expect(result.value).toBe('');
    });
  });

  describe('getValue', () => {
    it('should retrieve existing value', async () => {
      await service.storeValue('testTag', 'testValue');

      const result = await service.getValue('testTag');

      expect(result).toEqual({
        action: 'VALUE',
        tag: 'testTag',
        value: 'testValue',
      });
    });

    it('should return empty string for non-existent tag', async () => {
      const result = await service.getValue('nonExistent');

      expect(result).toEqual({
        action: 'VALUE',
        tag: 'nonExistent',
        value: '',
      });
    });

    it('should throw error for empty tag', async () => {
      await expect(service.getValue('')).rejects.toThrow('Tag cannot be empty');
    });

    it('should throw error for whitespace-only tag', async () => {
      await expect(service.getValue('   ')).rejects.toThrow('Tag cannot be empty');
    });
  });

  describe('deleteEntry', () => {
    it('should delete existing entry', async () => {
      await service.storeValue('tag', 'value');

      const deleted = await service.deleteEntry('tag');
      expect(deleted).toBe(true);

      const result = await service.getValue('tag');
      expect(result.value).toBe('');
    });

    it('should return false for non-existent entry', async () => {
      const deleted = await service.deleteEntry('nonExistent');
      expect(deleted).toBe(false);
    });

    it('should throw error for empty tag', async () => {
      await expect(service.deleteEntry('')).rejects.toThrow('Tag cannot be empty');
    });
  });

  describe('listEntries', () => {
    it('should return empty array when no entries exist', async () => {
      const entries = await service.listEntries();
      expect(entries).toEqual([]);
    });

    it('should return all entries', async () => {
      await service.storeValue('tag1', 'value1');
      await service.storeValue('tag2', 'value2');
      await service.storeValue('tag3', 'value3');

      const entries = await service.listEntries();
      expect(entries).toHaveLength(3);
      expect(entries.map((e) => e.tag)).toEqual(['tag1', 'tag2', 'tag3']);
    });

    it('should return entries sorted by tag', async () => {
      await service.storeValue('zebra', 'value1');
      await service.storeValue('apple', 'value2');
      await service.storeValue('banana', 'value3');

      const entries = await service.listEntries();
      expect(entries.map((e) => e.tag)).toEqual(['apple', 'banana', 'zebra']);
    });
  });
});
