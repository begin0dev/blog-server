module.exports = {
  apps: [
    {
      name: 'node-server',
      script: 'app.js',
      ignore_watch: ['node_modules'],
      instances: 'max',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
