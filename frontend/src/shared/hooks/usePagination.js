import { useMemo } from "react";

export default function usePagination(
  data = [],
  currentPage = 1,
  itemsPerPage = 10
) {
  return useMemo(() => {
    const totalItems = data.length;

    const totalPages = Math.max(
      1,
      Math.ceil(totalItems / itemsPerPage)
    );

    // Pastikan currentPage tidak melebihi totalPages
    const safeCurrentPage = Math.min(
      Math.max(currentPage, 1),
      totalPages
    );

    const startIndex = (safeCurrentPage - 1) * itemsPerPage;

    const endIndex = Math.min(
      startIndex + itemsPerPage,
      totalItems
    );

    const paginatedData = data.slice(
      startIndex,
      endIndex
    );

    return {
      currentPage: safeCurrentPage,
      totalItems,
      totalPages,
      startIndex,
      endIndex,
      paginatedData,
    };
  }, [data, currentPage, itemsPerPage]);
}