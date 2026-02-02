import { Injectable } from '@nestjs/common';

interface RateLimitConfig {
  free: { requestsPerHour: number; requestsPerDay: number };
  power: { requestsPerHour: number; requestsPerDay: number };
  premium: { requestsPerHour: number; requestsPerDay: number };
}

interface RateLimitKey {
  ip: string;
  userId?: string;
  endpoint: string;
  timestamp: number;
}

@Injectable()
export class RateLimitingService {
  private limits: RateLimitConfig = {
    free: { requestsPerHour: 100, requestsPerDay: 1000 },
    power: { requestsPerHour: 1000, requestsPerDay: 10000 },
    premium: { requestsPerHour: 10000, requestsPerDay: 100000 },
  };

  // In-memory store (would use Redis in production)
  private store = new Map<string, number[]>();

  checkLimit(
    ip: string,
    userId: string | undefined,
    endpoint: string,
    tier: string = 'free',
  ): boolean {
    const key = `${ip}:${userId || 'anonymous'}:${endpoint}`;
    const now = Date.now();
    const oneHourAgo = now - 3600000;
    const oneDayAgo = now - 86400000;

    // Get or create entry
    let timestamps = this.store.get(key) || [];
    timestamps = timestamps.filter((t) => t > oneDayAgo);

    // Check hour limit
    const hourCount = timestamps.filter((t) => t > oneHourAgo).length;
    const hourLimit = this.limits[tier as keyof RateLimitConfig]?.requestsPerHour || 100;
    if (hourCount >= hourLimit) {
      this.store.set(key, timestamps);
      return false;
    }

    // Check day limit
    const dayLimit = this.limits[tier as keyof RateLimitConfig]?.requestsPerDay || 1000;
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
    const now = Date.now();
    const oneDayAgo = now - 86400000;

    for (const [key, timestamps] of this.store.entries()) {
      const filtered = timestamps.filter((t) => t > oneDayAgo);
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
    const key = `${ip}:${userId || 'anonymous'}:${endpoint}`;
    const now = Date.now();
    const oneHourAgo = now - 3600000;
    const oneDayAgo = now - 86400000;

    const timestamps = (this.store.get(key) || []).filter((t) => t > oneDayAgo);
    const hourCount = timestamps.filter((t) => t > oneHourAgo).length;
    const dayCount = timestamps.length;

    const tierLimits = this.limits[tier as keyof RateLimitConfig] || this.limits.free;

    return {
      hourly: Math.max(0, tierLimits.requestsPerHour - hourCount),
      daily: Math.max(0, tierLimits.requestsPerDay - dayCount),
    };
  }
}
