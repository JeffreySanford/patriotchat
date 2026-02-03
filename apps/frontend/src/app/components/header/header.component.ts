import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService, User } from '../../services/auth.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: false,
})
export class HeaderComponent implements OnInit, OnDestroy {
  user: User | null = null;
  isAuthenticated: boolean = false;
  isDropdownOpen: boolean = false;

  private destroy$: Subject<void> = new Subject<void>();

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    // Subscribe to user changes
    this.authService.user$
      .pipe(takeUntil(this.destroy$))
      .subscribe((user: User | null): void => {
        this.user = user;
      });

    // Subscribe to auth state
    this.authService.isAuthenticated$
      .pipe(takeUntil(this.destroy$))
      .subscribe((isAuth: boolean): void => {
        this.isAuthenticated = isAuth;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  closeDropdown(): void {
    this.isDropdownOpen = false;
  }

  logout(): void {
    this.authService.logout();
    this.isDropdownOpen = false;
  }

  getUserIcon(): string {
    if (!this.isAuthenticated) {
      return '👤'; // Guest
    }

    switch (this.user?.role) {
      case 'admin':
        return '👑'; // Crown for admin
      case 'power':
        return '⚡'; // Lightning for power user
      case 'user':
        return '👤'; // User icon
      default:
        return '👤';
    }
  }

  getRoleLabel(): string {
    if (!this.isAuthenticated) {
      return 'Guest';
    }

    switch (this.user?.role) {
      case 'admin':
        return 'Admin';
      case 'power':
        return 'Power User';
      case 'user':
        return 'User';
      default:
        return 'User';
    }
  }

  getRoleBadgeClass(): string {
    if (!this.isAuthenticated) {
      return 'guest';
    }

    switch (this.user?.role) {
      case 'admin':
        return 'admin';
      case 'power':
        return 'power';
      case 'user':
        return 'user';
      default:
        return 'user';
    }
  }
}
