import { TestBed, ComponentFixture } from '@angular/core/testing';
import { App } from './app';
import { NxWelcome } from './nx-welcome';
import { RouterModule } from '@angular/router';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterModule.forRoot([])],
      declarations: [App, NxWelcome],
    }).compileComponents();
  });

  it('should render title', async () => {
    const fixture: ComponentFixture<App> = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled: HTMLElement = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain(
      'Welcome frontend',
    );
  });
});
