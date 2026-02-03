import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss'],
  standalone: false,
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
        let errorMsg: string = 'Login failed';
        if (err && typeof err === 'object' && 'error' in err) {
          const errObj: Record<string, unknown> = err as Record<
            string,
            unknown
          >;
          if (errObj['error'] && typeof errObj['error'] === 'object') {
            const errorDetail: Record<string, unknown> = errObj[
              'error'
            ] as Record<string, unknown>;
            if (typeof errorDetail['error'] === 'string') {
              errorMsg = errorDetail['error'];
            }
          }
        }
        this.error = errorMsg;
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
    this.authService
      .register(this.username, this.email, this.password)
      .subscribe({
        next: (): void => {
          this.loading = false;
        },
        error: (err: unknown): void => {
          this.loading = false;
          let errorMsg: string = 'Registration failed';
          if (err && typeof err === 'object' && 'error' in err) {
            const errObj: Record<string, unknown> = err as Record<
              string,
              unknown
            >;
            if (errObj['error'] && typeof errObj['error'] === 'object') {
              const errorDetail: Record<string, unknown> = errObj[
                'error'
              ] as Record<string, unknown>;
              if (typeof errorDetail['error'] === 'string') {
                errorMsg = errorDetail['error'];
              }
            }
          }
          this.error = errorMsg;
        },
      });
  }
}
