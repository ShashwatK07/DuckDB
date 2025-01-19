import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Logger,
  Param,
  Post,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { diskStorage } from 'multer';
import { DuckDBService } from './duckdb.service';
import * as fs from 'fs/promises';
import * as path from 'path';
import { AuthGuard } from './auth.guard';

const logger = new Logger('UploadController');

@Controller('chat')
export class DuckDBController {
  constructor(private duckdbService: DuckDBService) {}

  private async ensureUploadsDirectory() {
    const directoryPath = path.join(__dirname, '..', 'public', 'uploads');
    try {
      await fs.mkdir(directoryPath, { recursive: true });
      logger.log(`Directory "${directoryPath}" exists or was created.`);
    } catch (error) {
      logger.error(
        `Error creating directory "${directoryPath}": ${error.message}`,
      );
      throw new Error(`Failed to create directory ${directoryPath}.`);
    }
  }

  @Post('upload/:userId')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './public/uploads',
        filename: (req, file, cb) => {
          const fileName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '');
          cb(null, fileName);
        },
      }),
      limits: { fileSize: 50 * 1024 * 1024 },
      fileFilter: (req, file, cb) => {
        const allowedTypes = ['text/csv', 'application/json'];
        if (!allowedTypes.includes(file.mimetype)) {
          return cb(new Error('Unsupported file type.'), false);
        }
        cb(null, true);
      },
    }),
  )
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
    @Res() res: Response,
    @Param('userId') userId: string,
  ) {
    logger.log('Inside uploadFile');
    try {
      await this.ensureUploadsDirectory();

      if (!file) {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .json({ error: 'No file Uploaded' });
      }
      const result = await this.duckdbService.processAndSaveFile(file, userId);

      return res.status(HttpStatus.OK).json(result);
    } catch (error) {
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ error: error.message });
    }
  }

  @Post('/query/:userId')
  async generateAndExecuteQuery(
    @Param('userId') userId: string,
    @Body() body: { text: string; tables: string[] },
  ) {
    const { text, tables } = body;
    if (!text) {
      throw new HttpException('Query text is required', HttpStatus.BAD_REQUEST);
    }

    try {
      const result = await this.duckdbService.generateAndExecuteQuery(
        userId,
        text,
        tables,
      );
      return result;
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to generate and execute the query',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
