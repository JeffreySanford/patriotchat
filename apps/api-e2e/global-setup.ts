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
): Promise<ServiceHealthStatus> {
  const url = SERVICE_URLS[serviceName];
  const healthEndpoint = `${url}/${serviceName}/health`;

  const startTime = performance.now();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const response = await fetch(healthEndpoint, {
      method: 'GET',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const latency = performance.now() - startTime;

    return {
      service: serviceName,
      url,
      healthy: response.ok,
      latency,
    };
  } catch (error) {
    return {
      service: serviceName,
      url,
      healthy: false,
      error: (error as Error).message,
    };
  }
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

  // Check service health
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

  if (healthyCount === 0) {
    console.warn(
      '\n⚠️  WARNING: No services are responding. E2E tests will likely fail.\n' +
        'To run E2E tests, ensure services are running:\n' +
        '  - API Gateway: localhost:3000\n' +
        `  - Auth Service: ${process.env.AUTH_URL || `http://localhost:${process.env.AUTH_PORT || '4001'}`}\n` +
        `  - Funding Service: ${process.env.FUNDING_URL || `http://localhost:${process.env.FUNDING_PORT || '4002'}`}\n` +
        `  - Policy Service: ${process.env.POLICY_URL || `http://localhost:${process.env.POLICY_PORT || '4003'}`}\n` +
        `  - LLM Service: ${process.env.LLM_URL || `http://localhost:${process.env.LLM_PORT || '4004'}`}\n` +
        `  - Analytics Service: ${process.env.ANALYTICS_URL || `http://localhost:${process.env.ANALYTICS_PORT || '4005'}`}\n` +
        '\nYou can start services with: docker-compose up -d\n',
    );
  } else {
    console.log('\n✓ Service infrastructure is ready for testing\n');
  }

  console.log('=================================\n');
}

export default globalSetup;
