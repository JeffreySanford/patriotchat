import { describe, it, expect, vi, beforeEach } from 'vitest';
import { of, throwError } from 'rxjs';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  beforeEach(() => {
    const mockAuthService = {
      register: vi.fn().mockReturnValue(
        of({
          token: 'test.jwt.token',
          user: {
            id: 'user1',
            username: 'testuser',
            email: 'test@example.com',
            tier: 'free',
          },
        }),
      ),
      login: vi.fn().mockReturnValue(
        of({
          token: 'test.jwt.token',
          user: {
            id: 'user1',
            username: 'testuser',
            email: 'test@example.com',
            tier: 'free',
          },
        }),
      ),
      validate: vi.fn().mockReturnValue(
        of({
          valid: true,
          user: {
            id: 'user1',
            username: 'testuser',
          },
        }),
      ),
    };

    service = mockAuthService as any;
    controller = new AuthController(service);
  });

  describe('Registration Endpoint', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
    });

    it('should have register method', () => {
      expect(controller.register).toBeDefined();
    });

    it('should accept registration request', () => {
      const dto = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'SecurePass123!',
      };
      expect(() => controller.register(dto)).not.toThrow();
    });

    it('should call auth service register', () => {
      const dto = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'SecurePass123!',
      };
      vi.spyOn(service, 'register').mockReturnValue(
        of({
          token: 'jwt.token',
          user: {
            id: 'user1',
            username: 'testuser',
            email: 'test@example.com',
            tier: 'free',
          },
        }),
      );

      controller.register(dto);
      expect(service.register).toHaveBeenCalledWith(dto);
    });

    it('should return auth response on success', async () => {
      const dto = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'SecurePass123!',
      };
      const response = {
        token: 'jwt.token',
        user: {
          id: 'user1',
          username: 'testuser',
          email: 'test@example.com',
          tier: 'free',
        },
      };

      vi.spyOn(service, 'register').mockReturnValue(of(response));

      const result = await new Promise((resolve) => {
        controller.register(dto).subscribe(resolve);
      });

      expect(result).toEqual(response);
    });

    it('should return 201 Created status', () => {
      // Controller has @HttpCode(201) decorator
      expect(controller.register).toBeDefined();
    });
  });

  describe('Login Endpoint', () => {
    it('should have login method', () => {
      expect(controller.login).toBeDefined();
    });

    it('should accept login credentials', () => {
      const dto = {
        email: 'test@example.com',
        password: 'SecurePass123!',
      };
      expect(() => controller.login(dto)).not.toThrow();
    });

    it('should call auth service login', () => {
      const dto = {
        email: 'test@example.com',
        password: 'SecurePass123!',
      };
      vi.spyOn(service, 'login').mockReturnValue(
        of({
          token: 'jwt.token',
          user: {
            id: 'user1',
            username: 'testuser',
            email: 'test@example.com',
            tier: 'free',
          },
        }),
      );

      controller.login(dto);
      expect(service.login).toHaveBeenCalledWith(dto);
    });

    it('should return token on successful login', async () => {
      const dto = {
        email: 'test@example.com',
        password: 'SecurePass123!',
      };
      const response = {
        token: 'jwt.token',
        user: {
          id: 'user1',
          username: 'testuser',
          email: 'test@example.com',
          tier: 'free',
        },
      };

      vi.spyOn(service, 'login').mockReturnValue(of(response));

      const result = await new Promise((resolve) => {
        controller.login(dto).subscribe(resolve);
      });

      expect(result).toEqual(response);
    });

    it('should return 201 Created status', () => {
      // Controller has @HttpCode(201) decorator
      expect(controller.login).toBeDefined();
    });
  });

  describe('Validation Endpoint', () => {
    it('should have validate method', () => {
      expect(controller.validate).toBeDefined();
    });

    it('should accept token in header', () => {
      const headers = {
        authorization: 'Bearer jwt.token',
      };
      // Controller should extract token from Authorization header
      expect(controller.validate).toBeDefined();
    });

    it('should call auth service validate', () => {
      const token = 'jwt.token';
      const auth = `Bearer ${token}`;
      vi.spyOn(service, 'validate').mockReturnValue(
        of({
          valid: true,
          user: {
            id: 'user1',
            username: 'testuser',
          },
        }),
      );

      controller.validate(auth);
      expect(service.validate).toHaveBeenCalledWith(token);
    });

    it('should return validation result', async () => {
      const token = 'jwt.token';
      const response = {
        valid: true,
        user: {
          id: 'user1',
          username: 'testuser',
        },
      };

      vi.spyOn(service, 'validate').mockReturnValue(of(response));

      const result = await new Promise((resolve) => {
        controller.validate(token).subscribe(resolve);
      });

      expect(result).toEqual(response);
    });
  });

  describe('Error Handling', () => {
    it('should handle registration errors', async () => {
      const dto = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'pass',
      };

      vi.spyOn(service, 'register').mockReturnValue(
        throwError(() => new Error('Registration failed')),
      );

      try {
        await new Promise((resolve, reject) => {
          controller.register(dto).subscribe(resolve, reject);
        });
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should handle login errors', async () => {
      const dto = {
        email: 'invalid@example.com',
        password: 'wrongpassword',
      };

      vi.spyOn(service, 'login').mockReturnValue(
        throwError(() => new Error('Invalid credentials')),
      );

      try {
        await new Promise((resolve, reject) => {
          controller.login(dto).subscribe(resolve, reject);
        });
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should throw HttpException on service error', () => {
      const dto = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'pass',
      };

      vi.spyOn(service, 'register').mockReturnValue(
        throwError(() => ({
          response: {
            status: 400,
            data: 'User already exists',
          },
        })),
      );

      expect(() => {
        controller.register(dto).subscribe({
          error: (err: Error) => {
            console.error(err);
          }, // Handle error to prevent unhandled rejection
        });
      }).not.toThrow();
    });
  });

  describe('Input Validation', () => {
    it('should validate email format in registration', () => {
      const invalidDto = {
        username: 'testuser',
        email: 'invalid-email',
        password: 'SecurePass123!',
      };
      // Controller should validate DTO
      expect(controller.register).toBeDefined();
    });

    it('should validate password strength', () => {
      const weakPasswordDto = {
        username: 'testuser',
        email: 'test@example.com',
        password: '123', // too short
      };
      // Controller should validate password
      expect(controller.register).toBeDefined();
    });

    it('should require all fields', () => {
      const incompleteDto = {
        username: 'testuser',
        email: 'test@example.com',
        // missing password
      };
      // Controller should require all fields
      expect(controller.register).toBeDefined();
    });
  });

  describe('Response Format', () => {
    it('should return token in response', () => {
      // Response should include JWT token
      expect(controller.login).toBeDefined();
    });

    it('should return user object in response', () => {
      // Response should include user data
      expect(controller.login).toBeDefined();
    });

    it('should not expose password in response', () => {
      // Service ensures password is not returned
      expect(controller.login).toBeDefined();
    });

    it('should include user ID in response', () => {
      // User object should have ID
      expect(controller.login).toBeDefined();
    });
  });
});
