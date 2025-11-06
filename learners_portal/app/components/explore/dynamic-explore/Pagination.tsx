import {
  MdNavigateNext,
  MdNavigateBefore,
  MdFirstPage,
  MdLastPage,
} from "react-icons/md";
import { useState } from "react";

interface PaginationProps {
  totalPages: number;
}

const Pagination: React.FC<PaginationProps> = ({ totalPages }) => {
  const [currentPage, setCurrentPage] = useState<number>(1);

  const handlePageChange = (pageNumber: number) => setCurrentPage(pageNumber);
  const handleFirstPage = () => setCurrentPage(1);
  const handleLastPage = () => setCurrentPage(totalPages);

  const circles: JSX.Element[] = [];
  for (let i = 1; i <= totalPages; i++) {
    circles.push(
      <button
        key={i}
        onClick={() => handlePageChange(i)}
        className={`
          flex items-center justify-center font-SofiaProSemiBold shadow-xl mx-1 cursor-pointer
          rounded-full
          h-8 w-8 text-lg                     /* base */
          min-[360px]:h-9 min-[360px]:w-9 min-[360px]:text-xl
          min-[414px]:h-10 min-[414px]:w-10 min-[414px]:text-2xl
          sm:h-9 sm:w-9 sm:text-[18px]        /* sm compact */
          md:h-10 md:w-10 md:text-[20px]      /* md modest bump */
          ${
            currentPage === i
              ? "bg-Primary text-Secondary"
              : "bg-[#F8F7F4] text-Primary"
          }
        `}
      >
        {i}
      </button>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center">
      <div className="flex items-center justify-center mt-4 sm:mt-0">
        <button
          onClick={handleFirstPage}
          disabled={currentPage === 1}
          className="disabled:opacity-40"
        >
          <MdFirstPage className="h-[22px] w-[22px] md:h-[24px] md:w-[24px]" />
        </button>
        <button
          onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="ml-2 disabled:opacity-40"
        >
          <MdNavigateBefore className="h-[22px] w-[22px] md:h-[24px] md:w-[24px]" />
        </button>
      </div>

      <div className="flex items-center gap-3 mt-4 sm:mt-0">{circles}</div>

      <div className="flex items-center justify-center mt-4 sm:mt-0">
        <button
          onClick={() =>
            handlePageChange(Math.min(totalPages, currentPage + 1))
          }
          disabled={currentPage === totalPages}
          className="mr-2 disabled:opacity-40"
        >
          <MdNavigateNext className="h-[22px] w-[22px] md:h-[24px] md:w-[24px]" />
        </button>
        <button
          onClick={handleLastPage}
          disabled={currentPage === totalPages}
          className="disabled:opacity-40"
        >
          <MdLastPage className="h-[22px] w-[22px] md:h-[24px] md:w-[24px]" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
