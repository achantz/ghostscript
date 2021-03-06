import {
  Body,
  Controller,
  Get,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { diskStorage, Multer } from 'multer';
import { extname } from 'path';

import { AppService } from './app.service';
import { CompressionService } from './compression/compression.service';

export const editFileName = (req, file: Express.Multer.File, callback) => {
  const fileExtName = extname(file.originalname);
  const randomName = Array(4)
    .fill(null)
    .map(() => Math.round(Math.random() * 16).toString(16))
    .join('');
  callback(null, `${randomName}${fileExtName}`);
};

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly compressionService: CompressionService
  ) {}

  @Get()
  getData() {
    return this.appService.getData();
  }

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './files',
        filename: editFileName,
      }),
    })
  )
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('compress') compress: 'false' | 'true' = 'false',
    @Body('stampFirstPageOnly') stampFirstPageOnly: 'false' | 'true' = 'true'
  ) {
    const compression = JSON.parse(compress);
    const firstPageOnly = JSON.parse(stampFirstPageOnly);
    console.log(file);
    console.log(`Compression: ${compression}`);
    console.log(`Stamp First Page Only: ${firstPageOnly}`);
    console.time('Document Processing');

    if (compression) {
      await this.compressionService.compressFile(file.path);
    }
    await this.compressionService.stampFile(
      file.path,
      compression,
      firstPageOnly
    );

    console.timeEnd('Document Processing');
  }
}
