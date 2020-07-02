const mongoose = require('mongoose');

const { NODE_ENV } = process.env;

// mongoose setting
mongoose.set('debug', NODE_ENV === 'development');
mongoose.set('useCreateIndex', true);
mongoose.set('useFindAndModify', false);

module.exports = async (uri, options) => {
  const connect = () =>
    mongoose.connect(uri, {
      ...options,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

  try {
    console.log('Mongodb connected');
    await connect();
    mongoose.connection.on('error', (err) => {
      console.error('Mongodb connection error', err);
    });
    mongoose.connection.on('disconnected', () => {
      if (NODE_ENV === 'test') return;
      console.error('The connection to the Mongodb has been lost. Retry the connection');
      connect();
    });
    return mongoose;
  } catch (err) {
    console.error('Mongodb connection error', err);
  }
};
