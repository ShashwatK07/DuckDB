import {
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { DatabaseService } from './database.service';
import * as path from 'path';
import * as iconv from 'iconv-lite';
import * as fs from 'fs/promises';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../user/schemas/user.schema';
import { Model } from 'mongoose';
import * as Papa from 'papaparse';

const logger = new Logger('DuckDBService');

@Injectable()
export class DuckDBService implements OnApplicationBootstrap {
  private db: any;
  private genAI: GoogleGenerativeAI;

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly databaseService: DatabaseService,
  ) {
    this.genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
  }

  async onApplicationBootstrap() {
    try {
      this.db = await this.databaseService.getDatabaseInstance();
      logger.log('Database connection established');
    } catch (error) {
      logger.error(`Error establishing database connection: ${error.message}`);
      throw new HttpException(
        'Database connection failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private async ensureDirectoryExists(directoryPath: string) {
    try {
      await fs.mkdir(directoryPath, { recursive: true });
      logger.log(`Directory ${directoryPath} exists or was created.`);
    } catch (error) {
      logger.error(
        `Error creating directory "${directoryPath}": ${error.message}`,
      );
      throw new Error(`Failed to create directory ${directoryPath}.`);
    }
  }

  async processAndSaveFile(file: Express.Multer.File, userId: string) {
    logger.log(`Started processing file: ${file.originalname}`);
    const fileName = file.originalname;
    const tableName = this.sanitizeTableName(fileName) + '_table_' + Date.now();
    logger.log(`Table name: ${tableName}`);

    if (!file || !file.path) {
      throw new Error('File or file path is undefined.');
    }

    const filePath = path.resolve(file.path);
    const convertedFilePath = path.join(
      'public/uploads',
      `utf8-${file.filename}`,
    );

    try {
      await this.ensureDirectoryExists('public/uploads');
      const content = await fs.readFile(filePath);
      const utf8Content = iconv.decode(content, 'ISO-8859-1');
      await fs.writeFile(convertedFilePath, utf8Content, 'utf8');
      logger.log('File successfully converted to UTF-8.');

      await this.db.run(`DROP TABLE IF EXISTS "${tableName}";`);
      await this.db.run(`
        CREATE TABLE "${tableName}" AS 
        SELECT * FROM read_csv_auto('${convertedFilePath}', HEADER=true);
      `);
      logger.debug(
        `Table "${tableName}" created and data inserted successfully.`,
      );
      const data = await this.db.run(`describe ${tableName}`);
      logger.log(await data.getRows());

      await this.userModel.findByIdAndUpdate(
        userId,
        { $push: { files: tableName } },
        { new: true },
      );
      logger.log(`Table "${tableName}" added to user "${userId}".`);

      const schema = await this.getTableSchema(tableName);
      await fs.unlink(filePath);
      await fs.unlink(convertedFilePath);

      logger.log(`File "${fileName}" processed and cleaned up successfully.`);

      return {
        message: `File ${fileName} uploaded and processed successfully.`,
        schema,
        tableName,
      };
    } catch (error) {
      logger.error(`Error processing file "${fileName}": ${error.message}`);
      throw new HttpException(
        'Failed to process the file.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private sanitizeTableName(fileName: string): string {
    return fileName
      .split('.')
      .slice(0, -1)
      .join('_')
      .replace(/[^a-zA-Z0-9_]/g, '');
  }

  private async getTableSchema(tableName: string) {
    try {
      const result = await this.db.run(`DESCRIBE "${tableName}"`);
      const rows = await result.getRows();
      return rows;
    } catch (error) {
      logger.error(
        `Error fetching schema for table "${tableName}": ${error.message}`,
      );
      throw error;
    }
  }

  async generateAndExecuteQuery(
    userId: string,
    text: string,
    tableNames: string[],
  ) {
    const tableSchemas = [];
    for (const tableName of tableNames) {
      try {
        const schema = await this.getTableSchema(tableName);
        tableSchemas.push({ tableName, schema });
      } catch (error) {
        logger.error(
          `Failed to fetch schema for table "${tableName}": ${error.message}`,
        );
      }
    }

    if (tableSchemas.length === 0) {
      throw new Error('Failed to retrieve schemas for all tables.');
    }

    const tableSchemasText = tableSchemas
      .map(
        ({ tableName, schema }) =>
          `Table: ${tableName}\nSchema:\n${schema
            .map((col) => `${col.name} (${col.type})`)
            .join('\n')}`,
      )
      .join('\n\n');

    const prompt = `
      You are a SQL generation expert.Only give sql query and nothing else.
      Generate an SQL query based on the following context:
      ${tableSchemasText}
  
      Query: ${text}
    `;

    let sqlQuery: string;
    try {
      const model = this.genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
      });
      const result = await model.generateContent([prompt]);
      sqlQuery = result.response.text();
      sqlQuery = sqlQuery.replace(/```/g, '').replace(/sql/g, '').trim();
      logger.log(`Generated SQL query: ${sqlQuery}`);
    } catch (error) {
      logger.error(`Error generating SQL query: ${error.message}`);
      throw new Error('Failed to generate SQL query');
    }

    try {
      const result = await this.db.run(sqlQuery);
      const rows = await result.getRows();
      const columns = await result.columnNames();
      const res = [columns, ...rows];
      const csv = Papa.unparse(res);

      logger.debug('CSV result:', res);
      return csv;
    } catch (error) {
      logger.error(`Error executing query: ${error.message}`);
      throw new Error('Failed to execute the SQL query');
    }
  }
}
