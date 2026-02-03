import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss'],
  standalone: false
})
export class AuthComponent {
  currentForm: 'login' | 'register' = 'login';
  email: string = '';
  password: string = '';
  username: string = '';
  loading: boolean = false;
  error: string = '';

  constructor(private authService: AuthService) {}

  toggleForm(): void {
    this.currentForm = this.currentForm === 'login' ? 'register' : 'login';
    this.error = '';
  }

  onLogin(): void {
    if (!this.email || !this.password) {
      this.error = 'Please fill in all fields';
      return;
    }

    this.loading = true;
    this.error = '';
    this.authService.login(this.email, this.password).subscribe({
      next: (): void => {
        this.loading = false;
      },
      error: (err: unknown): void => {
        this.loading = false;
        const errorMsg = (err as Record<string, unknown>)?.error?.error || 'Login failed';
        this.error = typeof errorMsg === 'string' ? errorMsg : 'Login failed';
      },
    });
  }

  onRegister(): void {
    if (!this.username || !this.email || !this.password) {
      this.error = 'Please fill in all fields';
      return;
    }

    this.loading = true;
    this.error = '';
    this.authService.register(this.username, this.email, this.password).subscribe({
      next: (): void => {
        this.loading = false;
      },
      error: (err: unknown): void => {
        this.loading = false;
        const errorMsg = (err as Record<string, unknown>)?.error?.error || 'Registration failed';
        this.error = typeof errorMsg === 'string' ? errorMsg : 'Registration failed';
      },
    });
  }
}

