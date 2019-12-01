require('dotenv').config({ path: './.env.test' });

const mongoose = require('mongoose');
const MongodbMemoryServer = require('mongodb-memory-server');

mongoose.set('useCreateIndex', true);
mongoose.set('useFindAndModify', false);

let mongoServer;

beforeEach(async () => {
  try {
    mongoServer = new MongodbMemoryServer.MongoMemoryServer();
    const mongoUri = await mongoServer.getConnectionString();
    await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
  } catch (err) {
    console.error('Mongodb connection error', err);
  }
});

afterEach(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});
