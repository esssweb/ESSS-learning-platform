import { MdNavigateNext, MdNavigateBefore, MdFirstPage, MdLastPage } from "react-icons/md";
import { useState } from "react";

interface PaginationProps {
  totalPages: number;
}

const Pagination: React.FC<PaginationProps> = ({ totalPages }) => {
  const [currentPage, setCurrentPage] = useState<number>(1);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const handleFirstPage = () => {
    setCurrentPage(1);
  };

  const handleLastPage = () => {
    setCurrentPage(totalPages);
  };

  const circles: JSX.Element[] = [];
  for (let i: number = 1; i <= totalPages; i++) {
    circles.push(
      <button
        key={i}
        onClick={() => handlePageChange(i)}
        className={`h-[37px] w-[37px] flex items-center justify-center font-SofiaProSemiBold text-3xl rounded-full shadow-xl mx-1 cursor-pointer ${
          currentPage === i ? "bg-Primary text-Secondary" : "bg-[#F8F7F4] text-Primary"
        }`}
      >
        {i}
      </button>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center">
      <div className="flex items-center justify-center mt-5 sm:mt-0">
        <button onClick={handleFirstPage} disabled={currentPage === 1}>
          <MdFirstPage size={24} />
        </button>
        <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="ml-2">
          <MdNavigateBefore size={24} />
        </button>
      </div>

      <div className="flex items-center gap-4 mt-4 sm:mt-0">
        {circles}
      </div>

      <div className="flex items-center justify-center mt-5 sm:mt-0">
        <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="mr-2">
          <MdNavigateNext size={24} />
        </button>
        <button onClick={handleLastPage} disabled={currentPage === totalPages}>
          <MdLastPage size={24} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
