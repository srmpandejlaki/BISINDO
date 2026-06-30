import React from "react";

function ParameterSetting({
  config,
  onConfigChange,
  onStartPreprocessing,
  isLoading,
  selectedDatasetId,
  isDisabled,
}) {
  const handleChange = (key, value) => {
    onConfigChange({ ...config, [key]: value });
  };

  return (
    <div className="parameter-setting">
      <div className="pengantar">
        <h2>Konfigurasi Parameter Prapemrosesan Data</h2>
        <p className="desc">
          Konfigurasi berikut digunakan untuk menyeragamkan 
          kualitas dan format video (terutama jumlah frame) 
          serta melakukan validasi. <br/><span>Pengaturan ini tidak 
          bisa diubah.</span>
        </p>
      </div>

      <div className="section">
        <div className="input">
          <label>Target Frame</label>
          <input
            type="number"
            min="1"
            value={config.target_frame}
            onChange={(e) => handleChange("target_frame", e.target.value)}
            disabled
          />
        </div>
      </div>

      <div className="action-section">
        <button
          className="button btn-start-preprocessing"
          onClick={onStartPreprocessing}
          disabled={isDisabled}
        >
          {isLoading ? "Sedang Memproses..." : "Mulai Preprocessing"}
        </button>
        {!selectedDatasetId && (
          <p className="hint-text">Pilih dataset terlebih dahulu</p>
        )}
        {selectedDatasetId && isDisabled && !isLoading && (
          <p className="hint-text" style={{ color: "#2e7d32" }}>
            ✅ Semua data pada dataset ini sudah dipraproses.
          </p>
        )}
      </div>
    </div>
  );
}

export default ParameterSetting;