import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CompressionService } from './compression/compression.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, CompressionService],
})
export class AppModule {
  public async compressPDF(path: string) {
    return;
  }
}
