import { ChangeDetectionStrategy, Component } from '@angular/core';

interface SetupStep {
  title: string;
  detail: string;
}

@Component({
  selector: 'app-vscode-guide-page',
  templateUrl: './vscode-guide-page.component.html',
  styleUrls: ['./vscode-guide-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false
})
export class VscodeGuidePageComponent {
  protected readonly tags: string[] = ['VS Code', 'LLM safety', 'Client observability', 'Prompt integrity'];

  protected readonly setupSteps: SetupStep[] = [
    {
      title: 'Point the client to the LLM endpoint',
      detail:
        'Set the PATRIOTCHAT_LLM_URL override if you’re working against a preview API, then verify the authentication token.',
    },
    {
      title: 'Confirm workspace guardrails',
      detail:
        'Mark which files are editable, allow inline suggestions, and keep your formatter disabled until the assistant finishes.',
    },
    {
      title: 'Monitor streaming logs',
      detail:
        'Keep an eye on the real-time console so you can catch latency spikes, rate limits, or hallucinations mid-run.',
    },
  ];

  protected readonly checklist: string[] = [
    'Is the assistant reporting the same workspace path you expect? Double-check resolved directories.',
    'Do the inline suggestions match your intent? Decline any answer that feels unrelated.',
    'Are network requests returning 200 OK? Retry after clearing stale caches if the client shows errors.',
  ];

  protected readonly tipSummary: string =
    'Capture the last prompt, response, and metadata before filing a ticket so the incident can be replayed accurately.';
}
