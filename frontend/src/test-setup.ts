// Vitest setup file for Angular testing
import { getTestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';

// Initialize Angular TestBed environment ONCE for all tests
// This must happen before any test tries to use TestBed
getTestBed().initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting()
);

// Suppress console warnings with proper type annotations
const consoleWarn: typeof console.warn = console.warn;
const consoleError: typeof console.error = console.error;

console.warn = (...args: Array<string | null>): void => {
  const message: string = String(args[0]);
  if (!message.includes('Navigation triggered outside Angular zone')) {
    consoleWarn(...args);
  }
};

console.error = (...args: Array<string | null>): void => {
  const message: string = String(args[0]);
  if (!message.includes('NullInjectorError') && !message.includes('NG0100')) {
    consoleError(...args);
  }
};


