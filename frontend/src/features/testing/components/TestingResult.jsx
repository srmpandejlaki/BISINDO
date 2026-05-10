import React from "react";

function TestingResult() {
  return (
    <div className="testing-result">
      <h4>Testing Result</h4>
      <p>This is a placeholder for the Testing Result page.</p>
      <table>
        <thead>
          <tr>
            <th>No.</th>
            <th>Name</th>
            <th>Label Asli</th>
            <th>Prediksi</th>
            <th>Confidence</th>
            <th>Keterangan</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>1</td>
            <td>Data 1</td>
            <td>A</td>
            <td>A</td>
            <td>92%</td>
            <td>Benar</td>
          </tr>
          <tr>
            <td>2</td>
            <td>Data 2</td>
            <td>B</td>
            <td>B</td>
            <td>85%</td>
            <td>Benar</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default TestingResult;