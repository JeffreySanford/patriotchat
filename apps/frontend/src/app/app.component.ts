import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthComponent } from './components/auth/auth.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, AuthComponent, DashboardComponent] as const,
  template: `
    <div class="app-container">
      <app-auth *ngIf="!(authService.user$ | async); else dashboard"></app-auth>
      <ng-template #dashboard>
        <app-dashboard></app-dashboard>
      </ng-template>
    </div>
  `,
  styles: [`
    .app-container {
      width: 100%;
      height: 100%;
    }
  `],
})
export class AppComponent {
  constructor(public authService: AuthService) {}
}
