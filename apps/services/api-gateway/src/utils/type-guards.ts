/* eslint-disable no-restricted-syntax -- Type guards require checking unknown-like values for safety */
/**
 * Type guard utilities for Express/NestJS types
 */

export interface RequestLike {
  headers?: Record<string, unknown>;
  connection?: { remoteAddress?: string };
  user?: Record<string, unknown>;
  route?: Record<string, unknown>;
  path?: string;
  [key: string]: unknown;
}

export interface ResponseLike {
  set?: (key: string, value: string) => void;
  [key: string]: unknown;
}

export function isRequestLike(value: unknown): value is RequestLike {
  return typeof value === 'object' && value !== null;
}

export function isResponseLike(value: unknown): value is ResponseLike {
  return typeof value === 'object' && value !== null;
}

export function getStringProperty(
  obj: Record<string, unknown> | undefined,
  key: string,
): string | undefined {
  if (!obj) return undefined;
  const value = obj[key];
  return typeof value === 'string' ? value : undefined;
}

export function getRecordProperty(
  obj: Record<string, unknown>,
  key: string,
): Record<string, unknown> | undefined {
  const value = obj[key];
  return typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : undefined;
}

export function getStringFromRecord(
  obj: Record<string, unknown> | undefined,
  key: string,
): string | undefined {
  if (!obj) return undefined;
  const value = obj[key];
  return typeof value === 'string' ? value : undefined;
}
/* eslint-enable no-restricted-syntax */
