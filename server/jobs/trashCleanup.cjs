function startTrashCleanup({ documentFilesStorage, documentsRepository, settingsService }) {
  function cleanupTrash() {
    const cutoff = new Date(Date.now() - settingsService.getTrashRetentionDays() * 86400000).toISOString();
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
