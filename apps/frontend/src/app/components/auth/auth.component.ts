import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <h1>PatriotChat</h1>
        <p class="subtitle">Track Politics, Data-Driven</p>

        <form (ngSubmit)="currentForm === 'login' ? onLogin() : onRegister()">
          <div *ngIf="currentForm === 'register'" class="form-group">
            <input
              type="text"
              [(ngModel)]="username"
              name="username"
              placeholder="Username"
              required
              class="input-field"
            />
          </div>

          <div class="form-group">
            <input
              type="email"
              [(ngModel)]="email"
              name="email"
              placeholder="Email"
              required
              class="input-field"
            />
          </div>

          <div class="form-group">
            <input
              type="password"
              [(ngModel)]="password"
              name="password"
              placeholder="Password"
              required
              class="input-field"
            />
          </div>

          <button type="submit" [disabled]="loading" class="btn-primary">
            {{ loading ? 'Loading...' : (currentForm === 'login' ? 'Login' : 'Register') }}
          </button>

          <p *ngIf="error" class="error-message">{{ error }}</p>
        </form>

        <div class="form-toggle">
          <p>
            {{ currentForm === 'login' ? "Don't have an account?" : 'Already have an account?' }}
            <button
              type="button"
              (click)="toggleForm()"
              class="toggle-btn"
            >
              {{ currentForm === 'login' ? 'Register' : 'Login' }}
            </button>
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100%;
    }

    .auth-card {
      background: white;
      padding: 40px;
      border-radius: 10px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
      width: 100%;
      max-width: 400px;
    }

    h1 {
      text-align: center;
      color: #667eea;
      margin-bottom: 10px;
      font-size: 28px;
    }

    .subtitle {
      text-align: center;
      color: #999;
      margin-bottom: 30px;
      font-size: 14px;
    }

    .form-group {
      margin-bottom: 20px;
    }

    .input-field {
      width: 100%;
      padding: 12px;
      border: 1px solid #ddd;
      border-radius: 5px;
      font-size: 14px;
      font-family: inherit;
      transition: border-color 0.3s;
    }

    .input-field:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    .btn-primary {
      width: 100%;
      padding: 12px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 5px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.2s;
    }

    .btn-primary:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
    }

    .btn-primary:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }

    .error-message {
      color: #e74c3c;
      font-size: 14px;
      margin-top: 15px;
      text-align: center;
    }

    .form-toggle {
      text-align: center;
      margin-top: 20px;
      font-size: 14px;
    }

    .toggle-btn {
      background: none;
      border: none;
      color: #667eea;
      cursor: pointer;
      text-decoration: underline;
      font-weight: 600;
      padding: 0;
    }

    .toggle-btn:hover {
      color: #764ba2;
    }
  `],
})
export class AuthComponent {
  currentForm: 'login' | 'register' = 'login';
  email = '';
  password = '';
  username = '';
  loading = false;
  error = '';

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
      next: () => {
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.error || 'Login failed';
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
      next: () => {
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.error || 'Registration failed';
      },
    });
  }
}
