import { Route } from '@angular/router';
import { LandingPageComponent } from './pages/landing/landing-page.component';
import { VscodeGuidePageComponent } from './pages/vscode-guide/vscode-guide-page.component.ts';
import { GuardrailsPageComponent } from './pages/guardrails/guardrails-page.component';
import { HistoryPageComponent } from './pages/history/history-page.component.ts';
import { MetricsPageComponent } from './pages/metrics/metrics-page.component';
import { StatusPageComponent } from './pages/status/status-page.component.ts';

export const appRoutes: Route[] = [
  { path: '', component: LandingPageComponent },
  { path: 'vscode', component: VscodeGuidePageComponent },
  { path: 'history', component: HistoryPageComponent },
  { path: 'guardrails', component: GuardrailsPageComponent },
  { path: 'status', component: StatusPageComponent },
  { path: 'metrics', component: MetricsPageComponent },
  { path: '**', redirectTo: '' },
];
