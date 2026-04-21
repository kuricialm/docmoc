import { render, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, beforeAll, afterAll } from 'vitest';
import DocumentThumbnail from './DocumentThumbnail';

const {
  getDocumentBlobMock,
  getDocumentMock,
  workerOptions,
} = vi.hoisted(() => {
  const workerOptions = { workerSrc: '' };
  const renderMock = vi.fn(() => ({ promise: Promise.resolve() }));
  const getViewportMock = vi.fn(({ scale }: { scale: number }) => ({
    width: 200 * scale,
    height: 280 * scale,
  }));
  const getPageMock = vi.fn(async () => ({
    getViewport: getViewportMock,
    render: renderMock,
  }));
  const destroyMock = vi.fn();
  const getDocumentMock = vi.fn(() => ({
    promise: Promise.resolve({
      getPage: getPageMock,
      destroy: destroyMock,
    }),
  }));
  const getDocumentBlobMock = vi.fn();

  return {
    getDocumentBlobMock,
    getDocumentMock,
    workerOptions,
  };
});

vi.mock('@/lib/api', () => ({
  getDocumentBlob: getDocumentBlobMock,
}));

vi.mock('pdfjs-dist/legacy/build/pdf.mjs', () => ({
  GlobalWorkerOptions: workerOptions,
  getDocument: getDocumentMock,
}));

vi.mock('pdfjs-dist/legacy/build/pdf.worker.min.mjs?url', () => ({
  default: '/assets/pdf.worker.min.mjs',
}));

describe('DocumentThumbnail', () => {
  const originalGetContext = HTMLCanvasElement.prototype.getContext;
  const originalToDataURL = HTMLCanvasElement.prototype.toDataURL;

  beforeAll(() => {
    HTMLCanvasElement.prototype.getContext = vi.fn(() => ({} as CanvasRenderingContext2D));
    HTMLCanvasElement.prototype.toDataURL = vi.fn(() => 'data:image/jpeg;base64,thumb');
  });

  afterAll(() => {
    HTMLCanvasElement.prototype.getContext = originalGetContext;
    HTMLCanvasElement.prototype.toDataURL = originalToDataURL;
  });

  beforeEach(() => {
    vi.clearAllMocks();
    workerOptions.workerSrc = '';
    getDocumentBlobMock.mockResolvedValue({
      arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(8)),
    } as unknown as Blob);
  });

  it('renders a PDF thumbnail with the bundled worker', async () => {
    const { container } = render(
      <div className="h-40 w-40">
        <DocumentThumbnail docId="pdf-doc" fileType="application/pdf" enabled />
      </div>,
    );

    await waitFor(() => {
      expect(getDocumentBlobMock).toHaveBeenCalledWith('pdf-doc');
      expect(getDocumentMock).toHaveBeenCalled();
      expect(workerOptions.workerSrc).toBe('/assets/pdf.worker.min.mjs');
      expect(container.querySelector('img')).toHaveAttribute('src', 'data:image/jpeg;base64,thumb');
    });
  });
});
