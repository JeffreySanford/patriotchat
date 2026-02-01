import { Component } from '@angular/core';

interface GuestMethod {
  icon: string;
  label: string;
  description: string;
}

interface HeaderLink {
  label: string;
  path: string;
}

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: false,
})
export class HeaderComponent {
  readonly guestMethods: GuestMethod[] = [
    {
      icon: 'background_blur',
      label: 'File edit walkthrough',
      description:
        'Validate that VS Code can save files and accept editor prompts.',
    },
    {
      icon: 'light_mode',
      label: 'Inline suggestions',
      description: 'Observe how inline hints behave so you can trust the flow.',
    },
    {
      icon: 'sync',
      label: 'Re-sync settings',
      description:
        'Reload VS Code or adjust settings when inputs stop reacting.',
    },
  ];

  readonly navLinks: HeaderLink[] = [
    { label: 'Overview', path: '/' },
    { label: 'Workflows', path: '/vscode' },
    { label: 'History', path: '/history' },
    { label: 'Guardrails', path: '/guardrails' },
    { label: 'Status', path: '/status' },
    { label: 'Metrics', path: '/metrics' },
  ];

  readonly appName: string = 'Patriot Chat Studio';
  readonly strLabel: string = 'STR';
  readonly loginLabel: string = 'Login';
  readonly loginHint: string = 'Coming soon';
}
