import '../config';

import Server from '@app/server';

console.log(process.env);

Server.run(parseInt(process.env.PORT, 10) || 3001);
