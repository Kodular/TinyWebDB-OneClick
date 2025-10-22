import { describe, it, expect } from 'vitest';
import { StoredData } from './StoredData.js';

describe('StoredData', () => {
  describe('constructor', () => {
    it('should create a StoredData instance with valid inputs', () => {
      const tag = 'testTag';
      const value = 'testValue';
      const date = new Date('2025-01-01T00:00:00Z');

      const data = new StoredData(tag, value, date);

      expect(data.tag).toBe(tag);
      expect(data.value).toBe(value);
      expect(data.date).toEqual(date);
    });

    it('should use current date when date is not provided', () => {
      const before = new Date();
      const data = new StoredData('tag', 'value');
      const after = new Date();

      expect(data.date.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(data.date.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it('should throw error when tag is empty string', () => {
      expect(() => new StoredData('', 'value')).toThrow('Tag cannot be empty');
    });

    it('should throw error when tag is only whitespace', () => {
      expect(() => new StoredData('   ', 'value')).toThrow('Tag cannot be empty');
    });

    it('should allow empty value', () => {
      const data = new StoredData('tag', '');
      expect(data.value).toBe('');
    });
  });

  describe('fromObject', () => {
    it('should create StoredData from plain object with Date', () => {
      const date = new Date('2025-01-01T00:00:00Z');
      const data = StoredData.fromObject({
        tag: 'testTag',
        value: 'testValue',
        date: date,
      });

      expect(data.tag).toBe('testTag');
      expect(data.value).toBe('testValue');
      expect(data.date).toEqual(date);
    });

    it('should create StoredData from plain object with date string', () => {
      const dateString = '2025-01-01T00:00:00Z';
      const data = StoredData.fromObject({
        tag: 'testTag',
        value: 'testValue',
        date: dateString,
      });

      expect(data.tag).toBe('testTag');
      expect(data.value).toBe('testValue');
      expect(data.date).toEqual(new Date(dateString));
    });

    it('should use current date when date is not provided', () => {
      const before = new Date();
      const data = StoredData.fromObject({
        tag: 'testTag',
        value: 'testValue',
      });
      const after = new Date();

      expect(data.date.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(data.date.getTime()).toBeLessThanOrEqual(after.getTime());
    });
  });

  describe('toObject', () => {
    it('should convert StoredData to plain object', () => {
      const date = new Date('2025-01-01T00:00:00Z');
      const data = new StoredData('testTag', 'testValue', date);

      const obj = data.toObject();

      expect(obj).toEqual({
        tag: 'testTag',
        value: 'testValue',
        date: '2025-01-01T00:00:00.000Z',
      });
    });

    it('should preserve data through round-trip conversion', () => {
      const original = new StoredData('tag', 'value', new Date('2025-01-01T00:00:00Z'));
      const obj = original.toObject();
      const restored = StoredData.fromObject(obj);

      expect(restored.tag).toBe(original.tag);
      expect(restored.value).toBe(original.value);
      expect(restored.date.toISOString()).toBe(original.date.toISOString());
    });
  });
});
