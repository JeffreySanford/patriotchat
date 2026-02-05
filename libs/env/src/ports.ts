export interface ServicePorts {
  auth: string;
  funding: string;
  policy: string;
  llm: string;
  analytics: string;
  postgres: string;
  ollama: string;
}

export const SERVICE_PORTS: ServicePorts = {
  auth: '4006',
  funding: '4002',
  policy: '4003',
  llm: '4004',
  analytics: '4005',
  postgres: '5432',
  ollama: '11434',
};
