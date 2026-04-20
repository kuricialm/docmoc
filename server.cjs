const { bootstrapRuntimeSecrets } = require('./server/bootstrap/runtimeSecrets.cjs');

bootstrapRuntimeSecrets(process.env);

const { startServer } = require('./server/bootstrap/startServer.cjs');
startServer();
