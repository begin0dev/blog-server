import 'module-alias/register';
import dotenv from 'dotenv';

import Server from '@app/server';

dotenv.config();

Server.run(parseInt(process.env.PORT, 10) || 3001);
