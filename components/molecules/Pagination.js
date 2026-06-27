import React from "react";

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
}) {
  if (totalPages <= 1) return null;

  // Logic to show pages with ellipsis if there are many pages
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, "...", totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
      <div className="text-sm text-gray-500">
        {totalItems !== undefined && itemsPerPage !== undefined && (
          <span>
            Menampilkan <span className="font-semibold">{Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)}</span> hingga{" "}
            <span className="font-semibold">{Math.min(currentPage * itemsPerPage, totalItems)}</span> dari{" "}
            <span className="font-semibold">{totalItems}</span> data
          </span>
        )}
      </div>

      <div className="flex items-center gap-1 bg-white rounded-lg shadow-sm border border-gray-200 p-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            currentPage === 1
              ? "text-gray-400 cursor-not-allowed"
              : "text-gray-700 hover:bg-gray-100 hover:text-primary"
          }`}
        >
          &laquo;
        </button>

        {getPageNumbers().map((page, index) => (
          <button
            key={index}
            onClick={() => typeof page === "number" && onPageChange(page)}
            disabled={page === "..."}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              page === "..."
                ? "text-gray-400 cursor-default"
                : currentPage === page
                ? "bg-primary text-white shadow-sm"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            {page}
          </button>
        ))}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            currentPage === totalPages
              ? "text-gray-400 cursor-not-allowed"
              : "text-gray-700 hover:bg-gray-100 hover:text-primary"
          }`}
        >
          &raquo;
        </button>
      </div>
    </div>
  );
}
