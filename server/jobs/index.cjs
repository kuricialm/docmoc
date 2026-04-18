const { startTrashCleanup } = require('./trashCleanup.cjs');

function startJobs(context) {
  const stops = [
    startTrashCleanup({
      documentFilesStorage: context.storage.documentFiles,
      documentsRepository: context.repositories.documents,
      settingsService: context.services.settings,
    }),
  ];

  return () => {
    for (const stop of stops) stop();
  };
}

module.exports = {
  startJobs,
};
