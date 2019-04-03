process.env.NODE_ENV = 'development';
process.env.NODE_PATH = 'src';

const nodemon = require('nodemon');

nodemon('--watch ./src ./src/app')
  .on('start', () => { console.log('[nodemon] App has started'); })
  .on('quit', () => { console.log('[nodemon] App has quit'); })
  .on('restart', (files) => { console.log('[nodemon] App restarted due to:', files); });
