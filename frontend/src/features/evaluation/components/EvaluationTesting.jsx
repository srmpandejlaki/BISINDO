import React from "react";
import { useNavigate } from "react-router-dom";

function EvaluationTesting({ testingData, isLoading, idTraining }) {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="evaluation-testing">
        <div className="spinner" style={{
          width: "40px",
          height: "40px",
          border: "4px solid #f3f3f3",
          borderTop: "4px solid #0056b3",
          borderRadius: "50%",
          animation: "spin 1s linear infinite"
        }}></div>
        <p style={{ marginTop: "15px", fontWeight: "600", color: "#6c757d" }}>Memuat Metrik Testing...</p>
      </div>
    );
  }

  if (!testingData) {
    return (
      <div className="evaluation-testing">
        <div style={{ fontSize: "3rem", color: "#e0a800", marginBottom: "15px" }}>⚠️</div>
        <h3 style={{ margin: "0 0 10px 0", color: "#333" }}>Belum Diuji pada Data Uji</h3>
        <p style={{ margin: "0 0 20px 0", fontSize: "0.85rem", color: "#6c757d", maxWidth: "320px" }}>
          Model ini belum pernah diuji menggunakan data uji (test split). Jalankan pengujian sekarang untuk membandingkan metrik performa.
        </p>
        <button
          onClick={() => navigate("/admin/testing", { state: { selectedModelId: idTraining } })}
          style={{
            padding: "10px 20px",
            backgroundColor: "#28a745",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            fontWeight: "600",
            cursor: "pointer",
            boxShadow: "0 2px 4px rgba(40,167,69,0.2)"
          }}
        >
          Jalankan Pengujian Sekarang
        </button>
      </div>
    );
  }

  const {
    accuracy,
    precision,
    recall,
    f1score,
    weightedAverage,
    macroAverage,
    mcc,
    confusionMatrix,
    createdAt
  } = testingData;

  const cm = typeof confusionMatrix === "string" ? JSON.parse(confusionMatrix) : confusionMatrix;
  const N = cm && Array.isArray(cm) ? cm.length : 0;
  const labels = Array.from({ length: N }, (_, i) => String.fromCharCode(65 + i));

  // Format date
  const formattedDate = createdAt 
    ? new Date(createdAt).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      })
    : "";

  return (
    <div className="evaluation-testing">
      <h3>
        Testing Evaluation
      </h3>

      {/* Test Date Info */}
      <div style={{ backgroundColor: "#f8f9fa", padding: "10px 12px", borderRadius: "6px", marginBottom: "15px", fontSize: "0.85rem" }}>
        <p style={{ margin: 0, color: "#495057" }}>
          <strong>Tanggal Pengujian:</strong> {formattedDate || "N/A"}
        </p>
      </div>

      {/* Metrics Table */}
      <div className="metrics-table">
        <table>
          <thead>
            <tr>
              <th>Metric</th>
              <th className="text-right">Value</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Accuracy</td>
              <td className="text-right" style={{ color: "#198754" }}>{(accuracy * 100).toFixed(2)}%</td>
            </tr>
            <tr>
              <td>Precision (Weighted)</td>
              <td className="text-right">{(precision * 100).toFixed(2)}%</td>
            </tr>
            <tr>
              <td>Recall (Weighted)</td>
              <td className="text-right">{(recall * 100).toFixed(2)}%</td>
            </tr>
            <tr>
              <td>F1-Score (Weighted)</td>
              <td className="text-right">{(f1score * 100).toFixed(2)}%</td>
            </tr>
            <tr>
              <td>Macro Average F1</td>
              <td className="text-right">{(macroAverage * 100).toFixed(2)}%</td>
            </tr>
            <tr>
              <td>Weighted Average F1</td>
              <td className="text-right">{(weightedAverage * 100).toFixed(2)}%</td>
            </tr>
            <tr>
              <td>MCC (Matthews Corrcoef)</td>
              <td className="text-right">{mcc ? mcc.toFixed(3) : "0.000"}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Confusion Matrix Heatmap */}
      {N > 0 && (
        <div>
          <h4 style={{ margin: "0 0 10px 0", color: "#333", fontSize: "0.95rem" }}>Confusion Matrix</h4>
          <div style={{ overflowX: "auto", border: "1px solid #dee2e6", borderRadius: "6px" }}>
            <div style={{ width: "fit-content", padding: "10px" }}>
              {/* Matrix Header Row */}
              <div style={{ display: "flex" }}>
                <div className="act-pred">act/pred</div>
                {labels.map((lbl) => (
                  <div key={lbl} className="label-col">{lbl}</div>
                ))}
              </div>

              {/* Matrix Content Rows */}
              {cm.map((row, rIdx) => (
                <div key={rIdx} style={{ display: "flex", alignItems: "center" }}>
                  {/* Row header */}
                  <div className="label-row">{labels[rIdx]}</div>
                  {/* Row values */}
                  {row.map((val, cIdx) => {
                    const isDiagonal = rIdx === cIdx;
                    let bgColor = "#fff";
                    let textColor = "#333";
                    
                    if (val > 0) {
                      if (isDiagonal) {
                        bgColor = `rgba(40, 167, 69, ${Math.min(0.1 + val * 0.15, 0.9)})`;
                        textColor = val > 3 ? "#fff" : "#0f5132";
                      } else {
                        bgColor = `rgba(220, 53, 69, ${Math.min(0.1 + val * 0.2, 0.9)})`;
                        textColor = val > 2 ? "#fff" : "#842029";
                      }
                    }
                    
                    return (
                      <div
                        key={cIdx}
                        title={`Actual: ${labels[rIdx]}, Predicted: ${labels[cIdx]} - Value: ${val}`}
                        className="matrix-cell"
                        style={{
                          fontWeight: val > 0 ? "bold" : "normal",
                          backgroundColor: bgColor,
                          color: textColor
                        }}
                      >
                        {val}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EvaluationTesting;