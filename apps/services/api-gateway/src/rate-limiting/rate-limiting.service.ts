import { Injectable } from '@nestjs/common';

interface RateLimitConfig {
  free: { requestsPerHour: number; requestsPerDay: number };
  power: { requestsPerHour: number; requestsPerDay: number };
  premium: { requestsPerHour: number; requestsPerDay: number };
}

@Injectable()
export class RateLimitingService {
  private limits: RateLimitConfig = {
    free: { requestsPerHour: 100, requestsPerDay: 1000 },
    power: { requestsPerHour: 1000, requestsPerDay: 10000 },
    premium: { requestsPerHour: 10000, requestsPerDay: 100000 },
  };

  // In-memory store (would use Redis in production)
  private store: Map<string, number[]> = new Map<string, number[]>();

  checkLimit(
    ip: string,
    userId: string | undefined,
    endpoint: string,
    tier: string = 'free',
  ): boolean {
    const key: string = `${ip}:${userId || 'anonymous'}:${endpoint}`;
    const now: number = Date.now();
    const oneHourAgo: number = now - 3600000;
    const oneDayAgo: number = now - 86400000;

    // Get or create entry
    let timestamps: number[] = this.store.get(key) || [];
    timestamps = timestamps.filter((t: number) => t > oneDayAgo);

    // Check hour limit
    const hourCount: number = timestamps.filter(
      (t: number) => t > oneHourAgo,
    ).length;
    const hourLimit: number =
      this.limits[tier as keyof RateLimitConfig]?.requestsPerHour || 100;
    if (hourCount >= hourLimit) {
      this.store.set(key, timestamps);
      return false;
    }

    // Check day limit
    const dayLimit: number =
      this.limits[tier as keyof RateLimitConfig]?.requestsPerDay || 1000;
    if (timestamps.length >= dayLimit) {
      this.store.set(key, timestamps);
      return false;
    }

    // Add current request
    timestamps.push(now);
    this.store.set(key, timestamps);

    // Cleanup old entries
    if (this.store.size > 10000) {
      this.cleanupOldEntries();
    }

    return true;
  }

  private cleanupOldEntries(): void {
    const now: number = Date.now();
    const oneDayAgo: number = now - 86400000;

    for (const [key, timestamps] of this.store.entries()) {
      const filtered: number[] = timestamps.filter(
        (t: number) => t > oneDayAgo,
      );
      if (filtered.length === 0) {
        this.store.delete(key);
      } else {
        this.store.set(key, filtered);
      }
    }
  }

  getRemainingRequests(
    ip: string,
    userId: string | undefined,
    endpoint: string,
    tier: string = 'free',
  ): { hourly: number; daily: number } {
    const key: string = `${ip}:${userId || 'anonymous'}:${endpoint}`;
    const now: number = Date.now();
    const oneHourAgo: number = now - 3600000;
    const oneDayAgo: number = now - 86400000;

    const timestamps: number[] = (this.store.get(key) || []).filter(
      (t: number) => t > oneDayAgo,
    );
    const hourCount: number = timestamps.filter(
      (t: number) => t > oneHourAgo,
    ).length;
    const dayCount: number = timestamps.length;

    const tierLimits: { requestsPerHour: number; requestsPerDay: number } =
      this.limits[tier as keyof RateLimitConfig] || this.limits.free;

    return {
      hourly: Math.max(0, tierLimits.requestsPerHour - hourCount),
      daily: Math.max(0, tierLimits.requestsPerDay - dayCount),
    };
  }
}
