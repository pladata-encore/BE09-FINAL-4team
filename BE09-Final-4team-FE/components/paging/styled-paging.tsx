"use client";

import React from "react";
import styled from "styled-components";
import ReactPaginate from "react-paginate";

const StyledReactPaginate = styled(ReactPaginate)`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 5px;
  margin-top: 50px;
  cursor: pointer;
  list-style: none;

  .page-item {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    color: black;
    font-size: 16px;
    text-align: center;
    transition: background-color 0.2s, color 0.2s;

    &:not(.active):hover {
      background-color: rgba(255, 255, 255, 0.6);
    }
  }

  .active {
    font-weight: bold;
    color: white;
    border-radius: 50%;
    background-color: #61d0d0;
  }

  .previous-item,
  .next-item {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    font-size: 16px;
    color: #61d0d0;
    background-color: #ffffff;
    margin: 0px 10px;
  }
`;

interface StyledPagingProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (pageNumber: number) => void;
  className?: string;
}

const StyledPaging: React.FC<StyledPagingProps> = ({
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

  const handlePageClick = (event: { selected: number }) => {
    const newPage = event.selected + 1; // react-paginate는 0부터 시작하므로 +1
    onPageChange(newPage);
  };

  return (
    <div className={`flex justify-center items-center ${className}`}>
      <StyledReactPaginate
        pageCount={totalPages}
        pageRangeDisplayed={5}
        marginPagesDisplayed={2}
        onPageChange={handlePageClick}
        forcePage={currentPage - 1} // react-paginate는 0부터 시작하므로 -1
        previousLabel={"<"}
        nextLabel={">"}
        breakLabel="..."
        containerClassName="pagination"
        pageClassName="page-item"
        pageLinkClassName="page-link"
        previousClassName="previous-item"
        nextClassName="next-item"
        previousLinkClassName="previous-link"
        nextLinkClassName="next-link"
        breakClassName="break-item"
        breakLinkClassName="break-link"
        activeClassName="active"
        disabledClassName="disabled"
      />
    </div>
  );
};

export default StyledPaging;
