# Socket Services & Event Naming

Purpose

- Describe naming conventions, payload typing, and implementation patterns for Socket.IO or WebSocket integrations so events remain predictable and auditable.

Event Naming

- Use `domain:entity:action` format for event names (colon-separated). Examples:
  - `chat:message:new`
  - `user:profile:updated`
  - `admin:logs:stream`

Payloads & Typing

- Define all socket payload DTOs in `libs/shared` and export explicit interfaces. Example:

```ts
export interface ChatMessageSocketPayload {
  messageId: string;
  userId: string;
  text: string;
  sentAt: string; // ISO 8601
}
```

- Always validate inbound payloads server-side with DTO validation (class-validator or equivalent) and sanitize text before broadcasting.

Server patterns

- Use a single Socket service to centralize emission and permission checks:
  - `SocketService.emitToAll(event: string, payload: unknown)`
  - `SocketService.emitToRoom(room: string, event: string, payload: unknown)`

Client patterns

- Use a typed facade in Angular to expose Observables for socket streams. Avoid sharing raw socket objects across components; centralize subscriptions in facades (BehaviorSubject, shareReplay).

Security

- Authenticate socket connections (JWT or session-based) and apply permission checks before emitting events.
- Rate-limit high-frequency event emitters and monitor for abnormal patterns.

Testing

- Add socket integration tests that assert types/validation and that guardrail filtering applies before emitting any event containing user content.
