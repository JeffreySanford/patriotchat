import { describe, expect, it } from 'vitest';
import { FooterComponent } from './footer.component';

describe('FooterComponent', () => {
  const component: FooterComponent = new FooterComponent();

  it('reports current year and links', () => {
    expect(component.currentYear).toBeGreaterThanOrEqual(2025);
    expect(component.links).toEqual(
      expect.arrayContaining([expect.objectContaining({ label: 'Design tokens' })])
    );
  });
});
