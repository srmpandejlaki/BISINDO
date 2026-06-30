import React, { useState, useEffect } from "react";
import { useParams, NavLink } from "react-router-dom";
import usePagination from "@/shared/hooks/usePagination";
import Pagination from "@/shared/components/base/Pagination";
import {
  get_dataset_by_id_dataset,
  upload_dataset_data,
  delete_raw_data,
  update_raw_data
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

  // Edit raw data
  const [editItem, setEditItem] = useState(null);
  const [editDataName, setEditDataName] = useState("");
  const [editLabelName, setEditLabelName] = useState("");

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

      await upload_dataset_data(uploadFile, idDataset);

      await loadDetailDataset(idDataset);

      setShowUploadModal(false);
      setUploadFile(null);

      alert("Data berhasil ditambahkan.");
    } catch (error) {
      alert(error.message || "Gagal menambahkan data.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = (id) => {
    window.location.href =
      `${BASE_URL}/datasets/${id}/download`;
  };

  const handleEditClick = (item) => {
    setEditItem(item);
    setEditDataName(item.dataName);
    setEditLabelName(item.labelName || "");
  };

  const handleUpdate = async () => {
    if (!editDataName.trim() || !editLabelName.trim()) {
      alert("Nama dan Label harus diisi!");
      return;
    }
    
    if (editLabelName.trim().length !== 1 || !/[A-Za-z]/.test(editLabelName.trim())) {
      alert("Label harus satu huruf A-Z!");
      return;
    }

    try {
      await update_raw_data(editItem.idRawData, editDataName.trim(), editLabelName.trim().toUpperCase());
      await loadDetailDataset(idDataset);
      setEditItem(null);
      alert("Data berhasil diperbarui.");
    } catch (error) {
      alert(error.message || "Gagal memperbarui data.");
    }
  };

  const handleDeleteRawData = async (idRawData) => {
    const confirmDelete = window.confirm("Apakah Anda yakin ingin menghapus data video ini?");
    if (!confirmDelete) return;

    try {
      await delete_raw_data(idRawData);
      await loadDetailDataset(idDataset);
      alert("Data video berhasil dihapus.");
    } catch (error) {
      alert(error.message || "Gagal menghapus data video.");
    }
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

      <div className="table-section">
        <div className="table-dataset">
          <table>
            <thead>
              <tr>
                <th>No.</th>
                <th>Nama</th>
                <th>Label</th>
                <th>Preview</th>
                <th style={{width: "280px"}}>Aksi</th>
              </tr>
            </thead>

            <tbody>
              {paginatedData.map((dataset, index) => (
                <tr key={dataset.idRawData}>

                  <td className="text-center">
                    {startIndex + index + 1}.
                  </td>

                  <td className="text-center">
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

                  <td className="btn-column">
                    <button className="button" onClick={() => handleEditClick(dataset)}>Ubah</button>
                    <button className="button delete" onClick={() => handleDeleteRawData(dataset.idRawData)}>Hapus</button>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
            
            {(() => {
              const previewItem = detailDataset.find(d => d.idRawData === previewId);
              const isAvi = previewItem?.dataFilePath?.toLowerCase().endsWith(".avi");
              if (isAvi) {
                return (
                  <p style={{ color: "#d9534f", margin: "10px 0", fontSize: "14px", fontWeight: "500" }}>
                    ⚠️ Format AVI tidak didukung browser modern. Gunakan dataset berformat MP4 untuk preview yang optimal.
                  </p>
                );
              }
              return null;
            })()}

            {(() => {
              const previewItem = detailDataset.find(d => d.idRawData === previewId);
              if (!previewItem) return null;
              
              // BASE_URL is http://localhost:8000/bisindo/api
              // Replace /bisindo/api with /storage to get the static files url
              const staticBase = BASE_URL.replace("/bisindo/api", "/storage");
              
              // dataFilePath is storage/datasets/... or storage\datasets\...
              // Remove the leading 'storage/' or 'storage\' from dataFilePath
              const relativePath = previewItem.dataFilePath.replace(/^storage[\\\/]/i, "").replace(/\\/g, "/");
              const videoUrl = `${staticBase}/${relativePath}`;
              
              return (
                <video
                  key={previewId}
                  controls
                  autoPlay
                  style={{ width: "100%", maxHeight: "320px" }}
                >
                  <source
                    src={videoUrl}
                    type="video/mp4"
                  />
                  Browser Anda tidak mendukung video.
                </video>
              );
            })()}

            <button
              className="button delete"
              onClick={() => setPreviewId(null)}
            >
              Tutup
            </button>

          </div>

        </div>

      )}

      {/* ================= Edit Modal ================= */}
      {editItem && (
        <div
          className="modal-overlay"
          onClick={() => setEditItem(null)}
        >
          <div
            className="modal"
            onClick={(e) => e.stopPropagation()}
            style={{ width: "320px", padding: "20px", borderRadius: "8px", background: "#fff" }}
          >
            <h2>Ubah Data Video</h2>
            
            <div style={{ margin: "15px 0", textAlign: "left" }}>
              <label style={{ fontWeight: "bold", display: "block", marginBottom: "5px" }}>Nama Video:</label>
              <input
                type="text"
                value={editDataName}
                onChange={(e) => setEditDataName(e.target.value)}
                style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
              />
            </div>

            <div style={{ margin: "15px 0", textAlign: "left" }}>
              <label style={{ fontWeight: "bold", display: "block", marginBottom: "5px" }}>Label Huruf (A-Z):</label>
              <input
                type="text"
                value={editLabelName}
                onChange={(e) => setEditLabelName(e.target.value)}
                maxLength={1}
                style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
              />
            </div>

            <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
              <button
                className="button"
                onClick={() => setEditItem(null)}
              >
                Batal
              </button>
              <button
                className="button submit"
                onClick={handleUpdate}
              >
                Simpan
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default DetailDataset;