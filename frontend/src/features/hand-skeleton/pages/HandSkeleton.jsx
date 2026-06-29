import React, { useState, useEffect } from "react";
import InfoConfiguration from "../components/InfoConfiguration";
import InfoOutput from "../components/InfoOutput";
import ListsDataPrep from "../components/ListsDataPrep";
import ListsLandmark from "../components/ListsLandmark";

import {
  get_datasets_preprocess,
  get_datasets_landmarks,
  run_processing,
  get_processing_status,
} from "../utils/hand_skeleton_api";

const CONFIG = {
  max_num_hands: 2,
  min_detection_confidence: 0.5,
  min_tracking_confidence: 0.5,
  min_detection_ratio: 0.9,
};

function HandSkeleton() {
  const [datasets, setDatasets] = useState([]);
  const [landmarks, setLandmarks] = useState([]);
  const [selectedDatasetId, setSelectedDatasetId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState(null);

  const fetchDatasets = async () => {
    try {
      const response = await get_datasets_preprocess();
      if (Array.isArray(response)) {
        setDatasets(response);
      }
    } catch (err) {
      console.error("Error fetching datasets:", err);
    }
  };

  const fetchLandmarks = async () => {
    try {
      const response = await get_datasets_landmarks();
      if (Array.isArray(response)) {
        setLandmarks(response);
      }
    } catch (err) {
      console.error("Error fetching landmarks:", err);
    }
  };

  useEffect(() => {
    fetchDatasets();
    fetchLandmarks();
  }, []);

  const handleStartProcessing = async () => {
    if (!selectedDatasetId) return;

    setIsLoading(true);
    setResult(null);
    setError(null);

    try {
      const response = await run_processing(selectedDatasetId, CONFIG);
      setResult(response.data);

      const statusResponse = await get_processing_status(selectedDatasetId);
      setStatus(statusResponse?.data ?? statusResponse);

      // Refresh kedua tabel setelah proses selesai
      await fetchDatasets();
      await fetchLandmarks();
    } catch (err) {
      setError(err.message || "Terjadi kesalahan saat ekstraksi");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="content hand-skeleton-page">
      <h1>Hand Skeleton</h1>

      <InfoConfiguration config={CONFIG} />
      <InfoOutput />

      <div className="section-dataset">
        <h2>Dataset</h2>
        <ListsDataPrep
          datasets={datasets}
          selectedDatasetId={selectedDatasetId}
          onSelectDataset={setSelectedDatasetId}
        />
      </div>

      <div className="section process-landmark">
        <h2>Detail Landmark</h2>
        <ListsLandmark datasets={landmarks} />
      </div>

      <div className="btn">
        <button
          className="button"
          onClick={handleStartProcessing}
          disabled={isLoading || !selectedDatasetId}
        >
          {isLoading ? "Sedang Mengekstraksi..." : "Ekstraksi Hand Skeleton"}
        </button>
      </div>

      {status && (
        <div className="dataset-status">
          <h3>Status Dataset</h3>
          <p>
            <strong>Total Video :</strong>
            {status.totalVideo}
          </p>
          <p>
            <strong>Sudah Diproses :</strong>
            {status.processed}
          </p>
          <p>
            <strong>Belum Diproses :</strong>
            {status.remaining}
          </p>
        </div>
      )}

      {/* Result Section */}
      {result && (
        <div className="result-section result-success">
          <div>
            <h3>Ekstraksi Hand Skeleton Berhasil</h3>
            <div className="result-details">
              <p>
                <strong>Dataset:</strong> {result.dataset_name}
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
                  <th>Total Frame</th>
                  <th>Frame Terdeteksi</th>
                  <th>Rasio Deteksi</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {result.results?.map((item, index) => (
                  <tr key={index}>
                    <td>
                      {item.input_path
                        ? item.input_path.split(/[/\\]/).pop()
                        : "-"}
                    </td>
                    <td>{item.frame_count ?? "-"}</td>
                    <td>{item.detected_frames ?? "-"}</td>
                    <td>
                      {item.detection_ratio != null
                        ? `${(item.detection_ratio * 100).toFixed(1)}%`
                        : "-"}
                    </td>
                    <td>{item.success ? "✅" : "❌"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Error Section */}
      {error && (
        <div className="result-section result-error">
          <h3>Ekstraksi Hand Skeleton Gagal</h3>
          <p>{error}</p>
        </div>
      )}
    </div>
  );
}

export default HandSkeleton;