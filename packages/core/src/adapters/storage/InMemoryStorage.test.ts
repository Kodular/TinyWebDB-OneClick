import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryStorage } from './InMemoryStorage.js';

describe('InMemoryStorage', () => {
  let storage: InMemoryStorage;

  beforeEach(() => {
    storage = new InMemoryStorage();
  });

  describe('set and get', () => {
    it('should store and retrieve a value', async () => {
      await storage.set('testTag', 'testValue');
      const result = await storage.get('testTag');

      expect(result).not.toBeNull();
      expect(result?.tag).toBe('testTag');
      expect(result?.value).toBe('testValue');
    });

    it('should update existing value when setting same tag', async () => {
      await storage.set('tag', 'value1');
      await storage.set('tag', 'value2');

      const result = await storage.get('tag');
      expect(result?.value).toBe('value2');
    });

    it('should return null for non-existent tag', async () => {
      const result = await storage.get('nonExistent');
      expect(result).toBeNull();
    });

    it('should set timestamp when storing data', async () => {
      const before = new Date();
      const stored = await storage.set('tag', 'value');
      const after = new Date();

      expect(stored.date.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(stored.date.getTime()).toBeLessThanOrEqual(after.getTime());
    });
  });

  describe('delete', () => {
    it('should delete existing entry', async () => {
      await storage.set('tag', 'value');
      const deleted = await storage.delete('tag');

      expect(deleted).toBe(true);
      expect(await storage.get('tag')).toBeNull();
    });

    it('should return false when deleting non-existent entry', async () => {
      const deleted = await storage.delete('nonExistent');
      expect(deleted).toBe(false);
    });
  });

  describe('list', () => {
    it('should return empty array when no data stored', async () => {
      const result = await storage.list();
      expect(result).toEqual([]);
    });

    it('should return all stored entries', async () => {
      await storage.set('tag1', 'value1');
      await storage.set('tag2', 'value2');
      await storage.set('tag3', 'value3');

      const result = await storage.list();
      expect(result).toHaveLength(3);
      expect(result.map((d) => d.tag)).toEqual(['tag1', 'tag2', 'tag3']);
    });

    it('should return entries sorted by tag', async () => {
      await storage.set('zebra', 'value1');
      await storage.set('apple', 'value2');
      await storage.set('banana', 'value3');

      const result = await storage.list();
      expect(result.map((d) => d.tag)).toEqual(['apple', 'banana', 'zebra']);
    });
  });

  describe('clear', () => {
    it('should remove all entries', async () => {
      await storage.set('tag1', 'value1');
      await storage.set('tag2', 'value2');

      storage.clear();

      expect(await storage.list()).toEqual([]);
      expect(storage.size()).toBe(0);
    });
  });

  describe('size', () => {
    it('should return number of stored entries', async () => {
      expect(storage.size()).toBe(0);

      await storage.set('tag1', 'value1');
      expect(storage.size()).toBe(1);

      await storage.set('tag2', 'value2');
      expect(storage.size()).toBe(2);

      await storage.delete('tag1');
      expect(storage.size()).toBe(1);
    });
  });
});
