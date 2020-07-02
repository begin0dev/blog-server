require('dotenv').config({ path: './config/.env.test' });

const mongoose = require('mongoose');
const MongodbMemoryServer = require('mongodb-memory-server');

const connectDB = require('database');

let mongoServer;

beforeEach(async () => {
  try {
    mongoServer = new MongodbMemoryServer.MongoMemoryServer();
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
