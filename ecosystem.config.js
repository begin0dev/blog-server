module.exports = {
  apps: [
    {
      name: 'node-server',
      script: 'src/app.js',
      ignore_watch: ['node_modules'],
      instances: 'max',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
