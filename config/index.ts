import dotenv from 'dotenv';

dotenv.config({ path: `./config/.env${process.env.NODE_ENV === 'test' ? '.test' : ''}` });
