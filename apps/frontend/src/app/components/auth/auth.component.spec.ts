import { describe, it, beforeEach, expect, vi } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { AuthComponent } from './auth.component';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CommonModule } from '@angular/common';
import { of, throwError } from 'rxjs';

describe('AuthComponent', () => {
  let component: AuthComponent;
  let fixture: ComponentFixture<AuthComponent>;
  let authService: AuthService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AuthComponent],
      imports: [FormsModule, HttpClientTestingModule, CommonModule],
      providers: [AuthService],
    }).compileComponents();

    fixture = TestBed.createComponent(AuthComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with login form', () => {
    expect(component.currentForm).toBe('login');
    expect(component.loading).toBeFalsy();
    expect(component.error).toBe('');
  });

  it('should toggle between login and register forms', () => {
    expect(component.currentForm).toBe('login');
    component.toggleForm();
    expect(component.currentForm).toBe('register');
    component.toggleForm();
    expect(component.currentForm).toBe('login');
  });

  it('should call authService.login on onLogin', () => {
    vi.spyOn(authService, 'login').mockReturnValue(
      of({
        token: 'test-token',
        user: {
          id: '1',
          username: 'test',
          email: 'test@example.com',
          tier: 'free',
        },
      }),
    );

    component.email = 'test@example.com';
    component.password = 'password';
    component.onLogin();

    expect(authService.login).toHaveBeenCalledWith(
      'test@example.com',
      'password',
    );
  });

  it('should call authService.register on onRegister', () => {
    vi.spyOn(authService, 'register').mockReturnValue(
      of({
        token: 'test-token',
        user: {
          id: '1',
          username: 'test',
          email: 'test@example.com',
          tier: 'free',
        },
      }),
    );

    component.username = 'testuser';
    component.email = 'test@example.com';
    component.password = 'password';
    component.currentForm = 'register';
    component.onRegister();

    expect(authService.register).toHaveBeenCalledWith(
      'testuser',
      'test@example.com',
      'password',
    );
  });

  it('should set loading state during login', async () => {
    vi.spyOn(authService, 'login').mockReturnValue(
      of({
        token: 'test-token',
        user: {
          id: '1',
          username: 'test',
          email: 'test@example.com',
          tier: 'free',
        },
      }),
    );

    component.email = 'test@example.com';
    component.password = 'password';
    component.onLogin();

    expect(component.loading).toBeTruthy();

    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(component.loading).toBeFalsy();
  });

  it('should handle login errors', async () => {
    vi.spyOn(authService, 'login').mockReturnValue(
      throwError(() => new Error('Login failed')),
    );

    component.email = 'test@example.com';
    component.password = 'wrong-password';
    component.onLogin();

    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(component.error).toBeTruthy();
    expect(component.loading).toBeFalsy();
  });
});
