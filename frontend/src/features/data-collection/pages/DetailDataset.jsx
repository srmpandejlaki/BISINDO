import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import IconPanahKiri from "../../../assets/icons/carbon_next-filled.svg";
import IconPanahKanan from "../../../assets/icons/carbon_next-filled-right.svg";
import { get_dataset_by_id_dataset } from "../utils/data_collection_api";
import { BASE_URL } from "../../../shared/utils/index-api";

function DetailDataset() {
  const { idDataset } = useParams();
  const [detailDataset, setDetailDataset] = useState([]);
  const [previewId, setPreviewId] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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
  const totalPages = Math.max(1, Math.ceil(detailDataset.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = detailDataset.slice(startIndex, startIndex + itemsPerPage);
  
  useEffect(() => { 
    if (idDataset) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadDetailDataset(idDataset);
    }
  }, [idDataset]);

  return (
    <div className="content detail-dataset">
      <h1>Detail Dataset</h1>

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
            <tr key={index}>
              <td className="text-center">{startIndex + index + 1}.</td>
              <td>{dataset.dataName || dataset.dataFilePath?.replace(/\\/g, "/").split("/").pop()}</td>
              <td className="text-center">{dataset.idLabel}</td>
              <td className="text-center">{dataset.sequenceLength}</td>
              <td className="text-center">
                <button 
                  onClick={() => setPreviewId(dataset.idRawData)}
                  style={{
                    padding: "6px 12px",
                    backgroundColor: "#007bff",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontWeight: "bold",
                    fontSize: "0.7rem",
                    transition: "background-color 0.2s"
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = "#0056b3"}
                  onMouseOut={(e) => e.target.style.backgroundColor = "#007bff"}
                >
                  Lihat Preview
                </button>
              </td>
              <td className="text-center"></td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="pagination-display">
        <Link to="/admin/data-collection">
          <button className="back-btn" >Kembali</button>
        </Link>
        <div className="pagination">
          <div 
            className="left"
            style={{ cursor: currentPage > 1 ? 'pointer' : 'not-allowed', opacity: currentPage > 1 ? 1 : 0.5 }}
            onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
          >
            <img src={IconPanahKiri} className="blackIcon" alt="Sebelumnya" />
            {/* <p>Sebelumnya</p> */}
          </div>
          <div className="pages-count">
            <p>Halaman {currentPage} dari {totalPages}</p>
          </div>
          <div 
            className="right"
            style={{ cursor: currentPage < totalPages ? 'pointer' : 'not-allowed', opacity: currentPage < totalPages ? 1 : 0.5 }}
            onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
          >
            {/* <p>Setelahnya</p> */}
            <img src={IconPanahKanan} className="blackIcon" alt="Setelahnya" />
          </div>
        </div> 
        <div className="right-section">
          <div className="total-data">
            <p className="info-total">Total Data: {detailDataset.length}</p>
          </div>
          <button className="download-btn">Download</button>
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
            <h3 style={{ color: "#fff", margin: 0, fontSize: "1.2rem", fontWeight: "600" }}>Hand Skeleton Preview</h3>
            <img 
              src={`${BASE_URL}/datasets/raw-data/${previewId}/preview`}
              alt="Hand Skeleton Preview" 
              style={{ 
                width: "280px", 
                height: "280px", 
                backgroundColor: "#000", 
                borderRadius: "8px",
                objectFit: "contain",
                border: "1px solid #444"
              }} 
            />
            <button 
              style={{
                padding: "8px 20px",
                backgroundColor: "#dc3545",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "bold",
                fontSize: "0.9rem",
                transition: "background-color 0.2s"
              }}
              onClick={() => setPreviewId (null)}
              onMouseOver={(e) => e.target.style.backgroundColor = "#c82333"}

              onMouseOut={(e) => e.target.style.backgroundColor = "#dc3545"}
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default DetailDataset;