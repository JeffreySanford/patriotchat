import { describe, expect, it } from 'vitest';
import { HeaderComponent } from './header.component';

describe('HeaderComponent', () => {
  const component: HeaderComponent = new HeaderComponent();

  it('exposes guest methods', () => {
    expect(component.guestMethods).toBeDefined();
    expect(component.guestMethods.length).toBeGreaterThan(0);
  });

  it('has navigation links', () => {
    expect(component.navLinks).toEqual([
      expect.objectContaining({ label: 'Overview', path: '/' }),
      expect.objectContaining({ label: 'Workflows' }),
    ]);
  });

  it('holds a brand name and STR label', () => {
    expect(component.appName).toBe('Patriot Chat Studio');
    expect(component.strLabel).toBe('STR');
  });

  it('exposes login hint details', () => {
    expect(component.loginLabel).toBe('Login');
    expect(component.loginHint).toBe('Coming soon');
  });
});
