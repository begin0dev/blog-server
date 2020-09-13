import dotenv from 'dotenv';

// eslint-disable-next-line global-require
if (process.env.NODE_ENV === 'production') require('module-alias/register');

dotenv.config({ path: `./config/.env${process.env.NODE_ENV === 'test' ? '.test' : ''}` });

console.log(process.env)
