/**
 * API Client for E2E Testing
 * Routes requests to correct microservices
 */

type JsonValue = string | number | boolean | null | JsonObject | JsonValue[];
interface JsonObject {
  [key: string]: JsonValue;
}

export interface ApiRequestOptions {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  endpoint: string;
  body?: JsonObject;
  token?: string;
  service?: 'gateway' | 'auth' | 'funding' | 'policy' | 'llm' | 'analytics';
}

export interface ApiResponse {
  status: number;
  ok: boolean;
  data: JsonObject | null;
  headers: Record<string, string>;
}

const SERVICE_URLS: Record<string, string> = {
  gateway: process.env.GATEWAY_URL || 'http://localhost:3000',
  auth: process.env.AUTH_URL || 'http://localhost:4001',
  funding: process.env.FUNDING_URL || 'http://localhost:4002',
  policy: process.env.POLICY_URL || 'http://localhost:4003',
  llm: process.env.LLM_URL || 'http://localhost:4004',
  analytics: process.env.ANALYTICS_URL || 'http://localhost:4005',
};

/**
 * Route request to appropriate service based on endpoint
 */
function getServiceUrl(endpoint: string, service?: string): string {
  if (service && SERVICE_URLS[service]) {
    return SERVICE_URLS[service];
  }

  // Auto-detect service from endpoint
  if (endpoint.includes('/auth')) return SERVICE_URLS.auth;
  if (endpoint.includes('/funding')) return SERVICE_URLS.funding;
  if (endpoint.includes('/policy')) return SERVICE_URLS.policy;
  if (endpoint.includes('/inference')) return SERVICE_URLS.llm;
  if (endpoint.includes('/analytics')) return SERVICE_URLS.analytics;

  return SERVICE_URLS.gateway;
}

/**
 * Make API request to appropriate service with retry logic
 */
export async function apiRequest(
  options: ApiRequestOptions,
  retries = 3,
): Promise<ApiResponse> {
  const { method, endpoint, body, token, service } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url: string = `${getServiceUrl(endpoint, service)}${endpoint}`;
  const fetchOptions: RequestInit = {
    method,
    headers,
    timeout: 5000, // 5 second timeout
  };

  if (body) {
    fetchOptions.body = JSON.stringify(body);
  }

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response: Response = await fetch(url, fetchOptions);
      let responseData: JsonObject | null = null;

      // Try to parse response as JSON if there's content
      if (
        response.ok &&
        response.headers.get('content-type')?.includes('application/json')
      ) {
        try {
          responseData = (await response.json()) as JsonObject;
        } catch {
          // Response was not valid JSON, continue without data
        }
      } else if (!response.ok) {
        // Try to get error message from response
        try {
          const contentType = response.headers.get('content-type');
          if (contentType?.includes('application/json')) {
            responseData = (await response.json()) as JsonObject;
          }
        } catch {
          // Error response was not valid JSON
        }
      }

      return {
        status: response.status,
        ok: response.ok,
        data: responseData,
        headers: Object.fromEntries(response.headers.entries()),
      };
    } catch (error) {
      // Network error or timeout - log for debugging but continue retry
      if (error instanceof Error) {
        void error.message; // Capture error info in case needed for logging
      }
      // Wait before retrying (exponential backoff)
      if (attempt < retries - 1) {
        await new Promise((resolve) =>
          setTimeout(resolve, Math.pow(2, attempt) * 100),
        );
      }
    }
  }

  // All retries failed
  return {
    status: 0,
    ok: false,
    data: null,
    headers: {},
  };
}

/**
 * Measure request latency
 */
export async function measureLatency(
  options: Omit<ApiRequestOptions, 'method'> & { method?: string },
): Promise<{ response: ApiResponse; latency: number }> {
  const startTime: number = performance.now();
  const response: ApiResponse = await apiRequest(options as ApiRequestOptions);
  const latency: number = performance.now() - startTime;

  return { response, latency };
}

/**
 * Helper: Register test user
 */
export async function registerTestUser(email: string, password: string) {
  const response: ApiResponse = await apiRequest({
    method: 'POST',
    endpoint: '/auth/register',
    service: 'auth',
    body: {
      username: email.split('@')[0] + '-' + Date.now(),
      email,
      password,
    },
  });

  const apiData: JsonObject | null = response.data;
  return {
    ok: response.ok,
    token: (apiData?.token || '') as string,
    userId: (apiData?.userId || '') as string,
  };
}

/**
 * Helper: Login user
 */
export async function loginUser(email: string, password: string) {
  const response: ApiResponse = await apiRequest({
    method: 'POST',
    endpoint: '/auth/login',
    service: 'auth',
    body: { email, password },
  });

  const apiData: JsonObject | null = response.data;
  return {
    ok: response.ok,
    token: (apiData?.token || '') as string,
    userId: (apiData?.userId || '') as string,
  };
}
