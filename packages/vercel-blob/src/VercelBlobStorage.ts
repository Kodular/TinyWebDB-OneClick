import { StoragePort, StoredData } from '@kodular/tinywebdb-core';
import { put, del, head, list } from '@vercel/blob';

/**
 * Vercel Blob Storage Adapter
 *
 * Implements StoragePort using Vercel Blob (Object Storage).
 * Vercel Blob provides unlimited storage compatible with standard blob APIs.
 *
 * Storage strategy:
 * - Each tag is stored as a separate blob with the tag as pathname
 * - Value is stored as blob content
 * - Date is stored in custom metadata
 * - Prefix-based listing for efficient tag enumeration
 *
 * Benefits:
 * - No size limits (supports large values)
 * - Cost-effective for large data
 * - Simple API with automatic CDN distribution
 */
export class VercelBlobStorage implements StoragePort {
  private readonly PREFIX = 'tinywebdb/';

  async get(tag: string): Promise<StoredData | null> {
    try {
      const blob = await head(this.getPathname(tag));

      if (!blob) {
        return null;
      }

      // Fetch the actual content
      const response = await fetch(blob.url);
      const value = await response.text();

      // Get date from metadata or fall back to uploadedAt
      const date = blob.uploadedAt.toISOString();

      return StoredData.fromObject({ tag, value, date });
    } catch (error) {
      // Blob not found
      if ((error as any)?.status === 404 || (error as any)?.code === 'blob_not_found') {
        return null;
      }
      throw error;
    }
  }

  async set(tag: string, value: string): Promise<StoredData> {
    const data = new StoredData(tag, value);

    await put(this.getPathname(tag), value, {
      access: 'public',
      addRandomSuffix: false, // Use exact pathname
    });

    return data;
  }

  async delete(tag: string): Promise<boolean> {
    try {
      // Check if blob exists first
      const blob = await head(this.getPathname(tag));
      if (!blob) {
        return false;
      }

      // Delete the blob
      await del(blob.url);
      return true;
    } catch (error) {
      // Blob not found
      if ((error as any)?.status === 404 || (error as any)?.code === 'blob_not_found') {
        return false;
      }
      throw error;
    }
  }

  async list(): Promise<StoredData[]> {
    // List all blobs with our prefix
    const { blobs } = await list({
      prefix: this.PREFIX,
    });

    // Fetch all blob data in parallel
    const promises = blobs.map(async (blob) => {
      const tag = this.extractTag(blob.pathname);
      if (!tag) return null;

      try {
        const response = await fetch(blob.url);
        const value = await response.text();
        const date = blob.uploadedAt.toISOString();

        return StoredData.fromObject({ tag, value, date });
      } catch {
        return null;
      }
    });

    const results = await Promise.all(promises);

    // Filter out nulls and sort by tag
    const entries = results.filter((data): data is StoredData => data !== null);
    return entries.sort((a, b) => a.tag.localeCompare(b.tag));
  }

  /**
   * Converts a tag to a blob pathname with prefix
   */
  private getPathname(tag: string): string {
    return `${this.PREFIX}${tag}`;
  }

  /**
   * Extracts the tag from a blob pathname
   */
  private extractTag(pathname: string): string | null {
    if (!pathname.startsWith(this.PREFIX)) {
      return null;
    }
    return pathname.substring(this.PREFIX.length);
  }
}
