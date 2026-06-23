import React from "react";

function TestingResult({ isLoading, error, testResults }) {
  if (isLoading) {
    return (
      <div className="testing-result" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "300px" }}>
        <div className="spinner" style={{
          width: "50px",
          height: "50px",
          border: "5px solid #f3f3f3",
          borderTop: "5px solid #28a745",
          borderRadius: "50%",
          animation: "spin 1s linear infinite"
        }}></div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
        <p style={{ marginTop: "20px", fontWeight: "600", color: "#495057" }}>Memproses Pengujian Model...</p>
        <p style={{ margin: "5px 0 0 0", fontSize: "0.8rem", color: "#6c757d", textAlign: "center" }}>
          Ekstraksi MediaPipe (jika menggunakan video) dan komputasi metrik evaluasi sedang berjalan.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="testing-result" style={{ padding: "20px", backgroundColor: "#fff5f5", border: "1px solid #ffc9c9", borderRadius: "8px", minHeight: "300px" }}>
        <h4 style={{ color: "#d9534f", marginTop: 0 }}>Gagal Melakukan Pengujian</h4>
        <p style={{ color: "#495057", fontSize: "0.9rem" }}>{error}</p>
      </div>
    );
  }

  if (!testResults) {
    return (
      <div className="testing-result" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#6c757d", minHeight: "300px", border: "2px dashed #dee2e6" }}>
        <p style={{ margin: 0, fontWeight: "500" }}>Belum Ada Data Pengujian</p>
        <p style={{ margin: "5px 0 0 0", fontSize: "0.8rem", color: "#adb5bd" }}>Konfigurasikan model & mode pengujian lalu klik Start Testing.</p>
      </div>
    );
  }

  const { mode } = testResults;

  if (mode === "dataset") {
    const { summary, predictions } = testResults;

    return (
      <div className="testing-result" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {/* Header */}
        <div style={{ borderBottom: "1px solid #e9ecef", paddingBottom: "10px" }}>
          <h4 style={{ margin: 0, color: "#333" }}>Testing Result (Dataset Uji)</h4>
        </div>

        {/* Summary Metrik */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))", gap: "10px" }}>
          <div style={{ backgroundColor: "#e8f4fd", padding: "12px", borderRadius: "6px", textAlign: "center" }}>
            <span style={{ fontSize: "0.8rem", color: "#0056b3", display: "block" }}>Accuracy</span>
            <strong style={{ fontSize: "1.3rem", color: "#0056b3" }}>{(summary.accuracy * 100).toFixed(1)}%</strong>
          </div>
          <div style={{ backgroundColor: "#f0fdf4", padding: "12px", borderRadius: "6px", textAlign: "center" }}>
            <span style={{ fontSize: "0.8rem", color: "#166534", display: "block" }}>Precision</span>
            <strong style={{ fontSize: "1.3rem", color: "#166534" }}>{(summary.precision * 100).toFixed(1)}%</strong>
          </div>
          <div style={{ backgroundColor: "#fffbeb", padding: "12px", borderRadius: "6px", textAlign: "center" }}>
            <span style={{ fontSize: "0.8rem", color: "#9a3412", display: "block" }}>Recall</span>
            <strong style={{ fontSize: "1.3rem", color: "#9a3412" }}>{(summary.recall * 100).toFixed(1)}%</strong>
          </div>
          <div style={{ backgroundColor: "#faf5ff", padding: "12px", borderRadius: "6px", textAlign: "center" }}>
            <span style={{ fontSize: "0.8rem", color: "#6b21a8", display: "block" }}>F1-Score</span>
            <strong style={{ fontSize: "1.3rem", color: "#6b21a8" }}>{(summary.f1score * 100).toFixed(1)}%</strong>
          </div>
          <div style={{ backgroundColor: "#f8fafc", padding: "12px", borderRadius: "6px", textAlign: "center" }}>
            <span style={{ fontSize: "0.8rem", color: "#475569", display: "block" }}>MCC</span>
            <strong style={{ fontSize: "1.3rem", color: "#475569" }}>{summary.mcc.toFixed(3)}</strong>
          </div>
        </div>

        {/* Detailed Predictions Table */}
        <div>
          <h5 style={{ margin: "0 0 10px 0", color: "#495057" }}>Log Prediksi Data Uji ({predictions.length} sampel)</h5>
          <div style={{ maxHeight: "350px", overflowY: "auto", border: "1px solid #dee2e6", borderRadius: "6px" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.85rem" }}>
              <thead style={{ backgroundColor: "#f8f9fa", position: "sticky", top: 0, zIndex: 1, borderBottom: "2px solid #dee2e6" }}>
                <tr>
                  <th style={{ padding: "10px", borderBottom: "1px solid #dee2e6", width: "40px" }}>No</th>
                  <th style={{ padding: "10px", borderBottom: "1px solid #dee2e6" }}>File Name</th>
                  <th style={{ padding: "10px", borderBottom: "1px solid #dee2e6", width: "80px", textAlign: "center" }}>Label Asli</th>
                  <th style={{ padding: "10px", borderBottom: "1px solid #dee2e6", width: "80px", textAlign: "center" }}>Prediksi</th>
                  <th style={{ padding: "10px", borderBottom: "1px solid #dee2e6", width: "80px", textAlign: "right" }}>Confidence</th>
                  <th style={{ padding: "10px", borderBottom: "1px solid #dee2e6", width: "80px", textAlign: "center" }}>Keterangan</th>
                </tr>
              </thead>
              <tbody>
                {predictions.map((p) => (
                  <tr key={p.no} style={{ borderBottom: "1px solid #eee", backgroundColor: p.keterangan === "Salah" ? "#fff8f8" : "#fff" }}>
                    <td style={{ padding: "10px" }}>{p.no}</td>
                    <td style={{ padding: "10px", color: "#666", wordBreak: "break-all" }}>{p.name}</td>
                    <td style={{ padding: "10px", textAlign: "center", fontWeight: "600" }}>{p.label_asli}</td>
                    <td style={{ padding: "10px", textAlign: "center", fontWeight: "600", color: p.keterangan === "Salah" ? "#dc3545" : "#28a745" }}>{p.prediksi}</td>
                    <td style={{ padding: "10px", textAlign: "right", color: "#333" }}>{p.confidence}</td>
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