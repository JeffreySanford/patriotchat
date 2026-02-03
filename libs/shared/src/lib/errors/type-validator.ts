/**
 * Type validation utilities
 * Runtime type checking for API responses
 */

export class TypeValidator {
  /**
   * Validates an object matches the expected shape
   * Throws ValidationError if validation fails
   */
  static validate<T extends Record<string, unknown>>(
    data: unknown,
    schema: Record<string, string>,
    typeName: string,
  ): T {
    if (typeof data !== 'object' || data === null) {
      throw new TypeError(
        `Expected object for ${typeName}, got ${typeof data}`,
      );
    }

    const obj = data as Record<string, unknown>;
    const errors: Record<string, string> = {};

    // Check required fields
    for (const [key, expectedType] of Object.entries(schema)) {
      const value = obj[key];
      const actualType = this.getType(value);

      if (!this.typeMatches(actualType, expectedType)) {
        errors[key] = `Expected ${expectedType}, got ${actualType}`;
      }
    }

    // Check for extra fields (strict mode)
    for (const key of Object.keys(obj)) {
      if (!(key in schema)) {
        errors[key] = `Unexpected field in ${typeName}`;
      }
    }

    if (Object.keys(errors).length > 0) {
      throw new TypeError(
        `Validation failed for ${typeName}: ${JSON.stringify(errors)}`,
      );
    }

    return obj as T;
  }

  private static getType(value: unknown): string {
    if (value === null) return 'null';
    if (Array.isArray(value)) return 'array';
    return typeof value;
  }

  private static typeMatches(actual: string, expected: string): boolean {
    // Allow null for optional fields (marked with ?)
    if (expected.endsWith('?')) {
      if (actual === 'null') return true;
      return this.typeMatches(actual, expected.slice(0, -1));
    }

    if (actual === expected) return true;

    // Special cases
    if (expected === 'number' && actual === 'number') return true;
    if (expected === 'string' && actual === 'string') return true;
    if (expected === 'boolean' && actual === 'boolean') return true;
    if (expected === 'array' && actual === 'object') return true;

    return false;
  }
}
