import React from "react";

function TestingPreparation() {
  return (
    <div className="testing-preparation">
      <h4>Testing Preparation</h4>
      <div className="option-mode">
        <label htmlFor="testing-mode">Testing Mode:</label>
        <select name="testing-mode" id="testing-mode">
          <option value="">Menggunakan Dataset</option>
          <option value="">Upload File</option>
        </select>
      </div>
      <div className="total-data">
        <p>Total Data: 360</p>
      </div>
      <div className="option-model">
        <label htmlFor="model">Model:</label>
        <select name="model" id="model">
          <option value="">Model 1</option>
          <option value="">Model 2</option>
        </select>
      </div>
      <button className="start-testing">Start Testing</button>
    </div>
  );
}

export default TestingPreparation;