import { StoragePort, StoredData } from '@tinywebdb/core';

/**
 * Cloudflare R2 Storage Adapter
 *
 * Implements StoragePort using Cloudflare R2 (Object Storage).
 * R2 is compatible with S3 API and provides unlimited storage.
 *
 * Storage strategy:
 * - Each tag is stored as a separate object with the tag as key
 * - Value is stored as object body
 * - Date is stored in custom metadata
 * - An index object stores the list of all tags for efficient listing
 *
 * Benefits:
 * - No size limits (unlike KV's 25MB limit)
 * - Cost-effective for large values
 * - Zero egress fees
 */
export class CloudflareR2Storage implements StoragePort {
  private readonly INDEX_KEY = '__tinywebdb_index__';

  constructor(private readonly bucket: R2Bucket) {}

  async get(tag: string): Promise<StoredData | null> {
    const object = await this.bucket.get(this.encodeKey(tag));

    if (!object) {
      return null;
    }

    const value = await object.text();
    const date = object.customMetadata?.date;

    if (!date) {
      // Fallback to uploaded timestamp if metadata is missing
      return new StoredData(tag, value, object.uploaded);
    }

    return StoredData.fromObject({ tag, value, date });
  }

  async set(tag: string, value: string): Promise<StoredData> {
    const data = new StoredData(tag, value);
    const key = this.encodeKey(tag);

    // Store the value as an R2 object with metadata
    await this.bucket.put(key, value, {
      customMetadata: {
        date: data.date.toISOString(),
      },
    });

    // Update the index
    await this.updateIndex(tag, 'add');

    return data;
  }

  async delete(tag: string): Promise<boolean> {
    const key = this.encodeKey(tag);

    // Check if object exists
    const exists = await this.bucket.head(key);
    if (!exists) {
      return false;
    }

    // Delete the object
    await this.bucket.delete(key);

    // Update the index
    await this.updateIndex(tag, 'remove');

    return true;
  }

  async list(): Promise<StoredData[]> {
    // Get all tags from the index
    const tags = await this.getIndex();

    // Fetch all objects in parallel
    const promises = tags.map(async (tag) => {
      const data = await this.get(tag);
      return data;
    });

    const results = await Promise.all(promises);

    // Filter out nulls and sort by tag
    const entries = results.filter((data): data is StoredData => data !== null);
    return entries.sort((a, b) => a.tag.localeCompare(b.tag));
  }

  /**
   * Encodes a tag to be used as an R2 key
   * Prefixes with 'data/' to avoid collision with index
   */
  private encodeKey(tag: string): string {
    return `data/${tag}`;
  }

  /**
   * Gets the list of all tags from the index
   */
  private async getIndex(): Promise<string[]> {
    const indexObject = await this.bucket.get(this.INDEX_KEY);

    if (!indexObject) {
      return [];
    }

    const indexText = await indexObject.text();
    return JSON.parse(indexText) as string[];
  }

  /**
   * Updates the index by adding or removing a tag
   */
  private async updateIndex(tag: string, operation: 'add' | 'remove'): Promise<void> {
    const tags = await this.getIndex();
    const tagSet = new Set(tags);

    if (operation === 'add') {
      tagSet.add(tag);
    } else {
      tagSet.delete(tag);
    }

    const updatedTags = Array.from(tagSet).sort();
    await this.bucket.put(this.INDEX_KEY, JSON.stringify(updatedTags), {
      customMetadata: {
        type: 'index',
        updated: new Date().toISOString(),
      },
    });
  }
}
