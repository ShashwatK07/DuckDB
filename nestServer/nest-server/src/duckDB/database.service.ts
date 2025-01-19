import { Injectable, Logger } from '@nestjs/common';
import { DuckDBInstance } from '@duckdb/node-api';
import * as path from 'path';

@Injectable()
export class DatabaseService {
  async createDBInstance() {
    try {
      const db = await DuckDBInstance.create('superDuckdb.db');
      const connection = await db.connect();
      Logger.log(connection, 'database service');
      return connection;
    } catch (error) {
      Logger.error('Error initializing DuckDB:', error);
    }
  }

  getDatabaseInstance() {
    return this.createDBInstance();
  }
}
