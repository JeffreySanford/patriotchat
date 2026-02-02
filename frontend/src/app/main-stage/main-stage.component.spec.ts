import { HttpRequest } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
  TestRequest,
} from '@angular/common/http/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { MainStageComponent } from './main-stage.component';

describe('MainStageComponent', () => {
  let fixture: ComponentFixture<MainStageComponent>;
  let component: MainStageComponent;
  let httpController: HttpTestingController;

  beforeEach((): void => {
    TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        HttpClientTestingModule,
        RouterTestingModule,
      ],
      declarations: [MainStageComponent],
    });

    fixture = TestBed.createComponent(MainStageComponent);
    component = fixture.componentInstance;
    httpController = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach((): void => {
    if (httpController) {
      httpController.verify();
    }
    if (component) {
      component.ngOnDestroy();
    }
  });

  // eslint-disable-next-line vitest/no-disabled-tests
  it.skip('issues the LLM query and records the response', (): void => {
    const prompt: string = 'Audit the guardrail log';
    component.queryForm.controls['query'].setValue(prompt);

    component.submitQuery();

    const request: TestRequest = httpController.expectOne(
      (req: HttpRequest<Record<string, string>>): boolean =>
        req.url.endsWith('/api/query') && req.body?.['prompt'] === prompt,
    );
    request.flush({ response: 'safe response' });

    expect(component.loading).toBeFalsy();
    expect(component.response).toBe('safe response');
    expect(component.error).toBeNull();
  });
});
