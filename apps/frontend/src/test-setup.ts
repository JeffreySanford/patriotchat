/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import 'zone.js';
import 'zone.js/testing';
import { getTestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting,
} from '@angular/platform-browser-dynamic/testing';
import { vi } from 'vitest';

// Mock fetch for template loading
global.fetch = vi
  .fn()
  .mockRejectedValue(new Error('Templates disabled in tests'));

// Mock XMLHttpRequest for any file loading
class MockXHR {
  open(): void {
    // Mock implementation - no-op
  }

  send(): void {
    throw new Error('Templates disabled in tests');
  }

  addEventListener(): void {
    // Mock implementation - no-op
  }
}

(global as Record<string, typeof MockXHR>).XMLHttpRequest = MockXHR;

// First, initialize the Angular testing environment.
getTestBed().initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting(),
);
