import { ServicePorts, SERVICE_PORTS } from '@patriotchat/env/ports';

interface Environment {
  production: boolean;
  apiUrl: string;
  ports: ServicePorts;
}

export const environment: Environment = {
  production: false,
  apiUrl: 'http://localhost:3000',
  ports: SERVICE_PORTS,
};
