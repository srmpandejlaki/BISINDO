import React, { useState, useEffect } from "react";
import { useParams, NavLink } from "react-router-dom";
import usePagination from "@/shared/hooks/usePagination";
import Pagination from "@/shared/components/base/Pagination";
import { get_dataset_landmark_by_id } from "../utils/hand_skeleton_api";
import { BASE_URL } from "@/shared/utils/index-api";

function DetailLandmark() {
  const { idDataset } = useParams();

  const [detailDataset, setDetailDataset] = useState([]);
  const [datasetInfo, setDatasetInfo] = useState({});
  const [previewId, setPreviewId] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 14;

  const loadDetailDataset = async (id) => {
    try {
      const response = await get_dataset_landmark_by_id(id);
      if (response && response.success) {
        setDetailDataset(response.data?.rawData || []);
        setDatasetInfo(response.data || {});
      }
    } catch (error) {
      console.error("Gagal memuat detail landmark:", error);
      setDetailDataset([]);
    }
  };

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
      <div className="title">
        <h2>Detail Landmark Dataset: {datasetInfo.datasetName || ""}</h2>
      </div>

      <div className="table-section">
        <div className="table-dataset">
          <table>
            <thead>
              <tr>
                <th>No.</th>
                <th>Nama</th>
                <th>Label</th>
                <th>Status Landmark</th>
                <th style={{ width: "200px" }}>Aksi</th>
              </tr>
            </thead>

            <tbody>
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center">Tidak ada data landmark</td>
                </tr>
              ) : (
                paginatedData.map((data, index) => (
                  <tr key={data.idRawData}>
                    <td className="text-center">
                      {startIndex + index + 1}.
                    </td>

                    <td className="text-center">
                      {data.dataName}
                    </td>

                    <td className="text-center">
                      {data.labelName || "-"}
                    </td>

                    <td className="text-center">
                      <span
                        className={`status-badge ${
                          data.landmarkFilePath
                            ? "status-done"
                            : "status-pending"
                        }`}
                      >
                        {data.landmarkFilePath
                          ? "Sudah diproses"
                          : "Belum diproses"}
                      </span>
                    </td>

                    <td className="text-center">
                      <button
                        className="button edit"
                        onClick={() => setPreviewId(data.idRawData)}
                        disabled={!data.landmarkFilePath}
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="pagination-dataset">
        <NavLink to="/admin/processing/hand-skeleton">
          <button className="button">
            Kembali
          </button>
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
            <p className="info-total">
              Total Data : {totalItems}
            </p>
          </div>
        </div>
      </div>

      {/* ================= Review Modal ================= */}
      {previewId && (
        <div
          className="modal-overlay"
          onClick={() => setPreviewId(null)}
        >
          <div
            className="modal"
            onClick={(e) => e.stopPropagation()}
            style={{ width: "300px", padding: "20px", borderRadius: "8px", background: "#fff", textAlign: "center" }}
          >
            <h2>Review Landmark</h2>
            <p style={{ margin: "10px 0", color: "#666" }}>Representasi Skeleton Tangan Frame Pertama</p>

            <div
              className="landmark-preview-container"
              style={{
                display: "flex",
                justifyContent: "center",
                margin: "20px 0",
              }}
            >
              <img
                src={`${BASE_URL}/processing/landmarks/raw-data/${previewId}/preview`}
                alt="Landmark Preview"
                style={{
                  width: "200px",
                  height: "200px",
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                  backgroundColor: "#000"
                }}
                onError={(e) => {
                  e.target.onerror = null;
                  alert("Gagal memuat preview landmark.");
                  setPreviewId(null);
                }}
              />
            </div>

            <button
              className="button delete"
              onClick={() => setPreviewId(null)}
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DetailLandmark;