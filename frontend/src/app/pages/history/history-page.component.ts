import { ChangeDetectionStrategy, Component } from '@angular/core';

interface HistoryEntry {
  prompt: string;
  summary: string;
  model: string;
  status: 'success' | 'warning' | 'error';
  timestamp: string;
  duration: string;
}

@Component({
  selector: 'app-history-page',
  templateUrl: './history-page.component.html',
  styleUrls: ['./history-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false
})
export class HistoryPageComponent {
  protected readonly historyEntries: HistoryEntry[] = [
    {
      prompt: 'Summarize the new policy changes with action items.',
      summary: 'Created an executive summary, flagged two follow-up tickets.',
      model: 'gpt-4.1',
      status: 'success',
      timestamp: 'Feb 1 · 11:02 AM',
      duration: '1.2s',
    },
    {
      prompt: 'Refactor the auth module to use the latest guardrails.',
      summary: 'Drafted a plan, but flagged missing tests for manual review.',
      model: 'gpt-4.1',
      status: 'warning',
      timestamp: 'Feb 1 · 10:24 AM',
      duration: '3.6s',
    },
    {
      prompt: 'Audit money flow exports for dark-money indicators.',
      summary: 'Encountered a blocked request due to dataset permissions.',
      model: 'gpt-4.1',
      status: 'error',
      timestamp: 'Feb 1 · 9:58 AM',
      duration: '0.8s',
    },
  ];
}
