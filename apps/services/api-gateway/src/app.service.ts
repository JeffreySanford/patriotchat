import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class AppService {
  async checkBackendServices(): Promise<boolean> {
    try {
      // Check auth service
      await axios.get('http://patriotchat-auth:4001/health', { timeout: 2000 });
      return true;
    } catch (error) {
      return false;
    }
  }
}
