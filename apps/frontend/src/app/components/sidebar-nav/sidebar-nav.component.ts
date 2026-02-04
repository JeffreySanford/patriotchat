/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/typedef */
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';
import { AuthService, User } from '../../services/auth.service';

export interface NavRoute {
  label: string;
  path: string;
  icon: string;
  requiredRoles?: string[];
}

@Component({
  selector: 'app-sidebar-nav',
  templateUrl: './sidebar-nav.component.html',
  styleUrls: ['./sidebar-nav.component.scss'],
  standalone: true,
  imports: [CommonModule],
})
export class SidebarNavComponent implements OnInit, OnDestroy {
  routes: NavRoute[] = [
    {
      label: 'Dashboard',
      path: '/dashboard',
      icon: '📊',
      requiredRoles: ['guest', 'user', 'power', 'admin'],
    },
    {
      label: 'Analytics',
      path: '/analytics',
      icon: '📈',
      requiredRoles: ['user', 'power', 'admin'],
    },
    {
      label: 'Settings',
      path: '/settings',
      icon: '⚙️',
      requiredRoles: ['user', 'power', 'admin'],
    },
    { label: 'Admin', path: '/admin', icon: '👑', requiredRoles: ['admin'] },
  ];

  activeRoute: string = '';
  userRole: string = 'guest';
  filteredRoutes: NavRoute[] = [];
  private destroy$: Subject<void> = new Subject<void>();

  constructor(
    private router: Router,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    // Track route changes
    this.router.events
      .pipe(
        filter(
          (event): event is NavigationEnd =>
            event instanceof NavigationEnd,
        ),
        takeUntil(this.destroy$),
      )
      .subscribe((event: NavigationEnd): void => {
        this.activeRoute = event.urlAfterRedirects;
      });

    // Get user role
    this.authService.user$
      .pipe(takeUntil(this.destroy$))
      .subscribe((user: User | null): void => {
        this.userRole = user?.role || 'guest';
        this.filterRoutes();
      });

    this.filterRoutes();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private filterRoutes(): void {
    this.filteredRoutes = this.routes.filter((route: NavRoute): boolean => {
      if (!route.requiredRoles) return true;
      return route.requiredRoles.includes(this.userRole);
    });
  }

  navigate(path: string): void {
    this.router.navigate([path]);
  }

  isActive(route: NavRoute): boolean {
    return this.activeRoute.includes(route.path);
  }
}
