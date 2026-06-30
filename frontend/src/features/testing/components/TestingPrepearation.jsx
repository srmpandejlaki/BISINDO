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
    <div className="testing-preparation">
      <h3>Pengaturan Pengujian</h3>

      {/* Model Selection */}
      <div className="option-model" style={{ marginBlock: "5px" }}>
        <label htmlFor="model">Model:</label>
        <select
          name="model"
          id="model"
          value={selectedModelId}
          onChange={(e) => {
            setSelectedModelId(e.target.value);
            setUploadFile(null); // Clear file on model change
          }}
          disabled={isLoading}
        >
          {models.map((m) => (
            <option key={m.idTrainTest} value={m.idTrainTest}>
              {m.modelName} (Acc: {(m.accuracy * 100).toFixed(1)}%)
            </option>
          ))}
          {models.length === 0 && <option value="">Tidak ada model tersedia</option>}
        </select>
      </div>

      {/* Mode Selection */}
      <div className="option-mode">
        <label htmlFor="testing-mode">Testing Mode:</label>
        <select
          name="testing-mode"
          id="testing-mode"
          value={testingMode}
          onChange={(e) => {
            setTestingMode(e.target.value);
            setUploadFile(null); // Clear file on mode change
          }}
          disabled={isLoading}
        >
          <option value="dataset">Menggunakan Dataset Uji</option>
          <option value="upload">Upload File (.npy / Video)</option>
        </select>
      </div>

      {/* Total Data Info (Dataset Mode) */}
      {testingMode === "dataset" && (
        <div className="total-data">
          <p className="data-uji">
            <strong>Total Data Uji:</strong> {totalTestData}
          </p>
          {selectedModel && (
            <p className="dataset-name">
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
        className="button submit"
        onClick={onStartTesting}
        disabled={isLoading || models.length === 0}
        style={{
          cursor: isLoading || models.length === 0 ? "not-allowed" : "pointer",
        }}
      >
        {isLoading ? "Running Test..." : "Start Testing"}
      </button>
    </div>
  );
}

export default TestingPreparation;