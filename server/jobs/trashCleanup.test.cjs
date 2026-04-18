// @vitest-environment node
const { startTrashCleanup } = require('./trashCleanup.cjs');

describe('startTrashCleanup', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-18T12:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('uses the stored trash retention days when deleting expired documents', () => {
    const documentsRepository = {
      deleteById: vi.fn(),
      findExpiredTrash: vi.fn(() => [{ id: 'doc-1', storage_path: '/tmp/a.pdf' }]),
    };
    const documentFilesStorage = {
      deleteStoredFile: vi.fn(),
    };
    const settingsService = {
      getTrashRetentionDays: vi.fn(() => 14),
    };

    const stop = startTrashCleanup({
      documentFilesStorage,
      documentsRepository,
      settingsService,
    });

    expect(settingsService.getTrashRetentionDays).toHaveBeenCalled();
    expect(documentsRepository.findExpiredTrash).toHaveBeenCalledWith('2026-04-04T12:00:00.000Z');
    expect(documentFilesStorage.deleteStoredFile).toHaveBeenCalledWith('/tmp/a.pdf');
    expect(documentsRepository.deleteById).toHaveBeenCalledWith('doc-1');

    stop();
  });
});
