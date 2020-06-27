const mongoose = require('mongoose');

const { NODE_ENV, MONGO_URI, MONGO_DB_NAME, MONGO_USER, MONGO_PWD } = process.env;

module.exports = () => {
  // mongoose setting
  mongoose.set('debug', NODE_ENV !== 'production');
  mongoose.set('useCreateIndex', true);
  mongoose.set('useFindAndModify', false);

  const connectMongoDB = () =>
    mongoose.connect(MONGO_URI, {
      user: MONGO_USER,
      pass: MONGO_PWD,
      dbName: MONGO_DB_NAME,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

  try {
    console.log('Mongodb connected');
    connectMongoDB();
    mongoose.connection.on('error', (err) => {
      console.error('Mongodb connection error', err);
    });
    mongoose.connection.on('disconnected', () => {
      console.error('The connection to the Mongodb has been lost. Retry the connection');
      connectMongoDB();
    });
  } catch (err) {
    console.error('Mongodb connection error', err);
  }
};
