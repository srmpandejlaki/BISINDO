import React from "react";

function ParameterTest() {
  return (
    <div className="parameter-test-ratio">
      <h3>Parameter untuk Pengujian Ratio Data Split Terbaik</h3>
      <form className="form-ratio">
        <div className="input">
          <label>Epochs:</label>
          <input type="number" placeholder="0" />
        </div>
        <div className="input">
          <label>Batch Size:</label>
          <input type="number" placeholder="0" />
        </div>
        <div className="input">
          <label>Learning Rate:</label>
          <input type="number" placeholder="0" />
        </div>
      </form>
      <button>Test</button>
    </div>
  );
}

export default ParameterTest;