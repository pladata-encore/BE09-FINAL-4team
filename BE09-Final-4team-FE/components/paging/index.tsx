"use client";

import React from "react";
import Pagination from "react-js-pagination";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PagingProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (pageNumber: number) => void;
  className?: string;
}

const Paging: React.FC<PagingProps> = ({
  currentPage,
  totalItems,
  itemsPerPage = 10,
  onPageChange,
  className = "",
}) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // 페이지가 1개 이하인 경우 페이징을 표시하지 않음
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className={`flex justify-center items-center ${className}`}>
      <Pagination
        activePage={currentPage}
        itemsCountPerPage={itemsPerPage}
        totalItemsCount={totalItems}
        pageRangeDisplayed={5} // 한 번에 보여줄 페이지 번호 개수
        onChange={onPageChange}
        prevPageText={<ChevronLeft className="w-4 h-4" />}
        nextPageText={<ChevronRight className="w-4 h-4" />}
        firstPageText="처음"
        lastPageText="마지막"
        innerClass="flex items-center space-x-1"
        itemClass="flex items-center justify-center w-8 h-8 text-sm font-medium rounded-lg transition-colors duration-200"
        itemClassFirst="flex items-center justify-center w-8 h-8 text-sm font-medium rounded-lg transition-colors duration-200"
        itemClassLast="flex items-center justify-center w-8 h-8 text-sm font-medium rounded-lg transition-colors duration-200"
        itemClassPrev="flex items-center justify-center w-8 h-8 text-sm font-medium rounded-lg transition-colors duration-200"
        itemClassNext="flex items-center justify-center w-8 h-8 text-sm font-medium rounded-lg transition-colors duration-200"
        activeClass="bg-blue-500 text-white hover:bg-blue-600"
        activeLinkClass="text-white"
        disabledClass="text-gray-400 cursor-not-allowed"
        hideDisabled={true}
        hideFirstLastPages={false}
        hideNavigation={false}
        getPageUrl={(pageNumber) => `#page-${pageNumber}`}
      />
    </div>
  );
};

export default Paging;
