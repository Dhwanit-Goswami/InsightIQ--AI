import React from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  className = '',
}) => {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-1.5 rounded-lg hover:bg-white/8 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
      >
        <FiChevronLeft className="w-4 h-4" />
      </button>
      {pages.map(page => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
            currentPage === page
              ? 'bg-primary text-white'
              : 'text-slate-400 hover:bg-white/8 hover:text-white'
          }`}
        >
          {page}
        </button>
      ))}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-1.5 rounded-lg hover:bg-white/8 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
      >
        <FiChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Pagination;
