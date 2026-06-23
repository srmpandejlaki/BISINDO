import React, { useRef } from "react";

function TestingPreparation({
  models,
  selectedModelId,
  setSelectedModelId,
  selectedModel,
  testingMode,
  setTestingMode,
  uploadFile,
  setUploadFile,
  onStartTesting,
  isLoading
}) {
  const fileInputRef = useRef(null);

  // Calculate test size dynamically based on ratio
  let testPercent = 0.2;
  if (selectedModel && selectedModel.trainRatio) {
    try {
      const parts = selectedModel.trainRatio.split(":");
      if (parts.length === 2) {
        const tr = parseFloat(parts[0]);
        const ts = parseFloat(parts[1]);
        testPercent = ts / (tr + ts);
      }
    } catch (e) {
      console.error("Ratio parsing error:", e);
    }
  }

  const totalTestData = selectedModel ? Math.round(selectedModel.totalData * testPercent) : 0;

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setUploadFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setUploadFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="testing-preparation" style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
      <h3 style={{ margin: 0, color: "#333", fontSize: "1.2rem", fontWeight: "600" }}>Testing Preparation</h3>

      {/* Model Selection */}
      <div className="option-model" style={{ marginBlock: "5px" }}>
        <label htmlFor="model" style={{ fontWeight: "500", marginBottom: "5px", display: "block" }}>Model:</label>
        <select
          name="model"
          id="model"
          value={selectedModelId}
          onChange={(e) => {
            setSelectedModelId(e.target.value);
            setUploadFile(null); // Clear file on model change
          }}
          disabled={isLoading}
          style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
        >
          {models.map((m) => (
            <option key={m.idTraining} value={m.idTraining}>
              {m.modelName} (Acc: {(m.accuracy * 100).toFixed(1)}%)
            </option>
          ))}
          {models.length === 0 && <option value="">Tidak ada model tersedia</option>}
        </select>
      </div>

      {/* Mode Selection */}
      <div className="option-mode" style={{ marginBlock: "5px" }}>
        <label htmlFor="testing-mode" style={{ fontWeight: "500", marginBottom: "5px", display: "block" }}>Testing Mode:</label>
        <select
          name="testing-mode"
          id="testing-mode"
          value={testingMode}
          onChange={(e) => {
            setTestingMode(e.target.value);
            setUploadFile(null); // Clear file on mode change
          }}
          disabled={isLoading}
          style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
        >
          <option value="dataset">Menggunakan Dataset Uji</option>
          <option value="upload">Upload File (.npy / Video)</option>
        </select>
      </div>

      {/* Total Data Info (Dataset Mode) */}
      {testingMode === "dataset" && (
        <div className="total-data" style={{ padding: "10px", backgroundColor: "#e9ecef", borderRadius: "4px" }}>
          <p style={{ margin: 0, fontSize: "0.9rem", color: "#495057" }}>
            <strong>Total Data Uji:</strong> {totalTestData}
          </p>
          {selectedModel && (
            <p style={{ margin: "5px 0 0 0", fontSize: "0.8rem", color: "#6c757d" }}>
              Dataset: {selectedModel.datasetName} | Ratio: {selectedModel.trainRatio} (Test: {(testPercent * 100).toFixed(0)}%)
            </p>
          )}
        </div>
      )}

      {/* File Upload Box (Upload Mode) */}
      {testingMode === "upload" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
          <label style={{ fontWeight: "500" }}>Upload File:</label>
          <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: "2px dashed #007bff",
              borderRadius: "6px",
              padding: "20px",
              textAlign: "center",
              cursor: "pointer",
              backgroundColor: uploadFile ? "#e3f2fd" : "#fff",
              transition: "background-color 0.2s"
            }}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".npy,.mp4,.avi"
              style={{ display: "none" }}
            />
            {uploadFile ? (
              <div>
                <p style={{ margin: 0, fontWeight: "600", color: "#007bff", wordBreak: "break-all" }}>
                  {uploadFile.name}
                </p>
                <p style={{ margin: "5px 0 0 0", fontSize: "0.8rem", color: "#6c757d" }}>
                  {(uploadFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            ) : (
              <div>
                <p style={{ margin: 0, color: "#6c757d" }}>Tarik berkas atau klik untuk mengunggah</p>
                <p style={{ margin: "5px 0 0 0", fontSize: "0.75rem", color: "#adb5bd" }}>
                  Mendukung .npy (keypoint) atau video (.mp4/.avi)
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      <button
        className="start-testing"
        onClick={onStartTesting}
        disabled={isLoading || models.length === 0}
        style={{
          width: "100%",
          padding: "10px",
          backgroundColor: isLoading ? "#6c757d" : "#28a745",
          color: "#fff",
          border: "none",
          borderRadius: "4px",
          fontWeight: "600",
          cursor: isLoading || models.length === 0 ? "not-allowed" : "pointer",
          marginTop: "10px",
          justifyContent: "center",
          alignItems: "center"
        }}
      >
        {isLoading ? "Running Test..." : "Start Testing"}
      </button>
    </div>
  );
}

export default TestingPreparation;