const { startTrashCleanup } = require('./trashCleanup.cjs');

function startJobs(context) {
  const stops = [
    startTrashCleanup({
      config: context.config,
      documentFilesStorage: context.storage.documentFiles,
      documentsRepository: context.repositories.documents,
    }),
  ];

  return () => {
    for (const stop of stops) stop();
  };
}

module.exports = {
  startJobs,
};
