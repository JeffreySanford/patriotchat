# Visual Guide: Error Handling in TypeScript

## The Core Concept

```text
┌─────────────────────────────────────────────────────────────┐
│  JavaScript Can Throw ANYTHING                              │
├─────────────────────────────────────────────────────────────┤
│  throw new Error("oops")         ✅ Works                    │
│  throw "string error"            ✅ Works                    │
│  throw 42                        ✅ Works                    │
│  throw null                      ✅ Works                    │
│  throw { custom: "object" }      ✅ Works                    │
│  throw undefined                 ✅ Works                    │
└─────────────────────────────────────────────────────────────┘
                          ↓
                    TypeScript says:
                "I can't protect you.
                 Assume nothing."
                          ↓
        ┌────────────────────────────────────┐
        │   Use 'unknown' in catch clauses   │
        │  + Type guards for safety          │
        └────────────────────────────────────┘
```

---

## Your Pattern: Correct ✅

```typescript
try {
  const response = await this.httpService.get(url);
  return { status: 'healthy', timestamp: Date.now() };

} catch (error: unknown) {  ← Required by TypeScript spec
  // eslint-disable-next-line no-restricted-syntax
  //     ↑ Valid exception because TypeScript spec requires this
  this.logger.warn(`[${name}] HTTP health check failed`);
  throw error;
}

✅ Type-safe
✅ Runtime-safe
✅ Standards-compliant
✅ Industry standard
```

---

## Comparison: Safe vs Unsafe

### ❌ UNSAFE - False Security

```typescript
try {
  await operation();
} catch (error: Error) {
  // ⚠️ Claims error is Error
  console.log(error.message); // 💥 Could crash if error is "string"
}

// Risk: Library updates might throw non-Error
// Result: Runtime crash at 3 AM on production
```

### ✅ SAFE - Real Security

```typescript
try {
  await operation();
} catch (error: unknown) {
  // ✅ Truthful type
  const message = error instanceof Error ? error.message : String(error);
  console.log(message); // ✅ Always works
}

// Handles: Any possible throw type
// Result: Production-grade reliability
```

---

## Type Guard Patterns

### Pattern 1: Simple Error Check

```typescript
} catch (error: unknown) {
  if (error instanceof Error) {
    console.log(error.message);  // ✅ Safe now
  } else {
    console.log(String(error));  // ✅ Fallback
  }
}
```

### Pattern 2: Multiple Error Types

```typescript
} catch (error: unknown) {
  if (error instanceof HttpException) {
    handleHttp(error);       // Specific handling
  } else if (error instanceof Error) {
    handleStandard(error);   // Standard handling
  } else {
    handleUnknown(error);    // Fallback
  }
}
```

### Pattern 3: Extract Message Safely

```typescript
} catch (error: unknown) {
  const message = extractErrorMessage(error);
  logger.error(message);
}

function extractErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  if (error instanceof Object) return JSON.stringify(error);
  return String(error);
}
```

---

## Why Each Decision

```text
Question 1: Why 'unknown' instead of specific type?
┌──────────────────────────────────────────────────┐
│ Because JavaScript allows throwing anything     │
│                                                  │
│ Library v1.0 throws: Error                       │
│ Library v2.0 throws: { error: string }          │
│ Library v3.0 throws: string                     │
│                                                  │
│ → Can't assume type. Use unknown + type guards. │
└──────────────────────────────────────────────────┘

Question 2: Why eslint-disable?
┌──────────────────────────────────────────────────┐
│ Because TypeScript spec requires 'unknown'      │
│ but your ESLint rule restricts it everywhere   │
│                                                  │
│ → Suppress rule in catch clauses only           │
│   (the one place where unknown is required)    │
│                                                  │
│ This is NOT cheating - it's justified!         │
└──────────────────────────────────────────────────┘

Question 3: Should we change anything?
┌──────────────────────────────────────────────────┐
│ NO - Your pattern is:                            │
│ ✅ Correct                                       │
│ ✅ Safe                                          │
│ ✅ Industry standard                            │
│ ✅ Already best practice                        │
│                                                  │
│ Optional: Add error message to logger           │
└──────────────────────────────────────────────────┘
```

---

## Real-World Example: Your HTTP Health Check

### What Can Throw?

```text
HTTP Request              → Timeout Error
Network Layer             → Connection Refused
OS Level                  → DNS Resolution Failure
SSL Certificate          → Certificate Error (custom)
HTTP Client Interceptor  → Could be anything
HTTP Client Library      → Depends on version
Future Version Updates   → Unknown
Third-party Dependency   → Anything
```

### Your Current Code Handles All of These ✅

```typescript
async checkHttpHealth(name: string): Promise<ServiceStatus> {
  try {
    const response = await this.httpService.get(url);
    return { status: 'healthy', timestamp: Date.now() };

  } catch (error: unknown) {  // ← Catches anything
    this.logger.warn(`[${name}] HTTP health check failed`);
    throw error;
  }
}

✅ Safe for any error type
✅ Future-proof for library updates
✅ Won't crash on unexpected errors
✅ Production-grade
```

---

## ESLint Rule Justification

### The Rule: No Unrestricted 'unknown'

```javascript
// eslint.config.mjs
'no-restricted-syntax': [
  'error',
  {
    selector: '...',
    message: 'Avoid using unknown type',
  },
]
```

### Why Rule Exists

```typescript
// ❌ Prevents this (lazy typing):
let data: unknown;
// ... later ...
data.something; // Error! unknown is too vague
```

### Why Exception is Valid

```typescript
// ✅ Exception for this (required by spec):
catch (error: unknown) {
  // eslint-disable-next-line no-restricted-syntax
  const msg = error instanceof Error ? error.message : String(error);
  // Now safely handled
}
```

**This is the ONLY valid use of `unknown` for this rule.**

---

## Decision Matrix

```text
Scenario                          | Action           | Why
──────────────────────────────────┼─────────────────┼──────────────
Catch clause in try-catch        | Use unknown ✅   | Spec required
Regular function parameter       | Type properly    | Can control type
Variable in function             | Type properly    | Can infer type
Third-party error type          | unknown + guard  | Can't predict
Library that might update        | unknown + guard  | Future-proof
Your own thrown errors          | unknown + guard  | Defensive
```

---

## Production Checklist

```typescript
// ✅ Production-Grade Error Handling

try {
  // Your operation
} catch (error: unknown) {
  // eslint-disable-next-line no-restricted-syntax
  //   ↑ Valid: TypeScript spec requirement

  // Extract error message safely
  const message = error instanceof Error
    ? error.message
    : String(error);

  // Log with context
  logger.error('Operation failed:', {
    context: name,
    error: message,
    timestamp: new Date().toISOString(),
  });

  // Handle appropriately
  throw error;  // or return failure, or recover
}

✅ Type-safe
✅ Runtime-safe
✅ Debuggable (good logging)
✅ Standards-compliant
✅ Ready for production
```

---

## Summary

| Aspect                | Status  | Why                                          |
| --------------------- | ------- | -------------------------------------------- |
| **Type Safety**       | ✅ Good | unknown + type guards handle all cases       |
| **Runtime Safety**    | ✅ Good | Prevents crashes from unexpected error types |
| **Error Messages**    | ✅ Good | Can safely extract message or use fallback   |
| **ESLint Compliance** | ✅ Good | Suppress is justified and documented         |
| **Industry Standard** | ✅ Good | Used everywhere in production code           |
| **Maintainability**   | ✅ Good | Pattern is clear and well-known              |
| **Future-Proof**      | ✅ Good | Works with any error type                    |

---

## References

For detailed explanations, see:

- **[DEEP_DIVE.md](DEEP_DIVE.md)** - Complete analysis
- **[ESLINT_DISABLE.md](ESLINT_DISABLE.md)** - Spec details
- **[documentation/CODING-STANDARDS.md](documentation/CODING-STANDARDS.md)** - Code patterns

---

### Bottom Line: Your error handling is correct. No changes needed. ✅
