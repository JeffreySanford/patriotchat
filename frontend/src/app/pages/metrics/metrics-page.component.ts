import { ChangeDetectionStrategy, Component } from '@angular/core';

interface MetricsTile {
  label: string;
  value: string;
  hint: string;
  trend: 'up' | 'down' | 'flat';
}

interface MetricTimeline {
  label: string;
  trend: 'steady' | 'improving' | 'declining';
  detail: string;
}

@Component({
  selector: 'app-metrics-page',
  templateUrl: './metrics-page.component.html',
  styleUrls: ['./metrics-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class MetricsPageComponent {
  readonly tiles: MetricsTile[] = [
    {
      label: 'Guardrail pass rate',
      value: '98.5%',
      hint: 'Based on the last 50 prompts',
      trend: 'up',
    },
    {
      label: 'Average latency',
      value: '220ms',
      hint: 'All queues � 5 retries',
      trend: 'flat',
    },
    {
      label: 'Token spend',
      value: '4.8k',
      hint: 'Per 24h window',
      trend: 'down',
    },
  ];

  readonly timeline: MetricTimeline[] = [
    {
      label: '09:00 AM',
      trend: 'improving',
      detail: 'Assistant warmed up after the nightly rollback.',
    },
    {
      label: '11:30 AM',
      trend: 'steady',
      detail: 'Decked-out guardrail run with 3 blocked edits.',
    },
    {
      label: '02:15 PM',
      trend: 'steady',
      detail: 'Telemetry pipeline resumed after the metrics cache pause.',
    },
    {
      label: '04:00 PM',
      trend: 'improving',
      detail: 'Latency dip when the new routing policy landed.',
    },
  ];
}
