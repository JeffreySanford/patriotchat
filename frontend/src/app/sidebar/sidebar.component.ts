import { Component } from '@angular/core';

interface SidebarSection {
  title: string;
  description: string;
  accent: string;
}

interface SidebarLink {
  label: string;
  icon: string;
  hint: string;
  path: string;
}

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  standalone: false,
})
export class SidebarComponent {
  readonly sections: SidebarSection[] = [
    {
      title: 'Workspace preparedness',
      description:
        'Files are writable, the extension is green, and telemetry is flowing.',
      accent: '#4ade80',
    },
    {
      title: 'Client guardrails',
      description:
        'Response policies, token budgets, and prompt templates stay enforced.',
      accent: '#38bdf8',
    },
    {
      title: 'Operational clarity',
      description:
        'Logs, status badges, and acceptance notes keep teammates aligned.',
      accent: '#f472b6',
    },
  ];

  readonly quickLinks: SidebarLink[] = [
    {
      label: 'Conversation history',
      icon: 'history',
      hint: 'Review recent prompts',
      path: '/history',
    },
    {
      label: 'Guardrail playbook',
      icon: 'report',
      hint: 'See which policies are protecting you',
      path: '/guardrails',
    },
    {
      label: 'Service status',
      icon: 'trending_up',
      hint: 'Inspect LLM health',
      path: '/status',
    },
    {
      label: 'Metrics board',
      icon: 'speed',
      hint: 'Monitor latency & throughput',
      path: '/metrics',
    },
  ];
}
