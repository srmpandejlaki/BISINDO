import React, { useState, useEffect } from "react";
import { useParams, NavLink } from "react-router-dom";
import usePagination from "@/shared/hooks/usePagination";
import Pagination from "@/shared/components/base/Pagination";
import {
  get_dataset_by_id_dataset,
  upload_dataset_data
} from "../utils/data_collection_api";
import { BASE_URL } from "../../../shared/utils/index-api";

function DetailDataset() {
  const { idDataset } = useParams();

  const [detailDataset, setDetailDataset] = useState([]);
  const [previewId, setPreviewId] = useState(null);

  // Upload
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 14;

  const loadDetailDataset = async (id) => {
    try {
      const response = await get_dataset_by_id_dataset(id);
      setDetailDataset(response?.data || []);
    } catch (error) {
      console.error(error);
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

  const handleUpload = async () => {
    if (!uploadFile) {
      alert("Silakan pilih file ZIP.");
      return;
    }

    if (!uploadFile.name.toLowerCase().endsWith(".zip")) {
      alert("File harus berformat ZIP.");
      return;
    }

    try {
      setIsUploading(true);

      await upload_dataset_data(
        idDataset,
        uploadFile
      );

      await loadDetailDataset(idDataset);

      setShowUploadModal(false);
      setUploadFile(null);

      alert("Data berhasil ditambahkan.");
    } catch (error) {
      console.error(error);
      alert("Gagal menambahkan data.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = (id) => {
    window.location.href =
      `${BASE_URL}/datasets/${id}/download`;
  };

  return (
    <div className="content detail-dataset">

      <div className="title">
        <h2>Detail Dataset</h2>

        <div className="btn">
          <button
            className="button submit"
            onClick={() => setShowUploadModal(true)}
          >
            Tambah Data Baru
          </button>
        </div>
      </div>

      <div className="table-dataset">
        <table>
          <thead>
            <tr>
              <th>No.</th>
              <th>Nama</th>
              <th>Label</th>
              <th>Preview</th>
              <th>Aksi</th>
            </tr>
          </thead>

          <tbody>
            {paginatedData.map((dataset, index) => (
              <tr key={dataset.idRawData}>

                <td className="text-center">
                  {startIndex + index + 1}
                </td>

                <td className="padding-cell">
                  {dataset.dataName}
                </td>

                <td className="text-center">
                  {dataset.labelName}
                </td>

                <td className="text-center">
                  <button
                    className="button edit"
                    onClick={() =>
                      setPreviewId(dataset.idRawData)
                    }
                  >
                    Preview
                  </button>
                </td>

                <td className="text-center">

                  {/* nanti tombol delete */}

                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pagination-dataset">

        <NavLink to="/admin/data-collection">
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

          <button className="button submit" onClick={() => handleDownload(idDataset)}>
            Download
          </button>

        </div>

      </div>

      {/* ================= Upload Modal ================= */}

      {showUploadModal && (

        <div
          className="modal-overlay"
          onClick={() => setShowUploadModal(false)}
        >

          <div
            className="modal"
            onClick={(e) => e.stopPropagation()}
          >

            <h2>Tambah Data Dataset</h2>

            <p>
              Upload file ZIP dengan struktur:
            </p>

            <pre>
              {`A/
                A001.mp4
                A002.mp4

              B/
                B001.mp4`}
            </pre>

            <input
              type="file"
              accept=".zip"
              onChange={(e) =>
                setUploadFile(
                  e.target.files?.[0] || null
                )
              }
            />

            <div
              style={{
                display: "flex",
                gap: "12px",
                marginTop: "20px",
              }}
            >

              <button
                className="button"
                onClick={() =>
                  setShowUploadModal(false)
                }
              >
                Batal
              </button>

              <button
                className="button submit"
                onClick={handleUpload}
                disabled={isUploading}
              >
                {isUploading
                  ? "Mengupload..."
                  : "Upload"}
              </button>

            </div>

          </div>

        </div>

      )}

      {/* ================= Preview ================= */}

      {previewId && (

        <div
          className="modal-overlay"
          onClick={() => setPreviewId(null)}
        >

          <div
            className="modal"
            onClick={(e) => e.stopPropagation()}
          >

            <h2>Preview Video</h2>

            {console.log(
              `${BASE_URL}/datasets/raw-data/${previewId}/preview`
            )}
            <video
              controls
              autoPlay
              onLoadedData={() => console.log("Video berhasil dimuat")}
              onError={(e) => console.log("Video error", e)}
            >
              <source
                src={`${BASE_URL}/datasets/raw-data/${previewId}/preview`}
                // type="video/mp4"
              />
              Browser Anda tidak mendukung video.
            </video>

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

export default DetailDataset;