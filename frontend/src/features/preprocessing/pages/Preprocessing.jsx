import React, { useState, useEffect } from "react";
import ListsDataset from "../components/ListsDataset";
import ParameterSetting from "../components/ParameterSetting";

import { get_all_datasets } from "../../../shared/utils/general_api";
import { 
  run_preprocessing, 
  get_preprocessing_status
} from "../utils/preprocessing_api";

import "./Preprocessing.scss";

function PreprocessingPage() {
  const [datasets, setDatasets] = useState([]);
  const [selectedDatasetId, setSelectedDatasetId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState(null);

  const [config, setConfig] = useState({
    target_frame: 60,
  });

  const loadDatasets = async () => {
    try {
      const response = await get_all_datasets();
      if (!response || !Array.isArray(response)) {
        setDatasets([]);
      } else {
        setDatasets(response);
      }
    } catch (err) {
      console.error("Error fetching data", err);
      setDatasets([]);
    }
  };

  useEffect(() => {
    loadDatasets();
  }, []);

  useEffect(() => {
    setResult(null);
    setError(null);
    setStatus(null);

    if (!selectedDatasetId) return;
    async function loadStatus() {
      try {
        const data = await get_preprocessing_status(selectedDatasetId);
        setStatus(data);
      } catch (err) {
        console.error(err);
        setStatus(null);
      }
    }
    loadStatus();
  }, [selectedDatasetId]);

  const handleStartPreprocessing = async () => {
    if (!selectedDatasetId) return;

    setIsLoading(true);
    setResult(null);
    setError(null);

    try {
      const response = await run_preprocessing(selectedDatasetId, config);
      setResult(response.data);

      localStorage.setItem(
        `preprocessing-result-${selectedDatasetId}`,
        JSON.stringify(response.data)
      );

      const newStatus = await get_preprocessing_status(selectedDatasetId);
      setStatus(newStatus);
      await loadDatasets();
    } catch (err) {
      setError(err.message || "Terjadi kesalahan saat preprocessing");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedDatasetId) return;

    const saved = localStorage.getItem(
      `preprocessing-result-${selectedDatasetId}`
    );

    if (saved) {
      setResult(JSON.parse(saved));
    } else {
      setResult(null);
    }

  }, [selectedDatasetId]);

  // Hitung info status
  const allPreprocessed = status && status.remaining === 0 && status.totalVideo > 0;
  const progressPercent = status && status.totalVideo > 0
    ? Math.round((status.preprocessed / status.totalVideo) * 100)
    : 0;

  return (
    <div className="content preprocessing-admin">
      <h1>Prapemrosesan Data</h1>

      <div className="lists-dataset">
        <div className="pengantar">
          <h2>Daftar Dataset</h2>
          <p className="desc">Pilih dataset yang ingin diproses.</p>
        </div>
        <ListsDataset
          datasets={datasets}
          selectedDatasetId={selectedDatasetId}
          onSelectDataset={setSelectedDatasetId}
        />
      </div>

      {/* Banner informasi status data */}
      {selectedDatasetId && status && (
        <div className={`preprocessing-banner ${allPreprocessed ? "banner-done" : "banner-pending"}`}>
          {allPreprocessed ? (
            <>
              <span className="banner-icon">✅</span>
              <div>
                <strong>Semua data sudah dipraproses.</strong>
                <p>Total {status.totalVideo} video pada dataset ini telah selesai diproses.</p>
              </div>
            </>
          ) : (
            <>
              <span className="banner-icon">⚠️</span>
              <div>
                <strong>Terdapat {status.remaining} data yang belum dipraproses.</strong>
                <p>
                  Dari total {status.totalVideo} video, {status.preprocessed} sudah diproses dan{" "}
                  <strong>{status.remaining}</strong> belum diproses.
                  Klik tombol di bawah untuk memproses data yang belum selesai.
                </p>
              </div>
            </>
          )}
        </div>
      )}

      <ParameterSetting
        config={config}
        onConfigChange={setConfig}
        onStartPreprocessing={handleStartPreprocessing}
        isLoading={isLoading}
        selectedDatasetId={selectedDatasetId}
        isDisabled={!selectedDatasetId || allPreprocessed || isLoading}
      />

      <div className="section result">
        <h2>
          {result ? "Hasil Prapemrosesan" : "Status Prapemrosesan"}
        </h2>

        {/* Status Section — tampil kalau belum ada hasil preprocessing baru */}
        {status && !result && (
          <div className="dataset-status">
            <h3>Status Dataset</h3>
            <p>
              <strong>Total Video :</strong> {status.totalVideo}
            </p>
            <p>
              <strong>Sudah Dipraproses :</strong> {status.preprocessed}
            </p>
            <p>
              <strong>Belum Dipraproses :</strong>{" "}
              <span style={{
                color: status.remaining > 0 ? "#e07b00" : "inherit",
                fontWeight: status.remaining > 0 ? "bold" : "normal"
              }}>
                {status.remaining}
              </span>
            </p>
            <p>
              <strong>Progress :</strong>{" "}
              <span style={{
                color: progressPercent === 100 ? "#2e7d32" : "#e07b00",
                fontWeight: "bold"
              }}>
                {progressPercent}%
              </span>
            </p>

            {/* Progress bar */}
            <div style={{
              marginTop: "10px",
              background: "#e0e0e0",
              borderRadius: "8px",
              height: "10px",
              width: "100%",
              maxWidth: "400px"
            }}>
              <div style={{
                width: `${progressPercent}%`,
                height: "100%",
                borderRadius: "8px",
                background: progressPercent === 100 ? "#2e7d32" : "#f59e0b",
                transition: "width 0.4s ease"
              }} />
            </div>
          </div>
        )}

        {/* Result Section */}
        {result && (
          <div className="result-section result-success">
            <div>
              <h3>Preprocessing Berhasil</h3>
              <div className="result-details">
                <p>
                  <strong>Dataset:</strong> {result.dataset.datasetName}
                </p>
                <p>
                  <strong>Total Berhasil:</strong> {result.processed}
                </p>
                <p>
                  <strong>Total Gagal:</strong> {result.failed}
                </p>
              </div>
            </div>
            <div>
              <h4>Detail</h4>
              <table>
                <thead>
                  <tr>
                    <th>Video</th>
                    <th>Frame Awal</th>
                    <th>Frame Akhir</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {result.results?.map((item, index) => {
                    if (!item) return null;
                    return (
                      <tr key={index}>
                        <td>
                          {item.input_path
                            ? item.input_path.split(/[/\\]/).pop()
                            : "-"}
                        </td>
                        <td>{item.original_frame_count ?? "-"}</td>
                        <td>{item.processed_frame_count ?? "-"}</td>
                        <td>{item.error ? "❌" : "✅"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Error Section */}
        {error && (
          <div className="result-section result-error">
            <h3>Preprocessing Gagal</h3>
            <p>{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default PreprocessingPage;