require('dotenv').config({ path: './.env.test' });

const mongoose = require('mongoose');
const MongodbMemoryServer = require('mongodb-memory-server');

let mongoServer;

beforeEach(async () => {
  mongoServer = new MongodbMemoryServer.MongoMemoryServer();
  const mongoUri = await mongoServer.getConnectionString();
  try {
    await mongoose.connect(mongoUri, { useNewUrlParser: true });
  } catch (err) {
    console.error('Mongodb connection error', err);
  }
});

afterEach(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});
