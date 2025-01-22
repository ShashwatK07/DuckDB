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
import axios from 'axios';
import OpenAI from 'openai';

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

  async processAndSaveFiles(files: Express.Multer.File[], userId: string) {
    logger.log(`Started processing ${files.length} file(s).`);

    if (!files || files.length === 0) {
      throw new Error('No files provided for processing.');
    }

    const results = await Promise.all(
      files.map(async (file) => {
        const fileName = file.originalname;
        const tableName =
          this.sanitizeTableName(fileName) + '_table_' + Date.now();
        logger.log(`Processing file: ${fileName} | Table name: ${tableName}`);

        if (!file || !file.path) {
          throw new Error(`File or file path is undefined for: ${fileName}`);
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
          logger.log(`File successfully converted to UTF-8: ${fileName}`);

          await this.db.run(`DROP TABLE IF EXISTS "${tableName}";`);
          await this.db.run(`
            CREATE TABLE "${tableName}" AS 
            SELECT * FROM read_csv_auto('${convertedFilePath}', HEADER=true);
          `);
          logger.debug(
            `Table "${tableName}" created and data inserted successfully.`,
          );

          await this.userModel.findOneAndUpdate(
            { clerkId: userId },
            { $push: { files: tableName } },
            { new: true },
          );
          logger.log(`Table "${tableName}" added to user "${userId}".`);

          const schema = await this.getTableSchema(tableName);
          await fs.unlink(filePath);
          await fs.unlink(convertedFilePath);

          logger.log(
            `File "${fileName}" processed and cleaned up successfully.`,
          );

          return tableName;
        } catch (error) {
          logger.error(`Error processing file "${fileName}": ${error.message}`);
          throw new HttpException(
            `Failed to process the file: ${fileName}.`,
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }
      }),
    );

    return results;
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

  async generateAndExecuteQuery(text: string, tableNames: string[]) {
    Logger.debug('Table Names: ', tableNames);
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

    let sqlQuery: any;
    try {
      // // const model = this.genAI.getGenerativeModel({
      // //   model: 'gemini-1.5-flash',
      // // });
      // // const result = await model.generateContent([prompt]);
      // // sqlQuery = result.response.text();
      // sqlQuery = await axios.post(
      //   'http://localhost:3001/api/v0/chat/completions',
      //   {
      //     message: prompt,
      //   },
      // );
      // // sqlQuery = sqlQuery.replace(/```/g, '').replace(/sql/g, '').trim();

      const openai = new OpenAI({
        baseURL: 'http://192.168.1.35:1234/v1',
        apiKey: 'lm-studio',
      });

      const completion = await openai.chat.completions.create({
        model: 'llama-3.2-1b-instruct',
        messages: [
          {
            role: 'system',
            content:
              'You are a SQL generation expert.Only give sql query and nothing else.',
          },
          {
            role: 'user',
            content: `${prompt}`,
          },
        ],
      });

      sqlQuery = completion.choices[0].message.content.trim();

      logger.log(
        `Generated SQL query: ${completion.choices[0].message.content.trim()}`,
      );
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

  async generate(text: string, tableNames: string[]) {
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

    let sqlQuery: any;
    try {
      sqlQuery = await axios.post(
        'http://localhost:3001/api/v0/chat/completions',
        {
          message: prompt,
        },
      );
      logger.log(`Generated SQL query: ${sqlQuery.data}`);
      return sqlQuery.data;
    } catch (error) {
      logger.error(`Error generating SQL query: ${error.message}`);
      throw new Error('Failed to generate SQL query');
    }
  }
}
