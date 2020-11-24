import 'newrelic';
import 'dotenv/config';
import 'module-alias/register';

import Server from '@app/server';

Server.run(parseInt(process.env.PORT, 10) || 3001);
