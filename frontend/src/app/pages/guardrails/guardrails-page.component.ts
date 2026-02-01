import { ChangeDetectionStrategy, Component } from '@angular/core';

interface GuardrailItem {
  title: string;
  detail: string;
  severity: 'info' | 'warning' | 'critical';
  advice: string;
  status: string;
}

@Component({
  selector: 'app-guardrails-page',
  templateUrl: './guardrails-page.component.html',
  styleUrls: ['./guardrails-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class GuardrailsPageComponent {
  readonly guardrails: GuardrailItem[] = [
    {
      title: 'Policy compliance',
      detail:
        'Every request must stay within the civic policy and avoid targeted persuasion.',
      severity: 'warning',
      advice:
        'Flag the thread if the assistant suggests messaging that references prohibited groups.',
      status: 'Monitored',
    },
    {
      title: 'Data provenance',
      detail:
        'Documents sourced from restricted datasets must be rerouted through the audit workflow.',
      severity: 'info',
      advice:
        'Capture the dataset name inside the prompt metadata before sending the request.',
      status: 'Verified',
    },
    {
      title: 'Inline edits',
      detail:
        'Guardrails refuse edits that redact approved policy statements or add disallowed jargon.',
      severity: 'critical',
      advice:
        'Expose the guardrail log to reviewers whenever an edit is blocked.',
      status: 'Blocked until review',
    },
  ];

  readonly tip: string =
    'If the assistant flags a guardrail, document the prompt, refusal reason, and any manual overrides so the audit trail stays intact.';
}
