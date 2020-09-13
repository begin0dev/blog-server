import 'module-alias/register';
import dotenv from 'dotenv';

import Server from '@app/server';

dotenv.config({ path: `./config/.env${process.env.NODE_ENV === 'test' ? '.test' : ''}` });

Server.run(parseInt(process.env.PORT, 10) || 3001);
