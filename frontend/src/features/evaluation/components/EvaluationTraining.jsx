import React from "react";

function EvaluationTraining() {
  return (
    <div className="evaluation-training">
      <h3>Evaluation Training</h3>
      <p>This is a placeholder for the Evaluation Training component.</p>
      <div className="tabel-evaluasi">
        <table>
          <thead>
            <tr>
              <th>Accuracy</th>
              <th>Precision</th>
              <th>Recall</th>
              <th>F1-Score</th>
              <th>Macro Average</th>
              <th>Weighted Average</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>0.90</td>
              <td>0.88</td>
              <td>0.92</td>
              <td>0.90</td>
              <td>0.90</td>
              <td>0.90</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="confusion-metrix">
        <h3>Confusion Matrix</h3>
        <p>This is a placeholder for the Confusion Matrix component.</p>
      </div>
    </div>
  );
}

export default EvaluationTraining;