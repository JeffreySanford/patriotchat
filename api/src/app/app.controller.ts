import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiStatusResponse, AppService, QueryResult } from './app.service';

class QueryDto {
  prompt!: string;
}

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getData() {
    return this.appService.getData();
  }

  @Get('status')
  getStatus(): ApiStatusResponse {
    return this.appService.getStatus();
  }

  @Post('query')
  async runQuery(@Body() { prompt }: QueryDto): Promise<QueryResult> {
    return this.appService.executeQuery(prompt);
  }
}
