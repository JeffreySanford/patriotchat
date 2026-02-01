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

  beforeEach(() => {
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

  afterEach(() => {
    httpController.verify();
    component.ngOnDestroy();
  });

  it('issues the LLM query and records the response', () => {
    const prompt: string = 'Audit the guardrail log';
    component.queryForm.controls['query'].setValue(prompt);

    component.submitQuery();

    const request: TestRequest = httpController.expectOne(
      (req: HttpRequest<Record<string, string>>) =>
        req.url.endsWith('/llm') && req.params.get('q') === prompt,
    );
    request.flush({ response: 'safe response' });

    expect(component.loading).toBe(false);
    expect(component.response).toBe('safe response');
    expect(component.error).toBeNull();
  });
});
