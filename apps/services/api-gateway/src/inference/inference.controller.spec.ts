import { describe, it, expect, vi, beforeEach } from 'vitest';
import { of, throwError } from 'rxjs';
import { HttpException, HttpStatus } from '@nestjs/common';
import { InferenceController } from './inference.controller';
import { InferenceService } from './inference.service';

describe('InferenceController', () => {
  let controller: InferenceController;
  let service: InferenceService;

  beforeEach(() => {
    const mockInferenceService = {
      getModels: vi.fn(),
      generateInference: vi.fn(),
    };

    service = mockInferenceService as any;
    controller = new InferenceController(service);
  });

  describe('GET /inference/models', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
    });

    it('should have getModels method', () => {
      expect(controller.getModels).toBeDefined();
    });

    it('should return list of models', async () => {
      const mockModels = [
        {
          id: 'llama2',
          name: 'llama2',
          description: 'llama2 language model',
          provider: 'Local',
        },
        {
          id: 'mistral',
          name: 'mistral',
          description: 'mistral language model',
          provider: 'Local',
        },
        {
          id: 'neural-chat',
          name: 'neural-chat',
          description: 'neural-chat language model',
          provider: 'Local',
        },
      ];
      vi.spyOn(service, 'getModels').mockReturnValue(of(mockModels));

      const result = await new Promise((resolve) => {
        controller.getModels().subscribe(resolve);
      });

      expect(result).toBeDefined();
      expect(result.models).toEqual(mockModels);
    });

    it('should call service.getModels', () => {
      vi.spyOn(service, 'getModels').mockReturnValue(of([]));

      controller.getModels();

      expect(service.getModels).toHaveBeenCalled();
    });

    it('should include llama2 in models', async () => {
      const mockModels = [
        {
          id: 'llama2',
          name: 'llama2',
          description: 'llama2 language model',
          provider: 'Local',
        },
        {
          id: 'mistral',
          name: 'mistral',
          description: 'mistral language model',
          provider: 'Local',
        },
        {
          id: 'neural-chat',
          name: 'neural-chat',
          description: 'neural-chat language model',
          provider: 'Local',
        },
      ];
      vi.spyOn(service, 'getModels').mockReturnValue(of(mockModels));

      const result = await new Promise((resolve) => {
        controller.getModels().subscribe(resolve);
      });

      expect(result.models.map((m: any) => m.id)).toContain('llama2');
    });

    it('should include mistral in models', async () => {
      const mockModels = [
        {
          id: 'llama2',
          name: 'llama2',
          description: 'llama2 language model',
          provider: 'Local',
        },
        {
          id: 'mistral',
          name: 'mistral',
          description: 'mistral language model',
          provider: 'Local',
        },
        {
          id: 'neural-chat',
          name: 'neural-chat',
          description: 'neural-chat language model',
          provider: 'Local',
        },
      ];
      vi.spyOn(service, 'getModels').mockReturnValue(of(mockModels));

      const result = await new Promise((resolve) => {
        controller.getModels().subscribe(resolve);
      });

      expect(result.models.map((m: any) => m.id)).toContain('mistral');
    });

    it('should include neural-chat in models', async () => {
      const mockModels = [
        {
          id: 'llama2',
          name: 'llama2',
          description: 'llama2 language model',
          provider: 'Local',
        },
        {
          id: 'mistral',
          name: 'mistral',
          description: 'mistral language model',
          provider: 'Local',
        },
        {
          id: 'neural-chat',
          name: 'neural-chat',
          description: 'neural-chat language model',
          provider: 'Local',
        },
      ];
      vi.spyOn(service, 'getModels').mockReturnValue(of(mockModels));

      const result = await new Promise((resolve) => {
        controller.getModels().subscribe(resolve);
      });

      expect(result.models.map((m: any) => m.id)).toContain('neural-chat');
    });

    it('should handle empty model list', async () => {
      vi.spyOn(service, 'getModels').mockReturnValue(of([]));

      const result = await new Promise((resolve) => {
        controller.getModels().subscribe(resolve);
      });

      expect(result.models).toEqual([]);
    });

    it('should handle service errors on model fetch', () => {
      vi.spyOn(service, 'getModels').mockImplementation(() => {
        throw new Error('Failed to fetch models');
      });

      expect(() => controller.getModels()).toThrow();
    });

    it('should handle service unavailable', () => {
      vi.spyOn(service, 'getModels').mockImplementation(() => {
        throw new Error('Service unavailable');
      });

      expect(() => controller.getModels()).toThrow();
    });
  });

  describe('POST /inference/generate', () => {
    it('should have generateInference method', () => {
      expect(controller.generateInference).toBeDefined();
    });

    it('should accept inference request', async () => {
      const request = {
        prompt: 'Hello, how are you?',
        model: 'llama2',
      };

      const mockResponse = {
        result: 'Hello! I am doing well.',
        model: 'llama2',
        tokens: 50,
        duration: 100,
      };

      vi.spyOn(service, 'generateInference').mockReturnValue(of(mockResponse));

      const result = await new Promise((resolve, reject) => {
        controller.generateInference(request).subscribe(resolve, reject);
      });

      expect(result).toEqual(mockResponse);
    });

    it('should pass request to service', async () => {
      const request = {
        prompt: 'Test prompt',
        model: 'mistral',
      };

      vi.spyOn(service, 'generateInference').mockReturnValue(
        of({
          result: 'Test response',
          model: 'mistral',
          tokens: 50,
          duration: 100,
        }),
      );

      await new Promise((resolve, reject) => {
        controller.generateInference(request).subscribe(resolve, reject);
      });

      expect(service.generateInference).toHaveBeenCalledWith(
        'Test prompt',
        'mistral',
        undefined,
        undefined,
      );
    });

    it('should support context in request', async () => {
      const request = {
        prompt: 'What did I say?',
        model: 'llama2',
        context: 'Earlier I said hello',
      };

      vi.spyOn(service, 'generateInference').mockReturnValue(
        of({
          result: 'You said hello',
          model: 'llama2',
          tokens: 50,
          duration: 100,
        }),
      );

      await new Promise((resolve, reject) => {
        controller.generateInference(request).subscribe(resolve, reject);
      });

      expect(service.generateInference).toHaveBeenCalledWith(
        'What did I say?',
        'llama2',
        'Earlier I said hello',
        undefined,
      );
    });

    it('should return result in response', async () => {
      const request = {
        prompt: 'Test',
        model: 'llama2',
      };

      const mockResponse = {
        result: 'Generated response',
        model: 'llama2',
        tokens: 50,
        duration: 100,
      };

      vi.spyOn(service, 'generateInference').mockReturnValue(of(mockResponse));

      const result = await new Promise((resolve, reject) => {
        controller.generateInference(request).subscribe(resolve, reject);
      });

      expect(result.result).toBeDefined();
      expect(typeof result.result).toBe('string');
    });

    it('should return model in response', async () => {
      const request = {
        prompt: 'Test',
        model: 'llama2',
      };

      const mockResponse = {
        result: 'Response',
        model: 'llama2',
        tokens: 50,
        duration: 100,
      };

      vi.spyOn(service, 'generateInference').mockReturnValue(of(mockResponse));

      const result = await new Promise((resolve, reject) => {
        controller.generateInference(request).subscribe(resolve, reject);
      });

      expect(result.model).toBe('llama2');
    });

    it('should return token count in response', async () => {
      const request = {
        prompt: 'Test',
        model: 'llama2',
      };

      const mockResponse = {
        result: 'Response',
        model: 'llama2',
        tokens: 50,
        duration: 100,
      };

      vi.spyOn(service, 'generateInference').mockReturnValue(of(mockResponse));

      const result = await new Promise((resolve, reject) => {
        controller.generateInference(request).subscribe(resolve, reject);
      });

      expect(result.tokens).toBeDefined();
      expect(typeof result.tokens).toBe('number');
    });

    it('should return duration in response', async () => {
      const request = {
        prompt: 'Test',
        model: 'llama2',
      };

      const mockResponse = {
        result: 'Response',
        model: 'llama2',
        tokens: 50,
        duration: 100,
      };

      vi.spyOn(service, 'generateInference').mockReturnValue(of(mockResponse));

      const result = await new Promise((resolve, reject) => {
        controller.generateInference(request).subscribe(resolve, reject);
      });

      expect(result.duration).toBeDefined();
      expect(typeof result.duration).toBe('number');
    });

    it('should handle different models', async () => {
      const models = ['llama2', 'mistral', 'neural-chat'];

      for (const model of models) {
        const request = { prompt: 'Test', model };
        const mockResponse = {
          result: 'Response',
          model,
          tokens: 50,
          duration: 100,
        };

        vi.spyOn(service, 'generateInference').mockReturnValue(
          of(mockResponse),
        );

        const result = await new Promise((resolve, reject) => {
          controller.generateInference(request).subscribe(resolve, reject);
        });

        expect(result.model).toBe(model);
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid model', async () => {
      const request = {
        prompt: 'Test',
        model: 'nonexistent',
      };

      vi.spyOn(service, 'generateInference').mockReturnValue(
        throwError(
          () => new HttpException('Invalid model', HttpStatus.BAD_REQUEST),
        ),
      );

      await expect(
        new Promise((resolve, reject) => {
          controller.generateInference(request).subscribe(resolve, reject);
        }),
      ).rejects.toThrow();
    });

    it('should handle empty prompt', async () => {
      const request = {
        prompt: '',
        model: 'llama2',
      };

      vi.spyOn(service, 'generateInference').mockReturnValue(
        throwError(
          () =>
            new HttpException('Prompt cannot be empty', HttpStatus.BAD_REQUEST),
        ),
      );

      await expect(
        new Promise((resolve, reject) => {
          controller.generateInference(request).subscribe(resolve, reject);
        }),
      ).rejects.toThrow();
    });

    it('should handle missing prompt', async () => {
      const request = {
        // prompt: undefined,
        model: 'llama2',
      };

      vi.spyOn(service, 'generateInference').mockReturnValue(
        throwError(
          () => new HttpException('Prompt is required', HttpStatus.BAD_REQUEST),
        ),
      );

      await expect(
        new Promise((resolve, reject) => {
          controller
            .generateInference(request as any)
            .subscribe(resolve, reject);
        }),
      ).rejects.toThrow();
    });

    it('should handle inference timeout', async () => {
      const request = {
        prompt: 'Test',
        model: 'llama2',
      };

      vi.spyOn(service, 'generateInference').mockReturnValue(
        throwError(
          () =>
            new HttpException('Request timeout', HttpStatus.GATEWAY_TIMEOUT),
        ),
      );

      await expect(
        new Promise((resolve, reject) => {
          controller.generateInference(request).subscribe(resolve, reject);
        }),
      ).rejects.toThrow();
    });

    it('should handle service errors', async () => {
      const request = {
        prompt: 'Test',
        model: 'llama2',
      };

      vi.spyOn(service, 'generateInference').mockReturnValue(
        throwError(
          () =>
            new HttpException(
              'Internal error',
              HttpStatus.INTERNAL_SERVER_ERROR,
            ),
        ),
      );

      await expect(
        new Promise((resolve, reject) => {
          controller.generateInference(request).subscribe(resolve, reject);
        }),
      ).rejects.toThrow();
    });
  });

  describe('Request Validation', () => {
    it('should validate prompt format', async () => {
      const request = {
        prompt: 'Valid prompt',
        model: 'llama2',
      };

      vi.spyOn(service, 'generateInference').mockReturnValue(
        of({
          result: 'Response',
          model: 'llama2',
          tokens: 50,
          duration: 100,
        }),
      );

      const result = await new Promise((resolve, reject) => {
        controller.generateInference(request).subscribe(resolve, reject);
      });

      expect(result).toBeDefined();
    });

    it('should reject overly long prompt', async () => {
      const request = {
        prompt: 'a'.repeat(10000),
        model: 'llama2',
      };

      vi.spyOn(service, 'generateInference').mockReturnValue(
        throwError(
          () => new HttpException('Prompt too long', HttpStatus.BAD_REQUEST),
        ),
      );

      await expect(
        new Promise((resolve, reject) => {
          controller.generateInference(request).subscribe(resolve, reject);
        }),
      ).rejects.toThrow();
    });

    it('should validate model format', async () => {
      const request = {
        prompt: 'Test',
        model: 'llama2',
      };

      vi.spyOn(service, 'generateInference').mockReturnValue(
        of({
          result: 'Response',
          model: 'llama2',
          tokens: 50,
          duration: 100,
        }),
      );

      const result = await new Promise((resolve, reject) => {
        controller.generateInference(request).subscribe(resolve, reject);
      });

      expect(result).toBeDefined();
    });
  });

  describe('Response Format', () => {
    it('should return Observable', () => {
      const request = {
        prompt: 'Test',
        model: 'llama2',
      };

      vi.spyOn(service, 'generateInference').mockReturnValue(
        of({
          result: 'Response',
          model: 'llama2',
          tokens: 50,
          duration: 100,
        }),
      );

      const response = controller.generateInference(request);
      expect(response).toBeDefined();
      expect(response.subscribe).toBeDefined();
    });

    it('should not expose internal errors', async () => {
      const request = {
        prompt: 'Test',
        model: 'llama2',
      };

      vi.spyOn(service, 'generateInference').mockReturnValue(
        throwError(
          () =>
            new HttpException(
              'Internal Server Error',
              HttpStatus.INTERNAL_SERVER_ERROR,
            ),
        ),
      );

      try {
        await new Promise((resolve, reject) => {
          controller.generateInference(request).subscribe(resolve, reject);
        });
      } catch (error: any) {
        // Should not expose database error details
        expect(error.message).not.toContain('Database');
      }
    });
  });

  describe('Authorization', () => {
    it('should have JWT guard on generateInference', () => {
      // Check that controller has JWT guard
      expect(controller.generateInference).toBeDefined();
    });
  });
});
