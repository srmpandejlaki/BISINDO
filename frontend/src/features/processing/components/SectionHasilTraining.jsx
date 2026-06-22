import React, { useEffect, useRef } from "react";

function SectionHasilTraining({ trainingStatus, currentTrainingModelName, liveProgress, finalResults }) {
  const tableBottomRef = useRef(null);

  useEffect(() => {
    if (trainingStatus === "training" && tableBottomRef.current) {
      tableBottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [liveProgress, trainingStatus]);

  const renderConfusionMatrix = (matrix) => {
    if (!matrix || !Array.isArray(matrix)) return null;
    return (
      <div className="confusion-matrix-container mt-4">
        <h4>Confusion Matrix</h4>
        <div className="matrix-grid">
          <table>
            <tbody>
              {matrix.map((row, rIdx) => (
                <tr key={rIdx}>
                  {row.map((val, cIdx) => (
                    <td key={cIdx} className="matrix-cell">
                      {val}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="section-hasil-training">
      <h2>Hasil Training</h2>
      
      {trainingStatus === "training" && (
        <div className="hasil-training-live animate-fade-in">
          <div className="live-status-header">
            <span className="pulse-indicator"></span>
            <h3>Sedang Mentraining: <span className="highlight-text">{currentTrainingModelName}</span></h3>
          </div>
          
          <div className="live-progress-table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Epoch</th>
                  <th>Loss</th>
                  <th>Accuracy</th>
                  <th>Val Loss</th>
                  <th>Val Accuracy</th>
                </tr>
              </thead>
              <tbody>
                {liveProgress.map((log, index) => (
                  <tr key={index}>
                    <td>Epoch {log.epoch}</td>
                    <td>{log.loss.toFixed(4)}</td>
                    <td className="accuracy-val">{(log.accuracy * 100).toFixed(2)}%</td>
                    <td>{log.val_loss.toFixed(4)}</td>
                    <td className="accuracy-val">{(log.val_accuracy * 100).toFixed(2)}%</td>
                  </tr>
                ))}
                {liveProgress.length === 0 && (
                  <tr>
                    <td colSpan="5">Memulai epoch pertama...</td>
                  </tr>
                )}
              </tbody>
            </table>
            <div ref={tableBottomRef} />
          </div>
        </div>
      )}

      {finalResults && (
        <div className="hasil-training-final animate-fade-in mt-4">
          <h3>Hasil Evaluasi Model Akhir: <span className="highlight-text">{finalResults.modelName}</span></h3>
          
          <div className="metrics-cards-grid mt-3">
            <div className="metric-card">
              <span className="metric-label">Akurasi</span>
              <span className="metric-value">{(finalResults.accuracy * 100).toFixed(2)}%</span>
            </div>
            <div className="metric-card">
              <span className="metric-label">Precision</span>
              <span className="metric-value">{(finalResults.precision * 100).toFixed(2)}%</span>
            </div>
            <div className="metric-card">
              <span className="metric-label">Recall</span>
              <span className="metric-value">{(finalResults.recall * 100).toFixed(2)}%</span>
            </div>
            <div className="metric-card">
              <span className="metric-label">F1-Score</span>
              <span className="metric-value">{(finalResults.f1score * 100).toFixed(2)}%</span>
            </div>
          </div>

          <div className="metrics-cards-grid secondary mt-3">
            <div className="metric-card secondary-card">
              <span className="metric-label">Train Loss</span>
              <span className="metric-value">{finalResults.trainLoss?.toFixed(4) || "-"}</span>
            </div>
            <div className="metric-card secondary-card">
              <span className="metric-label">Validation Loss</span>
              <span className="metric-value">{finalResults.valLoss?.toFixed(4) || "-"}</span>
            </div>
            <div className="metric-card secondary-card">
              <span className="metric-label">MCC Score</span>
              <span className="metric-value">{finalResults.mcc?.toFixed(4) || "-"}</span>
            </div>
          </div>

          {renderConfusionMatrix(finalResults.confusionMatrix)}
        </div>
      )}

      {trainingStatus !== "training" && !finalResults && (
        <div className="empty-training-state">
          <p>Belum ada proses training aktif. Masukkan parameter model di atas dan klik <strong>Mulai Training</strong> untuk memulai.</p>
        </div>
      )}
    </div>
  );
}

export default SectionHasilTraining;