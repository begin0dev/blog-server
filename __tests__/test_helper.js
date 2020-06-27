require('dotenv').config({ path: './config/.env.test' });

const mongoose = require('mongoose');
const MongodbMemoryServer = require('mongodb-memory-server');

mongoose.set('useCreateIndex', true);
mongoose.set('useFindAndModify', false);

let mongoServer;

beforeEach(async () => {
  try {
    mongoServer = new MongodbMemoryServer.MongoMemoryServer();
    const mongoUri = await mongoServer.getUri();
    await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
  } catch (err) {
    console.error('Mongodb connection error', err);
  }
});

afterEach(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});
