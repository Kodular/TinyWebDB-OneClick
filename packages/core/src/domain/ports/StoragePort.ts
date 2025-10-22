import { StoredData } from '../models';

/**
 * StoragePort interface
 *
 * Defines the contract for storage adapters in the Ports and Adapters architecture.
 * All storage implementations (in-memory, KV stores, databases) must implement this interface.
 *
 * This interface is purely focused on data operations and has no infrastructure dependencies.
 */
export interface StoragePort {
  /**
   * Retrieves a stored value by its tag
   *
   * @param tag - The tag to look up
   * @returns The stored data if found, null otherwise
   */
  get(tag: string): Promise<StoredData | null>;

  /**
   * Stores or updates a tag-value pair
   *
   * @param tag - The tag to store under
   * @param value - The value to store
   * @returns The stored data with timestamp
   */
  set(tag: string, value: string): Promise<StoredData>;

  /**
   * Deletes a stored entry by its tag
   *
   * @param tag - The tag to delete
   * @returns true if the entry was deleted, false if it didn't exist
   */
  delete(tag: string): Promise<boolean>;

  /**
   * Lists all stored entries
   *
   * @returns Array of all stored data, ordered by tag
   */
  list(): Promise<StoredData[]>;
}
