import React from "react";

function EvaluationTraining({ trainingData }) {
  if (!trainingData) return null;

  const {
    accuracy,
    precision,
    recall,
    f1score,
    weightedAverage,
    macroAverage,
    mcc,
    confusionMatrix,
    epochs,
    batchSize,
    learningRate,
    LSTMUnits1,
    LSTMUnits2,
    dropout1,
    dropout2,
    denseUnits
  } = trainingData;

  const cm = typeof confusionMatrix === "string" ? JSON.parse(confusionMatrix) : confusionMatrix;
  const N = cm && Array.isArray(cm) ? cm.length : 0;
  const labels = Array.from({ length: N }, (_, i) => String.fromCharCode(65 + i));

  return (
    <div className="evaluation-training">
      <h3>
        Training Evaluation
      </h3>

      {/* Parameter Info Grid */}
      <div className="parameter-info">
        <div>
          <p><strong>Epochs:</strong> {epochs}</p>
          <p><strong>Batch Size:</strong> {batchSize}</p>
          <p><strong>Learning Rate:</strong> {learningRate}</p>
        </div>
        <div>
          <p><strong>LSTM Units:</strong> {LSTMUnits1} / {LSTMUnits2}</p>
          <p><strong>Dropout:</strong> {dropout1} / {dropout2}</p>
          <p><strong>Dense Units:</strong> {denseUnits}</p>
        </div>
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
              <td className="text-right">{(accuracy * 100).toFixed(2)}%</td>
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
                          color: textColor,
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

export default EvaluationTraining;