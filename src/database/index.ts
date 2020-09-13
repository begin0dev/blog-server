import mongoose from 'mongoose';

const { NODE_ENV } = process.env;

// mongoose setting
mongoose.set('debug', NODE_ENV === 'development');
mongoose.set('useCreateIndex', true);
mongoose.set('useFindAndModify', false);

export const connectDB = async (uri: string, options = {}) => {
  let retryCount = 0;

  const connect = () =>
    mongoose.connect(uri, {
      ...options,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

  try {
    await connect();
    mongoose.connection.on('error', (err) => {
      console.error('Mongodb connection error', err);
    });
    mongoose.connection.on('disconnected', () => {
      if (NODE_ENV === 'test') return;
      if (retryCount < 3) {
        console.error('The connection to the Mongodb has been lost. Retry the connection');
        connect();
        retryCount += 1;
      }
    });
    return mongoose;
  } catch (err) {
    console.error('Mongodb connection error', err);
    process.exit(1);
  }
};
