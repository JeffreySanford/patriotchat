import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { HttpError, getErrorMessage } from '../../models/api-error.model';

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

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

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
        this.router.navigate(['/dashboard']);
      },
      error: (err: HttpErrorResponse): void => {
        this.loading = false;
        this.error = getErrorMessage(err);
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
          this.router.navigate(['/dashboard']);
        },
        error: (err: HttpErrorResponse): void => {
          this.loading = false;
          this.error = getErrorMessage(err);
        },
      });
  }
}
