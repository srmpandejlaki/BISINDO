import React, { useState, useEffect } from "react";
import { useParams, NavLink } from "react-router-dom";
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
              <tr key={index}>
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

      <div className="pagination-display">
        <NavLink to="/admin/data-collection">
          <button className="button" >Kembali</button>
        </NavLink>
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