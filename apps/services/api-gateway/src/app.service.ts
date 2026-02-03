import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class AppService {
  async checkBackendServices(): Promise<boolean> {
    try {
      // Check auth service
      await axios.get('http://localhost:4001/health', { timeout: 2000 });
      return true;
    } catch (_error) {
      return false;
    }
  }
}
