# Frontend UI Requirements

**Framework:** Angular 21.1.0 + Angular Material 21.1.0  
**State Management:** @ngrx/component-store  
**Date:** February 2, 2026

---

## Overview

PatriotChat frontend is a single-page application (SPA) that provides interfaces for:

- User authentication & account management
- Funding data search & visualization
- Policy exploration
- AI-powered queries with LLM model selection
- Personal audit trail viewing
- Dashboard & analytics

---

## Core Pages & Features

### 1. Authentication Pages

#### Login Page

- Email/password login
- "Forgot Password" link
- Social login options (optional future)
- Tier display (free/power/premium)
- Rate limit status display

#### Registration Page

- Email, username, password
- Terms & conditions checkbox
- Email verification flow
- Tier selection (display free tier default)

#### Account Settings

- Change password
- Update email
- View account tier
- API key generation (for power/premium users)
- Download personal data (GDPR)
- View audit trail of account changes

### 2. Main Dashboard

#### Header/Navigation

- Logo + app name
- Search bar (global search)
- User profile dropdown
- Notification bell (future)
- Help/documentation link

#### Dashboard Cards

- **Quick Stats:** Queries this month, total funding tracked, etc.
- **Recent Activity:** Last 5 queries, last policy changes
- **Your Tier:** Current tier, usage limits, upgrade path
- **LLM Model Selector:** (See below)

### 3. Funding Data Explorer

#### Search/Filter View

- Text search by entity name
- Filter by entity type (person, organization, candidate)
- Filter by funding source (FEC, ProPublica, etc.)
- Date range picker
- Sort options (funding amount, date, name)

#### Results Display

- Table with columns: Name, Type, Amount, Last Updated
- Pagination with page size selector
- Click row to view details

#### Detail View

- Full funding record
- Historical changes (from audit log - scrubbed)
- Related entities (organizations, individuals)
- Export options (CSV, JSON)

### 4. Policy Management

#### Policy List View

- Searchable list of policies
- Filter by category
- Status indicators (active, archived)
- Sort by date modified

#### Policy Detail View

- Full policy content
- Version history (from audit log)
- Related funding data
- Edit button (if user has permission)
- Comment thread (future)

### 5. LLM Query Interface

#### Query Input Panel

- **Model Selector** (NEW - if feasible)

  ```text
  Dropdown: [Mistral (Default) ▼]
  - Mistral (primary)
  - Mistral Variant 2 (alternative 1)
  - Mistral Variant 3 (alternative 2)
  ```

  - Default to Mistral
  - Remember user's last selection
  - Show model description on hover

- Text input for query
- Context selector (funding, policy, general)
- Advanced options (collapsible)
  - Temperature slider (0.0 - 1.0)
  - Top-p slider
  - Max tokens

#### Query Results Panel

- Model used (display which variant was selected)
- Response text (streaming or full)
- Performance metrics
  - Latency (ms)
  - Tokens used
  - Rate limit remaining
- Suggested follow-up questions
- Copy/export buttons
- Audit trail of this query

#### Rate Limit Display

- Current tier limits
- Usage this hour
- Visual indicator (progress bar)
- Warning when approaching limit

### 6. User Audit Trail / Activity View

#### Personal Audit Trail

- List of user's own activities
- **Columns:** Date, Action, Resource, Status
- Scrubbed data only (PII removed)
- Filter by action type
- Date range filter
- Download as CSV

#### Activity Detail

- Timestamp
- What changed (safe to show)
- Old value → New value (for fields user modified)
- Associated request/query

### 7. Account & Settings Pages

#### Tier Management

- Current tier display
- Upgrade options
- Feature comparison (free vs power vs premium)
- Billing information (if applicable)

#### API Keys (Power/Premium only)

- List of API keys
- Create new key button
- Revoke key button
- Copy key to clipboard
- Rate limit per key

#### Privacy & Data

- Download my data (GDPR export)
- View audit trail
- Request deletion (with confirmation)
- Privacy policy + terms

---

## Components Library

### Material Components Used

- **Navigation:** `<mat-sidenav>`, `<mat-toolbar>`, `<mat-menu>`
- **Tables:** `<mat-table>`, `<mat-paginator>`, `<mat-sort>`
- **Forms:** `<mat-form-field>`, `<mat-select>`, `<mat-input>`
- **Cards:** `<mat-card>`, `<mat-card-header>`, `<mat-card-content>`
- **Dialogs:** `<mat-dialog>` for confirmations
- **Progress:** `<mat-progress-bar>` for rate limits

### Custom Components

- `AppHeader` - Top navigation bar
- `RateLimitIndicator` - Display current rate limit status
- `AuditTrailViewer` - Display scrubbed audit logs
- `LlmModelSelector` - NEW: Model dropdown with info
- `FundingDataTable` - Searchable funding data
- `PolicyViewer` - Policy display with history
- `QueryInterface` - LLM query input/output

---

## LLM Model Selector (NEW)

### Implementation Approach

**IF Common Patterns Exist:**

- Add dropdown to query panel
- Store selected model in component state + localStorage
- Pass `model` parameter to API call
- Display selected model in results

**Implementation:**

```typescript
// query.component.ts
selectedModel: string = 'mistral';
models = [
  { id: 'mistral', name: 'Mistral', description: 'Default fine-tuned model' },
  { id: 'mistral-v2', name: 'Mistral Variant 2', description: 'Optimized for policy analysis' },
  { id: 'mistral-v3', name: 'Mistral Variant 3', description: 'Specialized for funding data' }
];

onModelChange(modelId: string) {
  this.selectedModel = modelId;
  localStorage.setItem('llm_model', modelId);
}

submitQuery() {
  this.llmService.query(this.queryText, {
    model: this.selectedModel,
    temperature: this.temperature,
    top_p: this.topP
  });
}
```

**API Integration:**

```json
POST /api/query
{
  "query": "...",
  "model": "mistral",        // NEW: Model selector
  "context_type": "funding",
  "parameters": { "temperature": 0.7 }
}
```

**Backend Routing:**

- Gateway routes to `/llm/query` with model parameter
- LLM service loads appropriate fine-tuned model
- Returns response with model metadata

**UI Display:**

```text
Query Results

Model: Mistral (fine-tuned)  [Change Model ▼]
Latency: 345ms
Tokens: 42/100
Rate Limit: 8/10 queries remaining

[Response text here...]
```

### Feasibility Assessment

**Easy Path (Recommended Start):**

- Simple dropdown component
- Store selection in localStorage
- Pass to API, display in results
- Effort: 2-3 hours

**Complete Implementation (Future):**

- Per-model analytics (which variant works best?)
- Model-specific rate limiting
- A/B testing framework
- Effort: 1-2 weeks

---

## Data Binding & State Management

### ngrx/component-store Usage

```typescript
// query.store.ts
interface QueryState {
  selectedModel: string;
  queryText: string;
  results: QueryResult[];
  isLoading: boolean;
  error: string | null;
  rateLimitRemaining: number;
}

export class QueryStore extends ComponentStore<QueryState> {
  constructor(private llmService: LlmService) {
    super({
      selectedModel: localStorage.getItem('llm_model') || 'mistral',
      queryText: '',
      results: [],
      isLoading: false,
      error: null,
      rateLimitRemaining: 10
    });
  }

  readonly submitQuery = this.updater((state, query: string) => ({
    ...state,
    queryText: query,
    isLoading: true
  }));

  readonly setModel = this.updater((state, model: string) => {
    localStorage.setItem('llm_model', model);
    return { ...state, selectedModel: model };
  });
}
```

---

## Responsive Design

### Breakpoints

- **Mobile:** < 600px (single column)
- **Tablet:** 600px - 1200px (2 columns)
- **Desktop:** > 1200px (3 columns)

### Mobile Considerations

- Drawer navigation instead of sidenav
- Simplified tables with card layout
- Full-width modals instead of dialogs
- Touch-friendly buttons (48px minimum)

---

## Accessibility Requirements

- **WCAG 2.1 Level AA compliance**
- Keyboard navigation (Tab, Enter, Escape)
- Screen reader labels (aria-label)
- Color contrast ratio 4.5:1 for text
- Focus indicators visible
- No keyboard traps

---

## Performance Considerations

- **Lazy loading:** Modules per route
- **Change detection:** OnPush strategy
- **Virtual scrolling:** For large lists (audit trail, funding data)
- **Caching:** Results cache in component store
- **Image optimization:** Use WebP with fallback

---

## Security Considerations

- **XSS Prevention:** Angular sanitization by default
- **CSRF Tokens:** Included in HTTP interceptors
- **API Key Storage:** Never in localStorage (sessionStorage only)
- **HTTPS Only:** Redirect HTTP to HTTPS
- **Content Security Policy:** Restrict inline scripts

---

## Dark Mode Support

- Material theming with light/dark themes
- Toggle in settings page
- Persist theme preference to localStorage
- Default: System preference (prefers-color-scheme)

---

## Error Handling

### Error States

- **Network Error:** "Unable to connect. Please check your internet."
- **Rate Limited:** "You've exceeded your rate limit. Current tier: Free. Upgrade for more?"
- **Auth Error:** "Your session expired. Please log in again."
- **Validation Error:** "Query must be at least 5 characters."

### Error Display

- Toast notifications for non-critical errors
- Full page error boundary for critical failures
- Detailed error in browser console
- Send error report to analytics

---

## Testing Strategy

### Unit Tests

- Component specs with @angular/core/testing
- Service mocks with Jasmine
- Store selectors tested

### Integration Tests

- Query flow end-to-end (input → submit → results)
- Authentication flow (login → dashboard)
- Audit trail viewing (permissions, scrubbing)

### E2E Tests

- Playwright tests in `frontend-e2e/`
- Happy path: login → query → view results
- Error path: invalid input → see error message
- Rate limit path: multiple queries → see limit warning

---

## References

- [Angular Material Documentation](https://material.angular.io)
- [ngrx/component-store Guide](https://ngrx.io/guide/component-store)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Angular Security Guide](https://angular.io/guide/security)
