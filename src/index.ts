import '../config';

import Server from '@app/server';

Server.run(parseInt(process.env.PORT, 10) || 3001);
