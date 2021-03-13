import mongoose, { Mongoose, ConnectionOptions } from 'mongoose';

const { NODE_ENV } = process.env;

export class MongoDB {
  private readonly uri: string;
  private readonly options: ConnectionOptions;
  private mongoose: Mongoose;
  private retryCount: number;

  constructor(uri: string, options?: ConnectionOptions) {
    this.retryCount = 0;

    this.uri = uri;
    this.options = {
      ...(options || {}),
      useNewUrlParser: true,
      useUnifiedTopology: true,
    };

    this.mongoose = mongoose;
    // mongoose setting
    this.mongoose.set('debug', NODE_ENV === 'development');
    this.mongoose.set('useCreateIndex', true);
    this.mongoose.set('useFindAndModify', false);

    if (NODE_ENV === 'test') return;
    this.mongoose.connection.on('error', (err) => {
      console.error('Mongodb connection error', err);
    });
    this.mongoose.connection.on('disconnected', async () => {
      if (this.retryCount > 3) {
        console.error('The connection to the Mongodb has been lost. Retry the count over');
        return;
      }
      console.error('The connection to the Mongodb has been lost. Retry the connection');
      this.retryCount += 1;
      await this.connect();
    });
  }

  connect = async () => {
    try {
      await this.mongoose.connect(this.uri, this.options);
      this.retryCount = 0;
    } catch (err) {
      console.error('Mongodb connection error', err);
      process.exit(1);
    }
  };
}
