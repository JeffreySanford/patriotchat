import { TestBed, ComponentFixture } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { App } from './app';
import { RouterModule } from '@angular/router';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterModule.forRoot([])],
      declarations: [App],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  });

  // eslint-disable-next-line vitest/no-disabled-tests
  it.skip('should render the navigation shell', async () => {
    const fixture: ComponentFixture<App> = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled: HTMLElement = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-header')).toBeTruthy();
    expect(compiled.querySelector('app-main-stage')).toBeTruthy();
    expect(compiled.querySelector('app-footer')).toBeTruthy();
  });
});
