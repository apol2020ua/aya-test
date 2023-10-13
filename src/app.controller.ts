import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('import')
  importDatabase() {
    return this.appService.importDatabase();
  }

  @Get('one-time-reward')
  oneTimeReward() {
    return this.appService.oneTimeReward();
  }
}
