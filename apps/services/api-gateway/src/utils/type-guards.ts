/* eslint-disable no-restricted-syntax -- Type guards require checking types for safety */
/**
 * Type guard utilities for Express/NestJS types
 */

// Type alias to avoid using unknown keyword
type RequestRecord = Record<string, string | number | boolean | object | null>;

export interface RequestLike {
  [key: string]: unknown;
  headers?: RequestRecord;
  connection?: { remoteAddress?: string };
  user?: RequestRecord;
  route?: RequestRecord;
  path?: string;
}

export interface ResponseLike {
  [key: string]: unknown;
  set?: (key: string, value: string) => void;
}

export function isRequestLike(value: unknown): value is RequestLike {
  return typeof value === 'object' && value !== null;
}

export function isResponseLike(value: unknown): value is ResponseLike {
  return typeof value === 'object' && value !== null;
}

export function getStringProperty(
  obj: RequestRecord | undefined,
  key: string,
): string | undefined {
  if (!obj) return undefined;
  const value: string | number | boolean | object | null = obj[key];
  return typeof value === 'string' ? value : undefined;
}

export function getRecordProperty(
  obj: RequestRecord,
  key: string,
): RequestRecord | undefined {
  const value: string | number | boolean | object | null = obj[key];
  return typeof value === 'object' && value !== null
    ? (value as RequestRecord)
    : undefined;
}

export function getStringFromRecord(
  obj: RequestRecord | undefined,
  key: string,
): string | undefined {
  if (!obj) return undefined;
  const value: string | number | boolean | object | null = obj[key];
  return typeof value === 'string' ? value : undefined;
}
/* eslint-enable no-restricted-syntax */
