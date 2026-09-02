import { AI_CONFIG } from './ai.config.js';

export interface KeyStatus {
  key: string;
  slotIndex: number;
  isAvailable: boolean;
  unavailableUntil: number; // timestamp in ms
  failureCount: number;
  successCount: number;
}

export interface KeyPoolOptions {
  cooldownMs?: number;
}

/**
 * Thread-safe round-robin KeyPool with per-key cooldown, health tracking, and zero secret logging.
 */
export class KeyPool {
  private keys: KeyStatus[] = [];
  private currentIndex: number = 0;
  private cooldownMs: number;
  public readonly providerName: string;

  constructor(providerName: string, rawKeys: string[], options?: KeyPoolOptions) {
    this.providerName = providerName;
    const defaultCooldown = parseInt(
      process.env.AI_KEY_COOLDOWN_MS || String(AI_CONFIG.DEFAULT_KEY_COOLDOWN_MS),
      10
    );
    this.cooldownMs = options?.cooldownMs ?? (isNaN(defaultCooldown) ? 60000 : defaultCooldown);

    const validKeys = rawKeys.map((k) => k.trim()).filter((k) => k.length > 0);
    this.keys = validKeys.map((key, idx) => ({
      key,
      slotIndex: idx + 1,
      isAvailable: true,
      unavailableUntil: 0,
      failureCount: 0,
      successCount: 0,
    }));
  }

  isConfigured(): boolean {
    return this.keys.length > 0;
  }

  getKeyCount(): number {
    return this.keys.length;
  }

  getHealthyKeyCount(): number {
    const now = Date.now();
    return this.keys.filter((k) => k.isAvailable || now >= k.unavailableUntil).length;
  }

  /**
   * Selects the next healthy key in round-robin sequence with slot index for safe logging.
   * Auto-recovers keys whose cooldown period has expired.
   * Returns null if no healthy keys are currently available.
   */
  getNextKeyInfo(): { key: string; slotIndex: number } | null {
    if (this.keys.length === 0) {
      return null;
    }

    const now = Date.now();

    // Check and recover keys that have finished their cooldown
    for (const keyEntry of this.keys) {
      if (!keyEntry.isAvailable && now >= keyEntry.unavailableUntil) {
        keyEntry.isAvailable = true;
        keyEntry.unavailableUntil = 0;
      }
    }

    const totalKeys = this.keys.length;
    for (let i = 0; i < totalKeys; i++) {
      const idx = (this.currentIndex + i) % totalKeys;
      const keyEntry = this.keys[idx];

      if (keyEntry.isAvailable) {
        this.currentIndex = (idx + 1) % totalKeys;
        return { key: keyEntry.key, slotIndex: keyEntry.slotIndex };
      }
    }

    return null;
  }

  getNextKey(): string | null {
    const info = this.getNextKeyInfo();
    return info ? info.key : null;
  }

  /**
   * Records a successful execution on a key.
   */
  markKeySuccess(key: string): void {
    const keyEntry = this.keys.find((k) => k.key === key);
    if (keyEntry) {
      keyEntry.successCount += 1;
      keyEntry.isAvailable = true;
      keyEntry.unavailableUntil = 0;
    }
  }

  /**
   * Temporarily marks a specific key unavailable for the cooldown duration.
   * NEVER logs secret key contents.
   */
  markKeyUnavailable(key: string, customCooldownMs?: number, reason?: string): void {
    const keyEntry = this.keys.find((k) => k.key === key);
    if (!keyEntry) return;

    const cooldown = customCooldownMs ?? this.cooldownMs;
    keyEntry.isAvailable = false;
    keyEntry.unavailableUntil = Date.now() + cooldown;
    keyEntry.failureCount += 1;

    console.warn(
      `[KeyPool:${this.providerName}] keySlot=${keyEntry.slotIndex} marked unavailable for ${Math.round(
        cooldown / 1000
      )}s${reason ? ` (reason: ${reason})` : ''}`
    );
  }

  /**
   * Resets all keys back to available state.
   */
  resetAll(): void {
    for (const keyEntry of this.keys) {
      keyEntry.isAvailable = true;
      keyEntry.unavailableUntil = 0;
      keyEntry.failureCount = 0;
      keyEntry.successCount = 0;
    }
    this.currentIndex = 0;
  }
}
