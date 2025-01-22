import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Logger,
  Post,
  Req,
  Res,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { Request, Response } from 'express';
import { diskStorage } from 'multer';
import { DuckDBService } from './duckdb.service';
import * as fs from 'fs/promises';
import * as path from 'path';
import { AuthGuard } from './auth.guard';
import { Webhook } from 'svix';
import { requireAuth } from '@clerk/clerk-sdk-node';
import { getAuth } from '@clerk/express';

const logger = new Logger('UploadController');

@Controller('chat')
// @UseGuards(AuthGuard)
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

  @Post('upload')
  @UseInterceptors(
    FilesInterceptor('files', 10, {
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
  async uploadFiles(
    @UploadedFiles() files: Express.Multer.File[],
    @Req() req: Request,
    @Res() res: Response,
  ) {
    logger.log('Inside uploadFiles');
    try {
      await this.ensureUploadsDirectory();

      if (!files || files.length === 0) {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .json({ error: 'No files uploaded' });
      }

      const { userId } = getAuth(req);
      Logger.debug(userId);
      const results = await this.duckdbService.processAndSaveFiles(
        files,
        userId,
      );

      return res.status(HttpStatus.OK).json(results);
    } catch (error) {
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ error: error.message });
    }
  }

  @Post('query')
  async generateAndExecuteQuery(
    @Body() body: { text: string; tableNames: string[] },
    @Req() req: Request,
  ) {
    const { text, tableNames } = body;
    if (!text) {
      throw new HttpException('Query text is required', HttpStatus.BAD_REQUEST);
    }

    Logger.debug('Text:', text);
    Logger.debug('Table names:', tableNames);

    try {
      const result = await this.duckdbService.generateAndExecuteQuery(
        text,
        tableNames,
      );
      return result;
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to generate and execute the query',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('lama')
  async generateQuery(
    @Body() body: { text: string; tables: string[] },
    @Req() req: Request,
  ) {
    const { text, tables } = body;
    Logger.debug(text, tables);
    if (!text) {
      throw new HttpException('Query text is required', HttpStatus.BAD_REQUEST);
    }
    try {
      const result = await this.duckdbService.generate(text, tables);
      return result;
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to generate and execute the query',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
