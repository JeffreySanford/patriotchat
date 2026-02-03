/**
 * Test Data Generators
 */

export interface TestUser {
  username: string;
  email: string;
  password: string;
}

export interface TestQuery {
  text: string;
  model: 'llama2' | 'mistral' | 'neural-chat';
}

let userCounter: number = 0;
let queryCounter: number = 0;

/**
 * Generate unique test user
 */
export function generateTestUser(): TestUser {
  userCounter++;
  const timestamp: number = Date.now();

  return {
    username: `testuser_${timestamp}_${userCounter}`,
    email: `testuser_${timestamp}_${userCounter}@test.patriotchat.com`,
    password: `TestPassword${timestamp}${userCounter}!`,
  };
}

/**
 * Generate test queries
 */
export function generateTestQuery(
  model?: 'llama2' | 'mistral' | 'neural-chat',
): TestQuery {
  queryCounter++;
  const models: Array<'llama2' | 'mistral' | 'neural-chat'> = [
    'llama2',
    'mistral',
    'neural-chat',
  ];
  const queries: string[] = [
    'What is the capital of France?',
    'Explain quantum computing',
    'Write a short poem about AI',
    'What are the benefits of open source software?',
    'How does machine learning work?',
  ];

  return {
    text: queries[queryCounter % queries.length],
    model: model || models[queryCounter % models.length],
  };
}

/**
 * Test data constants
 */
interface TestDataConfig {
  VALID_EMAIL: string;
  INVALID_EMAIL: string;
  VALID_PASSWORD: string;
  WEAK_PASSWORD: string;
  COMMON_PASSWORDS: string[];
  PERFORMANCE_THRESHOLD_MS: number;
  MEASUREMENT_TIMEOUT_MS: number;
  RATE_LIMIT_TEST_REQUESTS: number;
  RATE_LIMIT_WINDOW_MS: number;
  CONCURRENT_REQUEST_COUNT: number;
  AVAILABLE_MODELS: string[];
  MODEL_TIMEOUT_MS: number;
}

export const TEST_DATA: TestDataConfig = {
  VALID_EMAIL: 'test@patriotchat.com',
  INVALID_EMAIL: 'not-an-email',
  VALID_PASSWORD: 'TestPassword123!',
  WEAK_PASSWORD: '123',
  COMMON_PASSWORDS: ['password', '123456', 'admin', 'letmein'],

  // Service timeouts
  PERFORMANCE_THRESHOLD_MS: 100,
  MEASUREMENT_TIMEOUT_MS: 30000,

  // Rate limiting test data
  RATE_LIMIT_TEST_REQUESTS: 10,
  RATE_LIMIT_WINDOW_MS: 60000,

  // Database test data
  CONCURRENT_REQUEST_COUNT: 10,

  // LLM test data
  AVAILABLE_MODELS: ['llama2', 'mistral', 'neural-chat'],
  MODEL_TIMEOUT_MS: 5000,
};
