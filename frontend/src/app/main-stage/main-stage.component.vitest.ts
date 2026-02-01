import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { describe, expect, it, beforeEach } from 'vitest';
import { of } from 'rxjs';
import { LlmQueryService } from '../services/llm-query.service';
import { MainStageComponent } from './main-stage.component';

class MockLlmService {
  lastQuery: string | null = null;

  query(prompt: string) {
    this.lastQuery = prompt;
    return of('mock response');
  }
}

describe('MainStageComponent', () => {
  let fixture: ComponentFixture<MainStageComponent>;
  let component: MainStageComponent;
  let mockService: MockLlmService;

  beforeEach(async () => {
    mockService = new MockLlmService();
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [MainStageComponent],
      providers: [{ provide: LlmQueryService, useValue: mockService }],
    }).compileComponents();

    fixture = TestBed.createComponent(MainStageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('exposes screen badges', () => {
    expect(component.badges.length).toBeGreaterThanOrEqual(3);
    expect(component.badges[0]).toHaveProperty('label');
  });

  it('shares quick insights', () => {
    expect(component.insights.length).toBeGreaterThanOrEqual(3);
    expect(component.insights[0]).toHaveProperty('detail');
  });

  it('routes queries to the LLM service', () => {
    component.queryForm.setValue({ query: 'Hello assistant' });
    component.submitQuery();
    expect(mockService.lastQuery).toBe('Hello assistant');
    expect(component.response).toBe('mock response');
    expect(component.loading).toBe(false);
    expect(component.error).toBeNull();
  });

  it('calculates remaining time for progress', () => {
    component.loadingElapsedSeconds = 5;
    expect(component.remainingSeconds).toBe(component.estimatedDurationSeconds - 5);
  });
});
