function startTrashCleanup({ config, documentFilesStorage, documentsRepository }) {
  function cleanupTrash() {
    const cutoff = new Date(Date.now() - config.trashRetentionDays * 86400000).toISOString();
    const rows = documentsRepository.findExpiredTrash(cutoff);
    for (const row of rows) {
      documentFilesStorage.deleteStoredFile(row.storage_path);
      documentsRepository.deleteById(row.id);
    }
    if (rows.length) {
      console.log(`Trash cleanup: removed ${rows.length} expired documents`);
    }
  }

  cleanupTrash();
  const timer = setInterval(cleanupTrash, 3600000);
  return () => clearInterval(timer);
}

module.exports = {
  startTrashCleanup,
};
