import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

interface LoginResponse {
  token: string;
  user: { id: string; username: string; email: string; tier: string };
}

interface User {
  id: string;
  username: string;
  email: string;
  tier: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly API_URL = 'http://localhost:3000';
  private userSubject = new BehaviorSubject<User | null>(null);
  public user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadUser();
  }

  register(username: string, email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.API_URL}/auth/register`, {
      username,
      email,
      password,
    }).pipe(
      tap((response) => {
        localStorage.setItem('token', response.token);
        this.userSubject.next(response.user);
      })
    );
  }

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.API_URL}/auth/login`, {
      email,
      password,
    }).pipe(
      tap((response) => {
        localStorage.setItem('token', response.token);
        this.userSubject.next(response.user);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    this.userSubject.next(null);
  }

  private loadUser(): void {
    const token = localStorage.getItem('token');
    if (token) {
      this.http.get<User>(`${this.API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      }).subscribe({
        next: (user) => this.userSubject.next(user),
        error: () => this.logout(),
      });
    }
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}
