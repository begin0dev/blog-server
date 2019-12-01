const mongoose = require('mongoose');

const { NODE_ENV, MONGO_URI, MONGO_USER, MONGO_PWD } = process.env;

module.exports = () => {
  // mongoose setting
  mongoose.set('debug', NODE_ENV !== 'production');
  mongoose.set('useCreateIndex', true);
  mongoose.set('useFindAndModify', false);

  const connectMongoDB = url =>
    mongoose.connect(url, {
      user: MONGO_USER,
      pass: MONGO_PWD,
      dbName: 'beginner-blog',
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

  try {
    console.log('Mongodb connected');
    connectMongoDB(MONGO_URI);
    mongoose.connection.on('error', err => {
      console.error('Mongodb connection error', err);
    });
    mongoose.connection.on('disconnected', () => {
      console.error('The connection to the Mongodb has been lost. Retry the connection');
      connectMongoDB(MONGO_URI);
    });
  } catch (err) {
    console.error('Mongodb connection error', err);
  }
};
