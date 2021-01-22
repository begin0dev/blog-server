import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

import { connectDB } from '@app/database';

let mongoServer: MongoMemoryServer;

beforeEach(async () => {
  try {
    mongoServer = new MongoMemoryServer();
    const mongoUri = await mongoServer.getUri();
    await connectDB(mongoUri);
  } catch (err) {
    console.error('Mongodb connection error', err);
  }
});

afterEach(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});
