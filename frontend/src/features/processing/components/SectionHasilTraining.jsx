import React from "react";

function SectionHasilTraining() {
  return (
    <div className="section-hasil-training">
      <h2>Hasil Training</h2>
      <div className="hasil-training">
        <table>
          <thead>
            <tr>
              <th>Epoch</th>
              <th>Akurasi</th>
              <th>Precision</th>
              <th>Recall</th>
              <th>F1-Score</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1</td>
              <td>0.9</td>
              <td>0.8</td>
              <td>0.7</td>
              <td>0.6</td>
            </tr>
            <tr>
              <td>2</td>
              <td>0.95</td>
              <td>0.85</td>
              <td>0.75</td>
              <td>0.65</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default SectionHasilTraining;