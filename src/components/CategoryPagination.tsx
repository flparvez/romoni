"use client";

import { Pagination } from "@/components/admin/pagination";

export default function CategoryPagination({
  slug,
  currentPage,
  totalPages,
}: {
  slug: string;
  currentPage: number;
  totalPages: number;
}) {
  const onPageChange = (page: number) => {
    window.location.href = `/category/${slug}?page=${page}`;
  };

  return (
    <Pagination
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={onPageChange}
    />
  );
}
