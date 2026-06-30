import React, { useState, useEffect } from "react";
import usePagination from "@/shared/hooks/usePagination";
import Pagination from "@/shared/components/base/Pagination";

function TestingResult({ isLoading, error, testResults }) {
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 10;

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Ambil predictions jika mode dataset
  const predictions =
    testResults?.mode === "dataset"
      ? testResults.predictions
      : [];

  const {
    paginatedData,
    totalPages,
    totalItems,
    startIndex,
  } = usePagination(
    predictions,
    currentPage,
    itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [testResults]);

  if (isLoading) {
    return (
      <div className="testing-result testing-processing">
        <div className="spinner"></div>
        <p className="p1">Memproses Pengujian Model...</p>
        <p className="p2">
          Ekstraksi MediaPipe (jika menggunakan video) dan komputasi metrik evaluasi sedang berjalan.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="testing-result testing-error">
        <h4>Gagal Melakukan Pengujian</h4>
        <p>{error}</p>
      </div>
    );
  }

  if (!testResults) {
    return (
      <div className="testing-result testing-empty">
        <p className="p1">Belum Ada Data Pengujian</p>
        <p className="p2">Konfigurasikan model & mode pengujian lalu klik Start Testing.</p>
      </div>
    );
  }

  const { mode } = testResults;

  if (mode === "dataset") {
    const { summary } = testResults;

    return (
      <div className="testing-result testing-dataset">
        {/* Header */}
        <div className="testing-header">
          <h4>Hasil Pengujian</h4>
        </div>

        {/* Summary Metrik */}
        <div className="testing-summary">
          <div>
            <span>Accuracy</span>
            <strong>{(summary.accuracy * 100).toFixed(1)}%</strong>
          </div>
          <div>
            <span>Precision</span>
            <strong>{(summary.precision * 100).toFixed(1)}%</strong>
          </div>
          <div>
            <span>Recall</span>
            <strong>{(summary.recall * 100).toFixed(1)}%</strong>
          </div>
          <div>
            <span>F1-Score</span>
            <strong>{(summary.f1score * 100).toFixed(1)}%</strong>
          </div>
          <div>
            <span>MCC</span>
            <strong>{summary.mcc.toFixed(3)}</strong>
          </div>
        </div>

        {/* Detailed Predictions Table */}
        <div>
          <h5>Log Prediksi Data Uji ({totalItems} sampel)</h5>
          <div className=" table testing-table">
            <table>
              <thead style={{ backgroundColor: "#f8f9fa", position: "sticky", top: 0, zIndex: 1, borderBottom: "2px solid #dee2e6" }}>
                <tr>
                  <th style={{ width: "40px"}}>No</th>
                  <th>File Name</th>
                  <th style={{ width: "80px"}}>Label Asli</th>
                  <th style={{ padding: "10px", width: "80px"}}>Prediksi</th>
                  <th style={{ padding: "10px", width: "80px"}}>Confidence</th>
                  <th style={{ padding: "10px", width: "80px"}}>Keterangan</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((p, index) => (
                  <tr key={p.no} style={{ borderBottom: "1px solid #eee", backgroundColor: p.keterangan === "Salah" ? "#fff8f8" : "#fff" }}>
                    <td style={{ padding: "10px", textAlign: "center" }}>{startIndex + index + 1}.</td>
                    <td style={{ padding: "10px", color: "#666", wordBreak: "break-all" }}>{p.name}</td>
                    <td style={{ padding: "10px", textAlign: "center", fontWeight: "600" }}>{p.label_asli}</td>
                    <td style={{ padding: "10px", textAlign: "center", fontWeight: "600", color: p.keterangan === "Salah" ? "#dc3545" : "#28a745" }}>{p.prediksi}</td>
                    <td style={{ padding: "10px", textAlign: "center", color: "#333" }}>{p.confidence}</td>
                    <td style={{ padding: "10px", textAlign: "center" }}>
                      <span style={{
                        padding: "3px 8px",
                        borderRadius: "12px",
                        fontSize: "0.75rem",
                        fontWeight: "600",
                        backgroundColor: p.keterangan === "Salah" ? "#f8d7da" : "#d1e7dd",
                        color: p.keterangan === "Salah" ? "#842029" : "#0f5132"
                      }}>
                        {p.keterangan}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {totalPages > 1 && (
          <div className="pagination-display">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>
    );
  }

  if (mode === "upload") {
    return (
      <div className="testing-result" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {/* Header */}
        <div style={{ borderBottom: "1px solid #e9ecef", paddingBottom: "10px" }}>
          <h4 style={{ margin: 0, color: "#333" }}>Testing Result (File Upload)</h4>
        </div>

        {/* Upload Prediction Info */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "30px 20px", backgroundColor: "#f8f9fa", borderRadius: "8px", border: "1px solid #e9ecef" }}>
          <p style={{ margin: "0 0 10px 0", fontSize: "0.85rem", color: "#6c757d" }}>
            Berkas diuji: <strong>{testResults.filename}</strong>
          </p>

          <span style={{ fontSize: "0.9rem", color: "#495057", marginBottom: "15px" }}>Hasil Prediksi Model:</span>
          
          {/* Big Circle with Prediction */}
          <div style={{
            width: "120px",
            height: "120px",
            borderRadius: "50%",
            backgroundColor: "#28a745",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "4rem",
            fontWeight: "bold",
            boxShadow: "0 4px 10px rgba(40,167,69,0.3)",
            marginBottom: "15px"
          }}>
            {testResults.predicted_label}
          </div>

          <div style={{ textAlign: "center" }}>
            <span style={{ display: "block", fontSize: "0.8rem", color: "#6c757d" }}>Tingkat Confidence:</span>
            <strong style={{ fontSize: "1.4rem", color: "#28a745" }}>{testResults.confidence}</strong>
          </div>

          <p style={{ margin: "20px 0 0 0", fontSize: "0.8rem", color: "#6c757d", textAlign: "center" }}>
            Model berhasil mengevaluasi file. Alfabet yang dikenali adalah huruf <strong>"{testResults.predicted_label}"</strong>.
          </p>
        </div>
      </div>
    );
  }

  return null;
}

export default TestingResult;