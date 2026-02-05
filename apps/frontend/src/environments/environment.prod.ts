import { ServicePorts, SERVICE_PORTS } from '@patriotchat/env/ports';

interface Environment {
  production: boolean;
  apiUrl: string;
  ports: ServicePorts;
}

export const environment: Environment = {
  production: true,
  apiUrl: 'https://api.patriotchat.com',
  ports: SERVICE_PORTS,
};
