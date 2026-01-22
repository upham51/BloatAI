import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface PhotoDB extends DBSchema {
  photos: {
    key: string; // entryId
    value: {
      blob: Blob;
      timestamp: number;
      mimeType: string;
      size: number;
    };
  };
  thumbnails: {
    key: string; // entryId
    value: {
      blob: Blob;
      timestamp: number;
      size: number;
    };
  };
}

/**
 * Local Photo Storage Service using IndexedDB
 * Stores photos directly on the user's device for instant access
 * and zero cloud storage costs.
 */
class LocalPhotoStorage {
  private db: IDBPDatabase<PhotoDB> | null = null;
  private readonly DB_NAME = 'bloatai-photos';
  private readonly DB_VERSION = 1;

  /**
   * Initialize the IndexedDB database
   */
  async init() {
    if (this.db) return; // Already initialized

    try {
      this.db = await openDB<PhotoDB>(this.DB_NAME, this.DB_VERSION, {
        upgrade(db) {
          // Create object stores if they don't exist
          if (!db.objectStoreNames.contains('photos')) {
            db.createObjectStore('photos');
          }
          if (!db.objectStoreNames.contains('thumbnails')) {
            db.createObjectStore('thumbnails');
          }
        },
      });

      // Request persistent storage to prevent automatic deletion
      if (navigator.storage && navigator.storage.persist) {
        const isPersisted = await navigator.storage.persist();
        console.log(`Persistent storage granted: ${isPersisted}`);
      }
    } catch (error) {
      console.error('Failed to initialize IndexedDB:', error);
      throw error;
    }
  }

  /**
   * Save a photo locally with thumbnail generation
   * @param entryId - Unique identifier for the meal entry
   * @param file - The image file to store
   * @returns The entryId to use as photo reference
   */
  async savePhoto(entryId: string, file: File): Promise<string> {
    if (!this.db) await this.init();

    try {
      // Compress the original image
      const compressedPhoto = await this.compressImage(file, 1920, 0.85);

      // Save full resolution (compressed)
      await this.db!.put('photos', {
        blob: compressedPhoto,
        timestamp: Date.now(),
        mimeType: file.type,
        size: compressedPhoto.size,
      }, entryId);

      // Generate and save thumbnail (300px width for lists)
      const thumbnail = await this.generateThumbnail(file, 300, 0.8);
      await this.db!.put('thumbnails', {
        blob: thumbnail,
        timestamp: Date.now(),
        size: thumbnail.size,
      }, entryId);

      console.log(`Photo saved locally: ${entryId} (${this.formatBytes(compressedPhoto.size)} + ${this.formatBytes(thumbnail.size)} thumbnail)`);

      return entryId;
    } catch (error) {
      console.error('Failed to save photo locally:', error);
      throw error;
    }
  }

  /**
   * Retrieve a photo from local storage
   * @param entryId - The entry ID
   * @param thumbnail - Whether to retrieve thumbnail (faster) or full resolution
   * @returns Object URL for the image (must be revoked after use)
   */
  async getPhoto(entryId: string, thumbnail = false): Promise<string | null> {
    if (!this.db) await this.init();

    try {
      const store = thumbnail ? 'thumbnails' : 'photos';
      const photo = await this.db!.get(store, entryId);

      if (!photo) {
        console.warn(`Photo not found in local storage: ${entryId}`);
        return null;
      }

      // Create object URL (instant, in-memory reference)
      return URL.createObjectURL(photo.blob);
    } catch (error) {
      console.error('Failed to retrieve photo from local storage:', error);
      return null;
    }
  }

  /**
   * Delete a photo and its thumbnail
   * @param entryId - The entry ID
   */
  async deletePhoto(entryId: string): Promise<void> {
    if (!this.db) await this.init();

    try {
      await this.db!.delete('photos', entryId);
      await this.db!.delete('thumbnails', entryId);
      console.log(`Photo deleted from local storage: ${entryId}`);
    } catch (error) {
      console.error('Failed to delete photo from local storage:', error);
      throw error;
    }
  }

  /**
   * Check if a photo exists in local storage
   * @param entryId - The entry ID
   * @returns True if photo exists
   */
  async hasPhoto(entryId: string): Promise<boolean> {
    if (!this.db) await this.init();

    try {
      const photo = await this.db!.get('photos', entryId);
      return !!photo;
    } catch (error) {
      console.error('Failed to check photo existence:', error);
      return false;
    }
  }

  /**
   * Get storage usage information
   * @returns Used and available storage in bytes
   */
  async getStorageInfo(): Promise<{ used: number; available: number; percentage: number }> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      try {
        const estimate = await navigator.storage.estimate();
        const used = estimate.usage || 0;
        const available = estimate.quota || 0;
        const percentage = available > 0 ? (used / available) * 100 : 0;

        return { used, available, percentage };
      } catch (error) {
        console.error('Failed to estimate storage:', error);
      }
    }

    return { used: 0, available: 0, percentage: 0 };
  }

  /**
   * Get total size of stored photos
   * @returns Total size in bytes
   */
  async getTotalPhotoSize(): Promise<number> {
    if (!this.db) await this.init();

    try {
      let totalSize = 0;

      // Get all photos
      const photoKeys = await this.db!.getAllKeys('photos');
      for (const key of photoKeys) {
        const photo = await this.db!.get('photos', key);
        if (photo) totalSize += photo.size;
      }

      // Get all thumbnails
      const thumbnailKeys = await this.db!.getAllKeys('thumbnails');
      for (const key of thumbnailKeys) {
        const thumbnail = await this.db!.get('thumbnails', key);
        if (thumbnail) totalSize += thumbnail.size;
      }

      return totalSize;
    } catch (error) {
      console.error('Failed to calculate total photo size:', error);
      return 0;
    }
  }

  /**
   * Get count of stored photos
   * @returns Number of photos stored
   */
  async getPhotoCount(): Promise<number> {
    if (!this.db) await this.init();

    try {
      const keys = await this.db!.getAllKeys('photos');
      return keys.length;
    } catch (error) {
      console.error('Failed to count photos:', error);
      return 0;
    }
  }

  /**
   * Clear all stored photos (use with caution!)
   */
  async clearAllPhotos(): Promise<void> {
    if (!this.db) await this.init();

    try {
      await this.db!.clear('photos');
      await this.db!.clear('thumbnails');
      console.log('All photos cleared from local storage');
    } catch (error) {
      console.error('Failed to clear photos:', error);
      throw error;
    }
  }

  /**
   * Compress an image to target dimensions and quality
   * @param file - The image file
   * @param maxDimension - Maximum width or height
   * @param quality - JPEG quality (0-1)
   * @returns Compressed image as Blob
   */
  private async compressImage(file: File, maxDimension: number, quality: number): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate target dimensions
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = (height / width) * maxDimension;
            width = maxDimension;
          } else {
            width = (width / height) * maxDimension;
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to compress image'));
            }
          },
          'image/jpeg',
          quality
        );

        // Cleanup
        URL.revokeObjectURL(img.src);
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
        URL.revokeObjectURL(img.src);
      };

      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Generate a thumbnail from an image file
   * @param file - The image file
   * @param maxWidth - Maximum width
   * @param quality - JPEG quality (0-1)
   * @returns Thumbnail as Blob
   */
  private async generateThumbnail(file: File, maxWidth: number, quality: number): Promise<Blob> {
    return this.compressImage(file, maxWidth, quality);
  }

  /**
   * Format bytes to human-readable string
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Export all photos as a downloadable ZIP (for backup)
   * Note: Requires a ZIP library - placeholder for future implementation
   */
  async exportPhotos(): Promise<void> {
    console.warn('Export functionality not yet implemented');
    // TODO: Implement ZIP export using JSZip or similar
  }
}

// Export singleton instance
export const localPhotoStorage = new LocalPhotoStorage();
