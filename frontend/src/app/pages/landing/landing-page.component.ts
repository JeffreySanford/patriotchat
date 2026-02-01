import { ChangeDetectionStrategy, Component } from '@angular/core';

interface HeroStat {
  label: string;
  value: string;
  meta: string;
  accent: string;
}

interface PerformanceInsight {
  title: string;
  detail: string;
}

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class LandingPageComponent {
  protected readonly heroTags: string[] = [
    'LLM client',
    'Guardrails',
    'Performance',
  ];

  protected readonly heroStats: HeroStat[] = [
    {
      label: 'Live requests',
      value: '42/s',
      meta: 'Average over the last minute',
      accent: '#22d3ee',
    },
    {
      label: 'Guardrail pass',
      value: '98.5%',
      meta: 'Policy checks this shift',
      accent: '#10b981',
    },
    {
      label: 'Median latency',
      value: '220ms',
      meta: 'Last 50 prompts',
      accent: '#fbbf24',
    },
  ];

  protected readonly performanceInsights: PerformanceInsight[] = [
    {
      title: 'LLM pipeline',
      detail:
        'Token usage stays under the system budget and each response includes a response checksum for auditability.',
    },
    {
      title: 'Client resiliency',
      detail:
        'Retry smoke checks run every 15 minutes so the UI stays responsive even if the backend spikes.',
    },
    {
      title: 'Telemetry',
      detail:
        'Metrics are streamed to the dashboard in near-real time to keep the guardrail team in sync.',
    },
  ];
}
