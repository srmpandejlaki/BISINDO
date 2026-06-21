import React from "react";

function ResultRatio() {
  return (
    <div>
      <h3>Result Ratio</h3>
      <div className="table-wrapper">
        <table className="result-table">
          <thead>
            <tr>
              <th rowSpan="2">Epochs</th>

              <th colSpan="2">Accuracy</th>
              <th colSpan="2">Precision</th>
              <th colSpan="2">Recall</th>
              <th colSpan="2">F1-Score</th>
            </tr>

            <tr>
              <th>80:10:10</th>
              <th>70:15:15</th>

              <th>80:10:10</th>
              <th>70:15:15</th>

              <th>80:10:10</th>
              <th>70:15:15</th>

              <th>80:10:10</th>
              <th>70:15:15</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td>1</td>

              <td>80%</td>
              <td>83%</td>

              <td>78%</td>
              <td>80%</td>

              <td>79%</td>
              <td>81%</td>

              <td>80%</td>
              <td>78%</td>
            </tr>

            <tr>
              <td>2 dst.</td>

              <td></td>
              <td></td>

              <td></td>
              <td></td>

              <td></td>
              <td></td>

              <td></td>
              <td></td>
            </tr>

            <tr>
              <td>Average</td>

              <td></td>
              <td></td>

              <td></td>
              <td></td>

              <td></td>
              <td></td>

              <td></td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="best-ratio-result">
        <p>Best Ratio Data Split = 80:10:10</p>
      </div>
    </div>
  );
}

export default ResultRatio;