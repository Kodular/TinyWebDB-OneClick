import { StoragePort } from '../ports';
import { StoredData } from '../models';

/**
 * Result type for store operations
 */
export type StoreResult = {
  action: 'STORED';
  tag: string;
  value: string;
};

/**
 * Result type for get operations
 */
export type GetResult = {
  action: 'VALUE';
  tag: string;
  value: string;
};

/**
 * TinyWebDB Service
 *
 * Core business logic for TinyWebDB operations.
 * This service is completely cloud-agnostic and depends only on the StoragePort interface.
 *
 * Follows the protocol expected by App Inventor's TinyWebDB component.
 */
export class TinyWebDBService {
  constructor(private readonly storage: StoragePort) {}

  /**
   * Stores a tag-value pair
   *
   * If the tag already exists, its value is updated.
   * Returns a confirmation in the format expected by TinyWebDB component.
   *
   * @param tag - Tag to store under (must not be empty)
   * @param value - Value to store
   * @returns Store result with confirmation
   */
  async storeValue(tag: string, value: string): Promise<StoreResult> {
    if (!tag || tag.trim().length === 0) {
      throw new Error('Tag cannot be empty');
    }

    await this.storage.set(tag, value);

    return {
      action: 'STORED',
      tag,
      value,
    };
  }

  /**
   * Retrieves a value by its tag
   *
   * Returns empty string if the tag doesn't exist, following TinyWebDB protocol.
   *
   * @param tag - Tag to retrieve
   * @returns Get result with tag and value
   */
  async getValue(tag: string): Promise<GetResult> {
    if (!tag || tag.trim().length === 0) {
      throw new Error('Tag cannot be empty');
    }

    const data = await this.storage.get(tag);

    return {
      action: 'VALUE',
      tag,
      value: data?.value ?? '',
    };
  }

  /**
   * Deletes an entry by its tag
   *
   * @param tag - Tag to delete
   * @returns true if deleted, false if tag didn't exist
   */
  async deleteEntry(tag: string): Promise<boolean> {
    if (!tag || tag.trim().length === 0) {
      throw new Error('Tag cannot be empty');
    }

    return await this.storage.delete(tag);
  }

  /**
   * Lists all stored entries
   *
   * @returns Array of all stored data, ordered by tag
   */
  async listEntries(): Promise<StoredData[]> {
    return await this.storage.list();
  }
}
