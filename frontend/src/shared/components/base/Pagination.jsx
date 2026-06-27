import React from "react";
import IconPanahKiri from "../../../assets/icons/carbon_next-filled.svg";
import IconPanahKanan from "../../../assets/icons/carbon_next-filled-right.svg";

function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}) {
  const isFirstPage = currentPage <= 1;
  const isLastPage = currentPage >= totalPages;

  return (
    <div className="pagination">
      {/* First */}
      <button
        type="button"
        className="first"
        disabled={isFirstPage}
        onClick={() => onPageChange(1)}
        title="Halaman pertama"
      >
        <img src={IconPanahKiri} className="blackIcon" alt="Pertama" />
      </button>

      {/* Previous */}
      <button
        type="button"
        className="left"
        disabled={isFirstPage}
        onClick={() => onPageChange(currentPage - 1)}
        title="Halaman sebelumnya"
      >
        <img src={IconPanahKiri} className="blackIcon" alt="Sebelumnya" />
      </button>

      {/* Page Info */}
      <div className="pages-count">
        <p>
          Halaman <strong>{currentPage}</strong> dari{" "}
          <strong>{totalPages}</strong>
        </p>
      </div>

      {/* Next */}
      <button
        type="button"
        className="right"
        disabled={isLastPage}
        onClick={() => onPageChange(currentPage + 1)}
        title="Halaman berikutnya"
      >
        <img src={IconPanahKanan} className="blackIcon" alt="Berikutnya" />
      </button>

      {/* Last */}
      <button
        type="button"
        className="last"
        disabled={isLastPage}
        onClick={() => onPageChange(totalPages)}
        title="Halaman terakhir"
      >
        <img src={IconPanahKanan} className="blackIcon" alt="Terakhir" />
      </button>
    </div>
  );
}

export default Pagination;