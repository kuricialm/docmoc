const { createApp } = require('../app/createApp.cjs');
const { createContext } = require('./createContext.cjs');
const { startJobs } = require('../jobs/index.cjs');

function startServer(env = process.env) {
  const context = createContext(env);
  const app = createApp(context);
  const stopJobs = startJobs(context);

  const server = app.listen(context.config.port, () => {
    console.log(`Docmoc server running on port ${context.config.port}`);
    console.log(`Data directory: ${context.config.dataDir}`);
  });

  return { app, context, server, stopJobs };
}

module.exports = {
  startServer,
};
