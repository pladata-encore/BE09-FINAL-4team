declare module "react-js-pagination" {
  import { Component } from "react";

  interface PaginationProps {
    activePage: number;
    itemsCountPerPage: number;
    totalItemsCount: number;
    pageRangeDisplayed: number;
    onChange: (pageNumber: number) => void;
    prevPageText?: React.ReactNode;
    nextPageText?: React.ReactNode;
    firstPageText?: string;
    lastPageText?: string;
    innerClass?: string;
    itemClass?: string;
    itemClassFirst?: string;
    itemClassLast?: string;
    itemClassPrev?: string;
    itemClassNext?: string;
    activeClass?: string;
    activeLinkClass?: string;
    disabledClass?: string;
    hideDisabled?: boolean;
    hideFirstLastPages?: boolean;
    hideNavigation?: boolean;
    getPageUrl?: (pageNumber: number) => string;
  }

  class Pagination extends Component<PaginationProps> {}

  export default Pagination;
}
