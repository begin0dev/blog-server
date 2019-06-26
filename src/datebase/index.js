const mongoose = require('mongoose');

const { NODE_ENV, MONGO_URI, MONGO_USER, MONGO_PWD } = process.env;

module.exports = () => {
  const connectMongoDB = () => {
    // mongoose setting
    mongoose.set('debug', NODE_ENV !== 'production');
    mongoose.set('useCreateIndex', true);

    console.log('Mongodb connected');
    return mongoose.connect(MONGO_URI, {
      user: MONGO_USER,
      pass: MONGO_PWD,
      dbName: 'beginner-blog',
      useNewUrlParser: true,
    });
  };

  try {
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
