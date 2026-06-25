import React, { useState } from "react";

function ParameterTest({ runTestRatios, testingStatus, testingError }) {
  const [epochs, setEpochs] = useState("10");
  const [batchSize, setBatchSize] = useState("16");
  const [learningRate, setLearningRate] = useState("0.001");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!epochs || !batchSize || !learningRate) {
      alert("Semua parameter harus diisi!");
      return;
    }
    
    runTestRatios({
      epochs: parseInt(epochs),
      batch_size: parseInt(batchSize),
      learning_rate: parseFloat(learningRate),
    });
  };

  const isTesting = testingStatus === "testing";

  return (
    <div className="parameter-test-ratio">
      <h3>Parameter untuk Pengujian Ratio Data Split Terbaik</h3>
      <form className="form-ratio" onSubmit={handleSubmit}>
        <div className="input">
          <label>Epoch:</label>
          <input
            type="number"
            placeholder="10"
            value={epochs}
            onChange={(e) => setEpochs(e.target.value)}
            disabled={isTesting}
            min="1"
            required
          />
        </div>
        <div className="input">
          <label>Batch Size:</label>
          <input
            type="number"
            placeholder="16"
            value={batchSize}
            onChange={(e) => setBatchSize(e.target.value)}
            disabled={isTesting}
            min="1"
            required
          />
        </div>
        <div className="input">
          <label>Learning Rate:</label>
          <input
            type="number"
            step="0.0001"
            placeholder="0.001"
            value={learningRate}
            onChange={(e) => setLearningRate(e.target.value)}
            disabled={isTesting}
            min="0.0001"
            required
          />
        </div>
        <button className="button" type="submit" disabled={isTesting}>
          {isTesting ? "Menguji..." : "Mulai Pengujian"}
        </button>
      </form>

      {testingStatus === "testing" && (
        <div className="testing-indicator" style={{ marginTop: "15px", color: "#3182ce" }}>
          <span>⚙️ Proses training & pengujian model sedang berjalan secara real-time. Jangan tutup halaman ini...</span>
        </div>
      )}

      {testingStatus === "completed" && (
        <div className="testing-indicator" style={{ marginTop: "15px", color: "green" }}>
          <span>✅ Pengujian selesai! Hasil terbaru dapat dilihat pada tabel di bawah.</span>
        </div>
      )}

      {testingStatus === "error" && (
        <div className="testing-indicator" style={{ marginTop: "15px", color: "red" }}>
          <span>❌ Gagal: {testingError || "Terjadi kesalahan saat pengujian."}</span>
        </div>
      )}
    </div>
  );
}

export default ParameterTest;