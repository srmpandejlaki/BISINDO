import React from "react";

function ResultRatio({ ratios, liveProgress, testingStatus, currentRatioTesting, currentEpochsConfig }) {
  const testedRatios = ratios.filter((item) => item.accuracy !== null && item.accuracy !== undefined);
  const bestRatioItem = ratios.find((item) => item.bestRatio === true);

  let numEpochs = 0;
  if (testingStatus === "testing" && currentEpochsConfig) {
    numEpochs = currentEpochsConfig;
  } else if (testedRatios.length > 0) {
    numEpochs = parseInt(testedRatios[0].epochs) || 1;
  } else {
    numEpochs = 10;
  }

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
                {Array.from({ length: numEpochs }, (_, i) => {
                  const epochNum = i + 1;
                  return (
                    <tr key={`epoch-${epochNum}`} className="text-center">
                      <td>{epochNum}</td>
                      {/* Accuracy per ratio */}
                      {testedRatios.map((r) => {
                        const logs = liveProgress[r.trainRatio] || [];
                        const valAcc = logs.find((l) => l.epoch === epochNum)?.val_accuracy;
                        return (
                          <td key={`acc-${epochNum}-${r.idRatioDataSplit}`}>
                            {valAcc !== undefined ? `${(valAcc * 100).toFixed(0)}%` : "-"}
                          </td>
                        );
                      })}
                      {/* Precision per ratio */}
                      {testedRatios.map((r) => (
                        <td key={`pre-${epochNum}-${r.idRatioDataSplit}`}>-</td>
                      ))}
                      {/* Recall per ratio */}
                      {testedRatios.map((r) => (
                        <td key={`rec-${epochNum}-${r.idRatioDataSplit}`}>-</td>
                      ))}
                      {/* F1-Score per ratio */}
                      {testedRatios.map((r) => (
                        <td key={`f1-${epochNum}-${r.idRatioDataSplit}`}>-</td>
                      ))}
                    </tr>
                  );
                })}

                {/* Average (Final Evaluation metrics from DB) */}
                <tr className="text-center">
                  <td>Average</td>
                  {/* Final Accuracy */}
                  {testedRatios.map((r) => (
                    <td
                      key={`acc-avg-${r.idRatioDataSplit}`}
                      style={{ fontWeight: r.bestRatio ? "bold" : "inherit" }}
                    >
                      {r.accuracy !== null ? `${(r.accuracy * 100).toFixed(0)}%` : "-"}
                    </td>
                  ))}
                  {/* Final Precision */}
                  {testedRatios.map((r) => (
                    <td key={`pre-avg-${r.idRatioDataSplit}`}>
                      {r.precision !== null ? `${(r.precision * 100).toFixed(0)}%` : "-"}
                    </td>
                  ))}
                  {/* Final Recall */}
                  {testedRatios.map((r) => (
                    <td key={`rec-avg-${r.idRatioDataSplit}`}>
                      {r.recall !== null ? `${(r.recall * 100).toFixed(0)}%` : "-"}
                    </td>
                  ))}
                  {/* Final F1-Score */}
                  {testedRatios.map((r) => (
                    <td key={`f1-avg-${r.idRatioDataSplit}`}>
                      {r.f1score !== null ? `${(r.f1score * 100).toFixed(0)}%` : "-"}
                    </td>
                  ))}
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