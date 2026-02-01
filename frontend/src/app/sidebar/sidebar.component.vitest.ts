import { describe, expect, it } from 'vitest';
import { SidebarComponent } from './sidebar.component';

describe('SidebarComponent', () => {
  const component: SidebarComponent = new SidebarComponent();

  it('defines sections with accents', () => {
    expect(component.sections.length).toBe(3);
    expect(component.sections[0].accent).toMatch(/^#/);
  });

  it('offers quick links', () => {
    expect(component.quickLinks).toHaveLength(3);
    expect(typeof component.quickLinks[0].label).toBe('string');
  });
});
