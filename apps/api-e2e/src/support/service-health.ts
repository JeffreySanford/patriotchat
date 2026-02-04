/**
 * Service Health Check Utilities
 * Used to determine if services are available before running integration tests
 */

const SERVICE_URLS: Record<string, string> = {
  gateway: process.env.GATEWAY_URL || 'http://localhost:3000',
  auth: process.env.AUTH_URL || 'http://localhost:4001',
  funding: process.env.FUNDING_URL || 'http://localhost:4002',
  policy: process.env.POLICY_URL || 'http://localhost:4003',
  llm: process.env.LLM_URL || 'http://localhost:4004',
  analytics: process.env.ANALYTICS_URL || 'http://localhost:4005',
};

export interface ServiceHealthStatus {
  service: string;
  url: string;
  healthy: boolean;
  latency?: number;
  error?: string;
}

/**
 * Check if a specific service is healthy
 */
export async function checkServiceHealth(
  serviceName: keyof typeof SERVICE_URLS,
): Promise<ServiceHealthStatus> {
  const url = SERVICE_URLS[serviceName];
  const healthEndpoint = `${url}/${serviceName}/health`;

  const startTime = performance.now();

  try {
    const response = await fetch(healthEndpoint, {
      method: 'GET',
      timeout: 3000,
    });

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
export async function checkAllServicesHealth(): Promise<ServiceHealthStatus[]> {
  const services: Array<keyof typeof SERVICE_URLS> = [
    'gateway',
    'auth',
    'funding',
    'policy',
    'llm',
    'analytics',
  ];

  const results = await Promise.all(
    services.map(service => checkServiceHealth(service)),
  );

  return results;
}

/**
 * Check if all required services are healthy
 */
export async function areRequiredServicesHealthy(
  requiredServices: Array<keyof typeof SERVICE_URLS> = ['auth', 'gateway'],
): Promise<boolean> {
  const results = await Promise.all(
    requiredServices.map(service => checkServiceHealth(service)),
  );

  return results.every(result => result.healthy);
}

/**
 * Get a human-readable summary of service health
 */
export async function getServiceHealthSummary(): Promise<string> {
  const results = await checkAllServicesHealth();

  const healthy = results.filter(r => r.healthy).length;
  const total = results.length;

  let summary = `Service Health: ${healthy}/${total} services healthy\n`;

  results.forEach(result => {
    const status = result.healthy ? '✓' : '✗';
    const latency = result.latency ? ` (${result.latency.toFixed(0)}ms)` : '';
    const error = result.error ? ` - ${result.error}` : '';
    summary += `  ${status} ${result.service}${latency}${error}\n`;
  });

  return summary;
}
