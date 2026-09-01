export interface KeyStatus {
  key: string;
  isAvailable: boolean;
  unavailableUntil: number; // timestamp in ms
  failureCount: number;
}

export interface KeyPoolOptions {
  cooldownMs?: number;
}

export class KeyPool {
  private keys: KeyStatus[] = [];
  private currentIndex: number = 0;
  private cooldownMs: number;
  public readonly providerName: string;

  constructor(providerName: string, keys: string[], options?: KeyPoolOptions) {
    this.providerName = providerName;
    const defaultCooldown = parseInt(process.env.AI_KEY_COOLDOWN_MS || '60000', 10);
    this.cooldownMs = options?.cooldownMs ?? (isNaN(defaultCooldown) ? 60000 : defaultCooldown);

    const validKeys = keys.map((k) => k.trim()).filter((k) => k.length > 0);
    this.keys = validKeys.map((key) => ({
      key,
      isAvailable: true,
      unavailableUntil: 0,
      failureCount: 0,
    }));
  }

  isConfigured(): boolean {
    return this.keys.length > 0;
  }

  getKeyCount(): number {
    return this.keys.length;
  }

  /**
   * Selects the next healthy key in round-robin sequence.
   * Auto-recovers keys whose cooldown period has expired.
   * Returns null if no healthy keys are currently available.
   */
  getNextKey(): string | null {
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
        return keyEntry.key;
      }
    }

    return null;
  }

  /**
   * Temporarily marks a specific key unavailable for the cooldown duration.
   * Never logs key contents.
   */
  markKeyUnavailable(key: string, customCooldownMs?: number): void {
    const keyEntry = this.keys.find((k) => k.key === key);
    if (!keyEntry) return;

    const cooldown = customCooldownMs ?? this.cooldownMs;
    keyEntry.isAvailable = false;
    keyEntry.unavailableUntil = Date.now() + cooldown;
    keyEntry.failureCount += 1;

    const keyIndex = this.keys.indexOf(keyEntry) + 1;
    console.warn(
      `[KeyPool:${this.providerName}] Key #${keyIndex} marked unavailable for ${Math.round(cooldown / 1000)}s due to rate limit/quota failure.`
    );
  }

  /**
   * Resets all keys back to available state (useful for tests).
   */
  resetAll(): void {
    for (const keyEntry of this.keys) {
      keyEntry.isAvailable = true;
      keyEntry.unavailableUntil = 0;
      keyEntry.failureCount = 0;
    }
    this.currentIndex = 0;
  }
}
