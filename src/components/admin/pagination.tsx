// components/admin/Pagination.tsx
"use client";

import React from "react";

interface Props {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  siblingCount?: number; // how many page buttons on left/right
}

function range(start: number, end: number) {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

export const Pagination: React.FC<Props> = ({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1,
}) => {
  if (totalPages <= 1) return null;

  const leftSibling = Math.max(1, currentPage - siblingCount);
  const rightSibling = Math.min(totalPages, currentPage + siblingCount);

  const pages: (number | "...")[] = [];

  if (leftSibling > 1) {
    pages.push(1);
    if (leftSibling > 2) pages.push("...");
  }

  pages.push(...range(leftSibling, rightSibling));

  if (rightSibling < totalPages) {
    if (rightSibling < totalPages - 1) pages.push("...");
    pages.push(totalPages);
  }

  return (
    <nav className="flex items-center gap-2" aria-label="Pagination">
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        className="px-3 py-1.5 rounded-md border hover:bg-gray-100"
        disabled={currentPage === 1}
      >
        Prev
      </button>

      {pages.map((p, idx) =>
        p === "..." ? (
          <span key={idx+1} className="px-3 py-1.5 text-gray-500">…</span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(Number(p))}
            className={`px-3 py-1.5 rounded-md border ${p === currentPage ? "bg-black text-white" : "bg-white"}`}
          >
            {p}
          </button>
        )
      )}

      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        className="px-3 py-1.5 rounded-md border hover:bg-gray-100"
        disabled={currentPage === totalPages}
      >
        Next
      </button>
    </nav>
  );
};
