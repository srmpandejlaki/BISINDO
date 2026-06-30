import React from "react";

function ResultRatio({
  ratios,
  liveProgress,
  testingStatus,
  currentRatioTesting,
  currentepochConfig,
}) {
  const testedRatios = ratios.filter(
    (item) => item.accuracy !== null && item.accuracy !== undefined
  );

  const bestRatioItem = ratios.find((item) => item.bestRatio === true);

  let numepoch = 0;

  if (testingStatus === "testing" && currentepochConfig) {
    numepoch = currentepochConfig;
  } else if (testedRatios.length > 0) {
    numepoch = parseInt(testedRatios[0].epoch) || 1;
  } else {
    numepoch = 10;
  }

  return (
    <div className="result-ratio-section">
      {/* ================= LIVE TRAINING ================= */}
      {(testingStatus === "testing" ||
        Object.keys(liveProgress).length > 0) && (
        <div className="live-processes-wrapper">
          <h3>Proses Training Per Ratio</h3>

          <div className="live-processes">
            {Object.keys(liveProgress).map((ratioName) => {
              const logs = liveProgress[ratioName] || [];
              const isCurrent =
                currentRatioTesting === ratioName &&
                testingStatus === "testing";

              return (
                <div key={ratioName} className="table-process">
                  <h4>
                    <span>
                      Ratio Split: <strong>{ratioName}</strong>
                    </span>

                    {isCurrent && (
                      <span className="running">⚡ Running...</span>
                    )}
                  </h4>

                  <div className="table-wrapper">
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
                            <td
                              colSpan="4"
                              className="waiting-process"
                            >
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

      {/* ================= ACCURACY ================= */}
      <h3>Accuracy</h3>

      <div className="table-wrapper">
        <table
          className="result-table"
          style={{ width: "100%", borderCollapse: "collapse" }}
        >
          <thead>
            <tr>
              <th>Epoch</th>

              {testedRatios.map((r) => (
                <th key={r.idRatioDataSplit}>{r.trainRatio}</th>
              ))}
            </tr>
          </thead>

          <tbody>
            {testedRatios.length > 0 ? (
              <>
                {Array.from({ length: numepoch }, (_, i) => {
                  const epochNum = i + 1;

                  return (
                    <tr key={epochNum} className="text-center">
                      <td>{epochNum}</td>

                      {testedRatios.map((r) => {
                        const logs = liveProgress[r.trainRatio] || [];
                        const valAcc = logs.find(
                          (l) => l.epoch === epochNum
                        )?.val_accuracy;

                        return (
                          <td
                            key={`${epochNum}-${r.idRatioDataSplit}`}
                          >
                            {valAcc !== undefined
                              ? `${(valAcc * 100).toFixed(0)}%`
                              : "-"}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}

                <tr className="text-center">
                  <td>
                    <strong>Average</strong>
                  </td>

                  {testedRatios.map((r) => (
                    <td
                      key={r.idRatioDataSplit}
                      style={{
                        fontWeight: r.bestRatio
                          ? "bold"
                          : "inherit",
                      }}
                    >
                      {r.accuracy !== null
                        ? `${(r.accuracy * 100).toFixed(0)}%`
                        : "-"}
                    </td>
                  ))}
                </tr>
              </>
            ) : (
              <tr>
                <td
                  colSpan={testedRatios.length + 1}
                  style={{
                    textAlign: "center",
                    color: "#718096",
                  }}
                >
                  Belum ada data pengujian. Silakan masukkan
                  parameter di atas dan jalankan pengujian.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ================= PERFORMANCE METRICS ================= */}
      <h3>Performance Metrics</h3>

      <div className="table-wrapper">
        <table
          className="result-table"
          style={{ width: "100%", borderCollapse: "collapse" }}
        >
          <thead>
            <tr>
              <th>Metric</th>

              {testedRatios.map((r) => (
                <th key={r.idRatioDataSplit}>{r.trainRatio}</th>
              ))}
            </tr>
          </thead>

          <tbody>
            <tr className="text-center">
              <td>Precision</td>

              {testedRatios.map((r) => (
                <td key={`pre-${r.idRatioDataSplit}`}>
                  {r.precision !== null
                    ? `${(r.precision * 100).toFixed(0)}%`
                    : "-"}
                </td>
              ))}
            </tr>

            <tr className="text-center">
              <td>Recall</td>

              {testedRatios.map((r) => (
                <td key={`rec-${r.idRatioDataSplit}`}>
                  {r.recall !== null
                    ? `${(r.recall * 100).toFixed(0)}%`
                    : "-"}
                </td>
              ))}
            </tr>

            <tr className="text-center">
              <td>F1-Score</td>

              {testedRatios.map((r) => (
                <td key={`f1-${r.idRatioDataSplit}`}>
                  {r.f1score !== null
                    ? `${(r.f1score * 100).toFixed(0)}%`
                    : "-"}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* ================= BEST RATIO ================= */}
      {bestRatioItem && (
        <div className="best-ratio-result">
          <p>
            ⭐ Best Ratio Data Split = {bestRatioItem.trainRatio}
            {" "}
            (Accuracy:{" "}
            {(bestRatioItem.accuracy * 100).toFixed(2)}%)
          </p>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%,100%{
            opacity:1;
          }
          50%{
            opacity:.5;
          }
        }
      `}</style>
    </div>
  );
}

export default ResultRatio;