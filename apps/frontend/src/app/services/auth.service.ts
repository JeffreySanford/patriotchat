/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export type UserRole = 'guest' | 'user' | 'power' | 'admin';

export interface User {
  id: string;
  username: string;
  email: string;
  tier: string;
  role?: UserRole;
}

export interface LoginResponse {
  token: string;
  user: User;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly API_URL: string = environment.apiUrl;
  private userSubject: BehaviorSubject<User | null> =
    new BehaviorSubject<User | null>(null);
  public user$: Observable<User | null> = this.userSubject.asObservable();

  private authSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
    this.isAuthenticatedSync(),
  );
  public isAuthenticated$: Observable<boolean> =
    this.authSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadUser();
  }

  register(
    username: string,
    email: string,
    password: string,
  ): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.API_URL}/auth/register`, {
        username,
        email,
        password,
      })
      .pipe(
        tap((response: LoginResponse): void => {
          // Response is wrapped by the HTTP layer as {data: LoginResponse, timestamp, status}
          const wrappedResponse: { data?: LoginResponse } = response as {
            data?: LoginResponse;
          };
          const authData: LoginResponse | undefined = wrappedResponse.data;
          const token: string | undefined = authData?.token;
          if (token && typeof token === 'string' && token !== 'undefined') {
            localStorage.setItem('token', token);
            this.userSubject.next(authData!.user);
            this.authSubject.next(true);
          }
        }),
      );
  }

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.API_URL}/auth/login`, {
        email,
        password,
      })
      .pipe(
        tap((response: LoginResponse): void => {
          console.log('[AuthService] Raw login response:', response);
          // Response is wrapped by the HTTP layer as {data: LoginResponse, timestamp, status}
          const wrappedResponse: { data?: LoginResponse } = response as {
            data?: LoginResponse;
          };
          const authData: LoginResponse | undefined = wrappedResponse.data;
          const token: string | undefined = authData?.token;
          if (token && typeof token === 'string' && token !== 'undefined') {
            console.log('[AuthService] Storing token:', {
              tokenLength: token.length,
            });
            localStorage.setItem('token', token);
            this.userSubject.next(authData!.user);
            this.authSubject.next(true);
          } else {
            console.error('[AuthService] Invalid token in response:', {
              token,
              response,
            });
          }
        }),
      );
  }

  logout(): void {
    localStorage.removeItem('token');
    this.userSubject.next(null);
    this.authSubject.next(false);
  }

  private loadUser(): void {
    const token: string | null = localStorage.getItem('token');
    if (token) {
      this.http
        .get<User>(`${this.API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .subscribe({
          next: (user: User): void => this.userSubject.next(user),
          error: (): void => this.logout(),
        });
    }
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  private isAuthenticatedSync(): boolean {
    return !!localStorage.getItem('token');
  }
}
