import 'dotenv/config';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

import { MongoDB } from '@app/database';

let mongoServer: MongoMemoryServer;

beforeEach(async () => {
  try {
    mongoServer = new MongoMemoryServer();
    const mongoUri = await mongoServer.getUri();
    const db = new MongoDB(mongoUri);
    await db.connect();
  } catch (err) {
    console.error('TEST: Mongodb connection error', err);
  }
});

afterEach(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});
