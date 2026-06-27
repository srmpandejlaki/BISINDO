import React from "react";

function ParameterSetting({
  config,
  onConfigChange,
  onStartPreprocessing,
  isLoading,
  selectedDatasetId,
}) {
  const handleChange = (key, value) => {
    onConfigChange({ ...config, [key]: value });
  };

  return (
    <div className="parameter-setting">
      <div className="pengantar">
        <h2>Konfigurasi Parameter Prapemrosesan Data</h2>
        <p className="desc">
          Konfigurasi berikut digunakan untuk memproses data yang telah diupload. <span>Pengaturan ini tidak bisa diubah.</span>
        </p>
      </div>

      <div className="params-grid">
        {/* === Data Config === */}
        <div className="param-group">
          <h4 className="group-title">Konfigurasi Data</h4>
          <div className="param-row">
            <label>Sequence Length</label>
            <input
              type="number"
              min="1"
              value={config.sequence_length}
              onChange={(e) =>
                handleChange("sequence_length", parseInt(e.target.value) || 1)
              }
            />
          </div>

          <div className="param-row">
            <label>Feature Size</label>
            <input
              type="number"
              min="1"
              value={config.feature_size}
              onChange={(e) =>
                handleChange("feature_size", parseInt(e.target.value) || 1)
              }
            />
          </div>
        </div>


        {/* === Preprocessing Config === */}
        <div className="param-group">
          <div className="pengantar margin-bottom">
            <h4 className="group-title">Normalisasi</h4>
            <p className="desc">Tahap untuk menyamakan representasi data skeleton tangan.</p>
          </div>
          <div className="param-row toggle-row">
            <label>Normalisasi Ukuran Tangan</label>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={config.use_normalize_scale}
                onChange={(e) =>
                  handleChange("use_normalize_scale", e.target.checked)
                }
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="param-row toggle-row">
            <label>Normalisasi Posisi</label>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={config.use_normalize_wrist}
                onChange={(e) =>
                  handleChange("use_normalize_wrist", e.target.checked)
                }
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>

        <div className="param-group">
          <div className="pengantar margin-bottom">
            <h4 className="group-title">Penyesuaian Sequence</h4>
            <p className="desc">
              LSTM membutuhkan panjang sequence yang konsisten.
            </p>
          </div>
          <div className="param-row toggle-row">
            <label>Zero Padding</label>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={config.use_pad_sequence}
                onChange={(e) =>
                  handleChange("use_pad_sequence", e.target.checked)
                }
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>
      </div>

      <div className="param-group">
        <div className="pengantar margin-bottom">
          <h4 className="group-title">Augmentasi Data</h4>
          <p className="desc">
            Tahap untuk menambah variasi data training.
          </p>
        </div>
        
        <div className="toggle-input-container">
          <div className="toggle-input">
            <div className="param-row toggle-row">
              <label>Tambah Noise Guissian</label>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={config.use_add_noise}
                  onChange={(e) =>
                    handleChange("use_add_noise", e.target.checked)
                  }
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
            <div
              className={`augmentation-params ${
                !config.use_add_noise ? "disabled-section" : ""
              }`}
            >
              <div className="param-row">
                <label>Noise Level</label>
                <input
                  type="number"
                  step="0.001"
                  min="0.001"
                  max="0.05"
                  value={config.noise_level}
                  disabled={!config.use_add_noise}
                  onChange={(e) =>
                    handleChange("noise_level", parseFloat(e.target.value) || 0.01)
                  }
                />
              </div>
            </div>
          </div>
            
          <div className="toggle-input">
            <div className="param-row toggle-row">
              <label>Scaling Acak</label>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={config.use_random_scale}
                  onChange={(e) =>
                    handleChange("use_random_scale", e.target.checked)
                  }
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
            <div
              className={`augmentation-params ${
                !config.use_random_scale ? "disabled-section" : ""
              }`}
            >
              <div className="param-row">
                <label>Scale Range Min</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.5"
                  max="1.0"
                  value={config.scale_range_min}
                  disabled={!config.use_random_scale}
                  onChange={(e) =>
                    handleChange(
                      "scale_range_min",
                      parseFloat(e.target.value) || 0.9
                    )
                  }
                />
              </div>
              <div className="param-row">
                <label>Scale Range Max</label>
                <input
                  type="number"
                  step="0.01"
                  min="1.0"
                  max="1.5"
                  value={config.scale_range_max}
                  disabled={!config.use_random_scale}
                  onChange={(e) =>
                    handleChange(
                      "scale_range_max",
                      parseFloat(e.target.value) || 1.1
                    )
                  }
                />
              </div>
            </div>
          </div>

          <div className="toggle-input">
            <div className="param-row toggle-row">
              <label>Aktifkan Frame Dropout</label>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={config.use_frame_dropout}
                  onChange={(e) =>
                    handleChange("use_frame_dropout", e.target.checked)
                  }
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div
              className={`dropout-params ${
                !config.use_frame_dropout ? "disabled-section" : ""
              }`}
            >
              <div className="param-row">
                <label>Dropout Probability</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max="0.5"
                  value={config.frame_dropout_prob}
                  disabled={!config.use_frame_dropout}
                  onChange={(e) =>
                    handleChange(
                      "frame_dropout_prob",
                      parseFloat(e.target.value) || 0.1
                    )
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* === Action Button === */}
      <div className="action-section">
        <button
          className="button btn-start-preprocessing"
          onClick={onStartPreprocessing}
          disabled={isLoading || !selectedDatasetId}
        >
          {isLoading ? "Sedang Memproses..." : "Mulai Preprocessing"}
        </button>
        {!selectedDatasetId && (
          <p className="hint-text">Pilih dataset terlebih dahulu</p>
        )}
      </div>
    </div>
  );
}

export default ParameterSetting;