import React from "react";

function AnalisisPerbandingan({ trainingData, testingData, isLoadingTesting }) {
  if (!trainingData) return null;

  const trainAcc = trainingData.accuracy || 0;
  const trainF1 = trainingData.f1score || 0;
  const trainMcc = trainingData.mcc || 0;

  if (isLoadingTesting) {
    return (
      <div style={{ backgroundColor: "#f8f9fa", padding: "15px 20px", borderRadius: "8px", border: "1px solid #dee2e6" }}>
        <p style={{ margin: 0, color: "#6c757d", fontSize: "0.9rem" }}>Menganalisis perbandingan performa model...</p>
      </div>
    );
  }

  // If testing hasn't been run yet
  if (!testingData) {
    return (
      <div style={{ backgroundColor: "#fffbeb", padding: "15px 20px", borderRadius: "8px", border: "1px solid #ffeeba", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h4 style={{ margin: "0 0 5px 0", color: "#856404", fontSize: "0.95rem" }}>Analisis Perbandingan Generalisasi</h4>
          <p style={{ margin: 0, fontSize: "0.85rem", color: "#664d03" }}>
            Akurasi Training model saat ini adalah <strong>{(trainAcc * 100).toFixed(1)}%</strong>. Untuk melihat tingkat generalisasi model pada data baru, jalankan pengujian terlebih dahulu.
          </p>
        </div>
      </div>
    );
  }

  const testAcc = testingData.accuracy || 0;
  const testF1 = testingData.f1score || 0;
  const testMcc = testingData.mcc || 0;

  // Calculate gaps
  const accGap = trainAcc - testAcc;
  const f1Gap = trainF1 - testF1;

  // Genrate status message & badge
  let statusText = "Model Stabil & Tergeneralisasi Baik";
  let statusDesc = "Performa model pada training set dan testing set sangat seimbang. Model ini siap digunakan untuk mendeteksi isyarat BISINDO secara real-time.";
  let badgeColor = "#28a745";
  let badgeBg = "#d1e7dd";
  let badgeTextColor = "#0f5132";

  if (trainAcc < 0.60) {
    statusText = "Model Terindikasi Underfitting";
    statusDesc = "Akurasi model masih rendah di kedua fase. Rekomendasi: Tingkatkan jumlah epoch, tambahkan variasi data dataset, atau sesuaikan arsitektur LSTM unit.";
    badgeColor = "#ffc107";
    badgeBg = "#fff3cd";
    badgeTextColor = "#664d03";
  } else if (accGap > 0.10) {
    statusText = "Model Terindikasi Overfitting";
    statusDesc = `Performa pengujian ${(testAcc * 100).toFixed(1)}% jauh di bawah training ${(trainAcc * 100).toFixed(1)}% (selisih ${(accGap * 100).toFixed(1)}%). Model terlalu menghafal data latih. Rekomendasi: Tingkatkan nilai dropout rate, terapkan early stopping, atau tambahkan augmentasi data.`;
    badgeColor = "#dc3545";
    badgeBg = "#f8d7da";
    badgeTextColor = "#842029";
  } else if (accGap < -0.05) {
    statusText = "Akurasi Testing Lebih Tinggi (Unusual)";
    statusDesc = "Akurasi pada dataset uji lebih tinggi daripada data latih. Ini menunjukkan pembagian data uji mungkin memiliki sampel yang lebih mudah diklasifikasikan.";
    badgeColor = "#17a2b8";
    badgeBg = "#cff4fc";
    badgeTextColor = "#087990";
  }

  return (
    <div className="analisis-perbandingan" style={{ backgroundColor: "#fff", padding: "20px", borderRadius: "8px", border: "1px solid #dee2e6", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
      <h3 style={{ margin: "0 0 15px 0", color: "#333", borderBottom: "2px solid #6c757d", paddingBottom: "8px" }}>
        Analisis Perbandingan & Generalisasi Model
      </h3>

      {/* Comparison Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "20px", alignItems: "center" }}>
        {/* Metric Comparison Table */}
        <div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #dee2e6", backgroundColor: "#f8f9fa" }}>
                <th style={{ padding: "8px" }}>Metric</th>
                <th style={{ padding: "8px", textAlign: "right" }}>Train</th>
                <th style={{ padding: "8px", textAlign: "right" }}>Test</th>
                <th style={{ padding: "8px", textAlign: "right" }}>Gap</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: "1px solid #eee" }}>
                <td style={{ padding: "8px" }}><strong>Accuracy</strong></td>
                <td style={{ padding: "8px", textAlign: "right" }}>{(trainAcc * 100).toFixed(1)}%</td>
                <td style={{ padding: "8px", textAlign: "right", color: "#198754", fontWeight: "600" }}>{(testAcc * 100).toFixed(1)}%</td>
                <td style={{ padding: "8px", textAlign: "right", color: accGap > 0.1 ? "#dc3545" : "#333" }}>
                  {(accGap * 100).toFixed(1)}%
                </td>
              </tr>
              <tr style={{ borderBottom: "1px solid #eee" }}>
                <td style={{ padding: "8px" }}><strong>F1-Score</strong></td>
                <td style={{ padding: "8px", textAlign: "right" }}>{(trainF1 * 100).toFixed(1)}%</td>
                <td style={{ padding: "8px", textAlign: "right" }}>{(testF1 * 100).toFixed(1)}%</td>
                <td style={{ padding: "8px", textAlign: "right" }}>{(f1Gap * 100).toFixed(1)}%</td>
              </tr>
              <tr style={{ borderBottom: "1px solid #eee" }}>
                <td style={{ padding: "8px" }}><strong>MCC</strong></td>
                <td style={{ padding: "8px", textAlign: "right" }}>{trainMcc.toFixed(3)}</td>
                <td style={{ padding: "8px", textAlign: "right" }}>{testMcc.toFixed(3)}</td>
                <td style={{ padding: "8px", textAlign: "right" }}>{(trainMcc - testMcc).toFixed(3)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Diagnosis Card */}
        <div style={{ padding: "15px", backgroundColor: badgeBg, borderRadius: "8px", border: `1px solid ${badgeColor}`, color: badgeTextColor }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
            <span style={{
              padding: "4px 10px",
              borderRadius: "4px",
              backgroundColor: badgeColor,
              color: "#fff",
              fontWeight: "bold",
              fontSize: "0.75rem",
              textTransform: "uppercase"
            }}>
              Diagnosis
            </span>
            <strong style={{ fontSize: "1rem" }}>{statusText}</strong>
          </div>
          <p style={{ margin: 0, fontSize: "0.85rem", lineHeight: "1.4" }}>
            {statusDesc}
          </p>
        </div>
      </div>
    </div>
  );
}

export default AnalisisPerbandingan;