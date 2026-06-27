import React, { useState, useEffect } from "react";
import { useParams, NavLink } from "react-router-dom";
import usePagination from "@/shared/hooks/usePagination";
import Pagination from "@/shared/components/base/Pagination";
import { get_dataset_by_id_dataset } from "../utils/data_collection_api";
import { BASE_URL } from "../../../shared/utils/index-api";

function DetailDataset() {
  const { idDataset } = useParams();
  const [detailDataset, setDetailDataset] = useState([]);
  const [previewId, setPreviewId] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 14;

  const loadDetailDataset = async (id) => {
    try {
      const response = await get_dataset_by_id_dataset(id);
      console.log("Detail dataset:", response);
      setDetailDataset(response?.data || []);
    } catch (error) {
      console.error("Error fetching data", error);
      setDetailDataset([]);
    }
  };

  // Pagination logic
  const {
      paginatedData,
      totalPages,
      totalItems,
      startIndex,
    } = usePagination(
      detailDataset,
      currentPage,
      itemsPerPage
    );

  useEffect(() => { 
    if (!idDataset) return;

    loadDetailDataset(idDataset);
  }, [idDataset]);

  useEffect(() => {
    setCurrentPage(1);
  }, [detailDataset]);

  return (
    <div className="content detail-dataset">
      <h2>Detail Dataset</h2>

      <div className="table-dataset">
        <table>
          <thead>
            <tr>
              <th>No.</th>
              <th>Name</th>
              <th>Label</th>
              <th>Sequence Length</th>
              <th>Preview</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((dataset, index) => (
              <tr key={dataset.idRawData}>
                <td className="text-center">{startIndex + index + 1}.</td>
                <td className="padding-cell">{dataset.dataName || dataset.dataFilePath?.replace(/\\/g, "/").split("/").pop()}</td>
                <td className="text-center">{dataset.idLabel}</td>
                <td className="text-center">{dataset.sequenceLength}</td>
                <td className="text-center">
                  <button 
                    onClick={() => setPreviewId(dataset.idRawData)}
                    className="button edit"
                  >
                    Lihat Preview
                  </button>
                </td>
                <td className="text-center"></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pagination-dataset">
        <NavLink to="/admin/data-collection">
          <button className="button" >Kembali</button>
        </NavLink>
        {totalPages > 1 && (
          <div className="pagination-display">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
        <div className="right-section">
          <div className="total-data">
            <p className="info-total">Total Data: {totalItems}</p>
          </div>
          <button className="button submit">Download</button>
        </div>   
      </div>

      {previewId && (
        <div 
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.75)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
            backdropFilter: "blur(4px)"
          }}
          onClick={() => setPreviewId (null)}
        >
          <div 
            style={{
              backgroundColor: "#1e1e1e",
              padding: "25px",
              borderRadius: "12px",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "20px",
              position: "relative",
              border: "1px solid #333"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="white">Hand Skeleton Preview</h2>
            <img 
              src={`${BASE_URL}/datasets/raw-data/${previewId}/preview`}
              alt="Hand Skeleton Preview" 
              className="img-preview"
            />
            <button className="button delete" onClick={() => setPreviewId (null)} >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default DetailDataset;