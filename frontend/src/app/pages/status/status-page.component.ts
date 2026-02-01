import { ChangeDetectionStrategy, Component } from '@angular/core';

interface HealthCheck {
  label: string;
  detail: string;
  status: 'healthy' | 'degraded' | 'offline';
}

interface Metric {
  label: string;
  value: string;
  hint: string;
}

@Component({
  selector: 'app-status-page',
  templateUrl: './status-page.component.html',
  styleUrls: ['./status-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false
})
export class StatusPageComponent {
  protected readonly healthChecks: HealthCheck[] = [
    {
      label: 'LLM endpoint',
      detail: 'Latency 180ms · 5 retriable errors in the last hour',
      status: 'healthy',
    },
    {
      label: 'Authentication service',
      detail: 'Token cache refreshed 2 minutes ago',
      status: 'healthy',
    },
    {
      label: 'Telemetry pipeline',
      detail: 'Batch upload queued · waiting for retry window',
      status: 'degraded',
    },
  ];

  protected readonly recentMetrics: Metric[] = [
    { label: 'Average latency', value: '220ms', hint: 'Last 20 requests' },
    { label: 'Errors flagged', value: '1.1%', hint: 'Over last 24h' },
    { label: 'Model version', value: 'gpt-4.1-local', hint: 'Pinned by policy' },
  ];
}
