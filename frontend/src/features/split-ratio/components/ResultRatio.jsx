import React from "react";

function ResultRatio({ ratios, liveProgress, testingStatus, currentRatioTesting }) {
  const testedRatios = ratios.filter((item) => item.accuracy !== null && item.accuracy !== undefined);
  const bestRatioItem = ratios.find((item) => item.bestRatio === true);

  return (
    <div className="result-ratio-section" >
      
      {/* SECTION 1: LIVE PROCESS TABLES PER RATIO */}
      {(testingStatus === "testing" || Object.keys(liveProgress).length > 0) && (
        <div className="live-processes-wrapper" >
          <h3>Proses Training Per Ratio</h3>
          <div className="live-processes" >
            {Object.keys(liveProgress).map((ratioName) => {
              const logs = liveProgress[ratioName] || [];
              const isCurrent = currentRatioTesting === ratioName && testingStatus === "testing";
              
              return (
                <div key={ratioName} className="table-process" >
                  <h4>
                    <span>Ratio Split: <strong>{ratioName}</strong></span>
                    {isCurrent && (
                      <span className="running" >
                        ⚡ Running...
                      </span>
                    )}
                  </h4>
                  
                  <div className="table-wrapper" >
                    <table>
                      <thead>
                        <tr>
                          <th>Epoch</th>
                          <th>Train Acc</th>
                          <th>Val Acc</th>
                          <th>Val Loss</th>
                        </tr>
                      </thead>
                      <tbody>
                        {logs.length > 0 ? (
                          logs.map((row) => (
                            <tr key={row.epoch} className="text-center">
                              <td>{row.epoch}</td>
                              <td>{(row.accuracy * 100).toFixed(1)}%</td>
                              <td>{(row.val_accuracy * 100).toFixed(1)}%</td>
                              <td>{row.val_loss.toFixed(4)}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="4" className="waiting-process" >
                              Menunggu proses mulai...
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION 2: FINAL EVALUATION TABLE (PREVIOUS LAYOUT DESIGN) */}
      <h3>Result Ratio</h3>
      <div className="table-wrapper">
        <table className="result-table" style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th rowSpan="2" className="tr-sub">Epochs</th>
              <th colSpan={testedRatios.length} className="th-head">Accuracy</th>
              <th colSpan={testedRatios.length} className="th-head">Precision</th>
              <th colSpan={testedRatios.length} className="th-head">Recall</th>
              <th colSpan={testedRatios.length} className="th-head">F1-Score</th>
            </tr>
            <tr className="tr-sub">
              {/* Accuracy columns */}
              {testedRatios.map(r => <th key={`acc-${r.idRatioDataSplit}`}>{r.trainRatio}</th>)}
              {/* Precision columns */}
              {testedRatios.map(r => <th key={`pre-${r.idRatioDataSplit}`}>{r.trainRatio}</th>)}
              {/* Recall columns */}
              {testedRatios.map(r => <th key={`rec-${r.idRatioDataSplit}`}>{r.trainRatio}</th>)}
              {/* F1-Score columns */}
              {testedRatios.map(r => <th key={`f1-${r.idRatioDataSplit}`}>{r.trainRatio}</th>)}
            </tr>
          </thead>
          <tbody>
            {testedRatios.length > 0 ? (
              <>
                {/* Row 1: Epoch 1 */}
                <tr className="text-center">
                  <td>1</td>
                  {/* Accuracy Epoch 1 */}
                  {testedRatios.map(r => {
                    const logs = liveProgress[r.trainRatio] || [];
                    const valAcc = logs[0]?.val_accuracy;
                    return <td key={`acc-1-${r.idRatioDataSplit}`}>{valAcc !== undefined ? `${(valAcc * 100).toFixed(0)}%` : "-"}</td>;
                  })}
                  {/* Precision Epoch 1 (Keras only calculates valAcc/valLoss per epoch) */}
                  {testedRatios.map(r => <td key={`pre-1-${r.idRatioDataSplit}`} >-</td>)}
                  {/* Recall Epoch 1 */}
                  {testedRatios.map(r => <td key={`rec-1-${r.idRatioDataSplit}`} >-</td>)}
                  {/* F1 Epoch 1 */}
                  {testedRatios.map(r => <td key={`f1-1-${r.idRatioDataSplit}`} >-</td>)}
                </tr>

                {/* Row 2: Epoch 2 dst. */}
                <tr className="text-center">
                  <td>2 dst.</td>
                  {/* Accuracy Epoch 2 dst. (last epoch val accuracy) */}
                  {testedRatios.map(r => {
                    const logs = liveProgress[r.trainRatio] || [];
                    if (logs.length > 1) {
                      const lastValAcc = logs[logs.length - 1]?.val_accuracy;
                      return <td key={`acc-2-${r.idRatioDataSplit}`} >{lastValAcc !== undefined ? `${(lastValAcc * 100).toFixed(0)}%` : "-"}</td>;
                    }
                    return <td key={`acc-2-${r.idRatioDataSplit}`} >-</td>;
                  })}
                  {/* Precision Epoch 2 dst. */}
                  {testedRatios.map(r => <td key={`pre-2-${r.idRatioDataSplit}`} >-</td>)}
                  {/* Recall Epoch 2 dst. */}
                  {testedRatios.map(r => <td key={`rec-2-${r.idRatioDataSplit}`} >-</td>)}
                  {/* F1 Epoch 2 dst. */}
                  {testedRatios.map(r => <td key={`f1-2-${r.idRatioDataSplit}`} >-</td>)}
                </tr>

                {/* Row 3: Average (Final Evaluation metrics from DB) */}
                <tr className="text-center">
                  <td >Average</td>
                  {/* Final Accuracy */}
                  {testedRatios.map(r => <td key={`acc-avg-${r.idRatioDataSplit}`} style={{  color: r.bestRatio ? "#dd6b20" : "inherit" }}>{r.accuracy !== null ? `${(r.accuracy * 100).toFixed(0)}%` : "-"}</td>)}
                  {/* Final Precision */}
                  {testedRatios.map(r => <td key={`pre-avg-${r.idRatioDataSplit}`} >{r.precision !== null ? `${(r.precision * 100).toFixed(0)}%` : "-"}</td>)}
                  {/* Final Recall */}
                  {testedRatios.map(r => <td key={`rec-avg-${r.idRatioDataSplit}`} >{r.recall !== null ? `${(r.recall * 100).toFixed(0)}%` : "-"}</td>)}
                  {/* Final F1-Score */}
                  {testedRatios.map(r => <td key={`f1-avg-${r.idRatioDataSplit}`} >{r.f1score !== null ? `${(r.f1score * 100).toFixed(0)}%` : "-"}</td>)}
                </tr>
              </>
            ) : (
              <tr>
                <td colSpan={1 + (testedRatios.length || 1) * 4} style={{ textAlign: "center",  color: "#718096" }}>
                  Belum ada data pengujian. Silakan masukkan parameter di atas dan jalankan pengujian.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {bestRatioItem && (
        <div className="best-ratio-result" >
          <p>
            ⭐ Best Ratio Data Split = {bestRatioItem.trainRatio} (Accuracy: {(bestRatioItem.accuracy * 100).toFixed(2)}%)
          </p>
        </div>
      )}
      
      {/* Mini keyframe style hack for CSS animations in React */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}

export default ResultRatio;