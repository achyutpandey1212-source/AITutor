import fs from 'fs';
import path from 'path';

export interface StorageUploadOptions {
  mimeType?: string;
  metadata?: Record<string, any>;
}

export interface StorageProvider {
  upload(key: string, data: Buffer | string, options?: StorageUploadOptions): Promise<string>;
  getUrl(key: string): Promise<string>;
  delete(key: string): Promise<boolean>;
  exists(key: string): Promise<boolean>;
}

/**
 * Local file system implementation of StorageProvider for development and caching.
 * Keeps storage independent of external cloud vendors until production deployment.
 */
export class LocalStorageProvider implements StorageProvider {
  private baseDir: string;
  private publicUrlPrefix: string;

  constructor(baseDir?: string, publicUrlPrefix = '/storage') {
    this.baseDir = baseDir || path.resolve(process.cwd(), 'uploads/assets');
    this.publicUrlPrefix = publicUrlPrefix;
    if (!fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir, { recursive: true });
    }
  }

  async upload(key: string, data: Buffer | string, _options?: StorageUploadOptions): Promise<string> {
    const filePath = path.join(this.baseDir, key);
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    await fs.promises.writeFile(filePath, data);
    return this.getUrl(key);
  }

  async getUrl(key: string): Promise<string> {
    const sanitizedKey = key.replace(/\\/g, '/');
    return `${this.publicUrlPrefix}/${sanitizedKey}`;
  }

  async delete(key: string): Promise<boolean> {
    const filePath = path.join(this.baseDir, key);
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
      return true;
    }
    return false;
  }

  async exists(key: string): Promise<boolean> {
    const filePath = path.join(this.baseDir, key);
    return fs.existsSync(filePath);
  }
}

/**
 * Default global storage provider instance
 */
export const defaultStorageProvider: StorageProvider = new LocalStorageProvider();
