import {
  AUTH_URL,
  FUNDING_URL,
  POLICY_URL,
  LLM_URL,
  ANALYTICS_URL,
} from '@patriotchat/env';

/**
 * Global Test Setup for E2E Tests
 * Checks service availability and logs diagnostics
 */

const SERVICE_URLS: Record<string, string> = {
  gateway: process.env.GATEWAY_URL || 'http://localhost:3000',
  auth: process.env.AUTH_URL || AUTH_URL,
  funding: process.env.FUNDING_URL || FUNDING_URL,
  policy: process.env.POLICY_URL || POLICY_URL,
  llm: process.env.LLM_URL || LLM_URL,
  analytics: process.env.ANALYTICS_URL || ANALYTICS_URL,
};

interface ServiceHealthStatus {
  service: string;
  url: string;
  healthy: boolean;
  latency?: number;
  error?: string;
}

/**
 * Check if a specific service is healthy
 */
async function checkServiceHealth(
  serviceName: keyof typeof SERVICE_URLS,
  retries = 6,
  retryDelayMs = 2000,
): Promise<ServiceHealthStatus> {
  const url = SERVICE_URLS[serviceName];
  const healthEndpoint = `${url}/${serviceName}/health`;
  const alternateEndpoint = `${url}/health`;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      const startTime = performance.now();

      try {
        let response = await fetch(healthEndpoint, {
          method: 'GET',
          signal: controller.signal,
        });

        // Try alternate health endpoint if primary fails
        if (!response.ok) {
          response = await fetch(alternateEndpoint, {
            method: 'GET',
            signal: controller.signal,
          });
        }

        clearTimeout(timeoutId);
        const latency = performance.now() - startTime;

        if (response.ok) {
          return {
            service: serviceName,
            url,
            healthy: true,
            latency,
          };
        }
      } finally {
        clearTimeout(timeoutId);
      }

      // Retry with delay if not healthy
      if (attempt < retries) {
        const delay = retryDelayMs * Math.pow(1.5, attempt - 1);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    } catch (error) {
      if (attempt === retries) {
        return {
          service: serviceName,
          url,
          healthy: false,
          error: (error as Error).message,
        };
      }

      // Retry with delay on error
      const delay = retryDelayMs * Math.pow(1.5, attempt - 1);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  return {
    service: serviceName,
    url,
    healthy: false,
    error: 'Max retries exceeded',
  };
}

/**
 * Check all services health
 */
async function checkAllServicesHealth(): Promise<ServiceHealthStatus[]> {
  const services: Array<keyof typeof SERVICE_URLS> = [
    'gateway',
    'auth',
    'funding',
    'policy',
    'llm',
    'analytics',
  ];

  const results = await Promise.all(
    services.map((service) => checkServiceHealth(service)),
  );

  return results;
}

async function globalSetup(): Promise<void> {
  console.log('\n=== E2E Test Suite Global Setup ===\n');
  console.log('Waiting for services to be ready... (this may take a moment)\n');

  // Check service health with retries
  const serviceHealth = await checkAllServicesHealth();

  console.log('Service Status:');
  serviceHealth.forEach((service) => {
    const status = service.healthy ? '✓ HEALTHY' : '✗ UNAVAILABLE';
    const latency = service.latency ? ` (${service.latency.toFixed(0)}ms)` : '';
    console.log(`  ${status}: ${service.service}${latency}`);

    if (service.error) {
      console.log(`         Error: ${service.error}`);
    }
  });

  const healthyCount = serviceHealth.filter((s) => s.healthy).length;
  const totalCount = serviceHealth.length;

  console.log(`\nOverall: ${healthyCount}/${totalCount} services healthy`);

  if (healthyCount < totalCount) {
    console.warn(
      '\n⚠️  WARNING: Not all services are responding.\n' +
        'Some tests may fail. To ensure all tests pass, make sure services are running:\n' +
        '\nStart services with:\n' +
        '  docker-compose up -d\n' +
        '\nOr run all services with:\n' +
        '  pnpm run start:all\n' +
        '\nService URLs:\n' +
        '  - API Gateway: http://localhost:3000\n' +
        '  - Auth Service: http://localhost:4001\n' +
        '  - Funding Service: http://localhost:4002\n' +
        '  - Policy Service: http://localhost:4003\n' +
        '  - LLM Service: http://localhost:4004\n' +
        '  - Analytics Service: http://localhost:4005\n',
    );
  } else {
    console.log('\n✓ All services are ready for testing\n');
  }

  console.log('=================================\n');
}

export default globalSetup;
