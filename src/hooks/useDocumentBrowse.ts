import { useEffect, useMemo, useState } from 'react';
import type { Document } from '@/hooks/useDocuments';

export const DOCUMENTS_PER_PAGE = 20;

export type DateFilter = 'all' | '7' | '30' | '90';
export type SortBy = 'created_desc' | 'created_asc' | 'updated_desc' | 'updated_asc';

type Options = {
  lockedTagId?: string;
  defaultSortBy?: SortBy;
  dateField?: 'created_at' | 'updated_at';
};

export function useDocumentBrowse(documents: Document[], search: string, options?: Options) {
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [sortBy, setSortBy] = useState<SortBy>(options?.defaultSortBy ?? 'created_desc');
  const [fileTypeFilter, setFileTypeFilter] = useState('all');
  const [tagFilter, setTagFilter] = useState(options?.lockedTagId ?? 'all');
  const [page, setPage] = useState(1);
  const dateField = options?.dateField ?? 'created_at';

  useEffect(() => {
    if (options?.lockedTagId) {
      setTagFilter(options.lockedTagId);
    }
  }, [options?.lockedTagId]);

  const availableFileTypes = useMemo(
    () => Array.from(new Set(documents.map((doc) => doc.file_type))).sort(),
    [documents]
  );

  const filteredDocuments = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    const now = Date.now();

    return documents.filter((doc) => {
      if (normalizedSearch && !doc.name.toLowerCase().includes(normalizedSearch)) return false;

      if (fileTypeFilter !== 'all' && doc.file_type !== fileTypeFilter) return false;

      if (tagFilter !== 'all' && !doc.tags?.some((tag) => tag.id === tagFilter)) return false;

      if (dateFilter !== 'all') {
        const days = Number(dateFilter);
        if (Number.isFinite(days)) {
          const dateTimestamp = new Date(doc[dateField]).getTime();
          const daysMs = days * 24 * 60 * 60 * 1000;
          if (now - dateTimestamp > daysMs) return false;
        }
      }

      return true;
    });
  }, [documents, search, fileTypeFilter, tagFilter, dateFilter, dateField]);

  useEffect(() => {
    setPage(1);
  }, [search, dateFilter, fileTypeFilter, tagFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredDocuments.length / DOCUMENTS_PER_PAGE));

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const sortedDocuments = useMemo(() => {
    const docs = [...filteredDocuments];
    const byDate = (field: 'created_at' | 'updated_at', direction: 'asc' | 'desc') => {
      docs.sort((a, b) => {
        const aTs = new Date(a[field]).getTime();
        const bTs = new Date(b[field]).getTime();
        return direction === 'desc' ? bTs - aTs : aTs - bTs;
      });
    };

    if (sortBy === 'created_desc') byDate('created_at', 'desc');
    if (sortBy === 'created_asc') byDate('created_at', 'asc');
    if (sortBy === 'updated_desc') byDate('updated_at', 'desc');
    if (sortBy === 'updated_asc') byDate('updated_at', 'asc');
    return docs;
  }, [filteredDocuments, sortBy]);

  const paginatedDocuments = useMemo(() => {
    const start = (page - 1) * DOCUMENTS_PER_PAGE;
    return sortedDocuments.slice(start, start + DOCUMENTS_PER_PAGE);
  }, [sortedDocuments, page]);

  const resetFilters = () => {
    setDateFilter('all');
    setSortBy(options?.defaultSortBy ?? 'created_desc');
    setFileTypeFilter('all');
    setTagFilter(options?.lockedTagId ?? 'all');
  };

  return {
    dateFilter,
    setDateFilter,
    sortBy,
    setSortBy,
    fileTypeFilter,
    setFileTypeFilter,
    tagFilter,
    setTagFilter,
    page,
    setPage,
    totalPages,
    availableFileTypes,
    filteredDocuments,
    paginatedDocuments,
    resetFilters,
  };
}
