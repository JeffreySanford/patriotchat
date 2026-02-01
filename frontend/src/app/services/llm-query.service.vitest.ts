import { HttpRequest } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController, TestRequest } from '@angular/common/http/testing';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { LlmQueryService, QueryResponse } from './llm-query.service';

describe('LlmQueryService', () => {
  let service: LlmQueryService;
  let httpController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [LlmQueryService],
    });
    service = TestBed.inject(LlmQueryService);
    httpController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpController.verify();
  });

  it('appends the prompt as a query parameter', () => {
    const prompt: string = 'Summarize the logs';
    service.query(prompt).subscribe((response: QueryResponse) => {
      expect(response.response).toBe('mocked');
    });

    const request: TestRequest = httpController.expectOne(
      (req: HttpRequest<Record<string, string>>) =>
        req.url.endsWith('/llm') && req.params.get('q') === prompt
    );
    request.flush({ response: 'mocked' });
  });
});
