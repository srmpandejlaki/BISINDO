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

  // Fetch status landmark saat dataset dipilih
  useEffect(() => {
    setResult(null);
    setError(null);
    setStatus(null);

    if (!selectedDatasetId) return;

    async function loadStatus() {
      try {
        const statusResponse = await get_processing_status(selectedDatasetId);
        setStatus(statusResponse?.data ?? statusResponse);
      } catch (err) {
        console.error("Error fetching status:", err);
        setStatus(null);
      }
    }
    loadStatus();
  }, [selectedDatasetId]);

  const handleStartProcessing = async () => {
    if (!selectedDatasetId) return;

    setIsLoading(true);
    setResult(null);
    setError(null);

    try {
      const response = await run_processing(selectedDatasetId, CONFIG);
      setResult(response.data);

      localStorage.setItem(
        `hand-skeleton-result-${selectedDatasetId}`,
        JSON.stringify(response.data)
      );

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

  useEffect(() => {
    if (!selectedDatasetId) return;

    const saved = localStorage.getItem(
      `hand-skeleton-result-${selectedDatasetId}`
    );

    if (saved) {
      setResult(JSON.parse(saved));
    } else {
      setResult(null);
    }

  }, [selectedDatasetId]);

  const allProcessed = status && status.remaining === 0 && status.totalVideo > 0;
  const progressPercent = status && status.totalVideo > 0
    ? Math.round((status.processed / status.totalVideo) * 100)
    : 0;

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

      {/* Banner informasi data belum diekstraksi landmark */}
      {selectedDatasetId && status && (
        <div className={`preprocessing-banner ${allProcessed ? "banner-done" : "banner-pending"}`} style={{ marginTop: "24px" }}>
          {allProcessed ? (
            <>
              <span className="banner-icon">✅</span>
              <div>
                <strong>Semua data landmark sudah diekstraksi.</strong>
                <p>Total {status.totalVideo} video pada dataset ini telah selesai diekstraksi skeletonnya.</p>
              </div>
            </>
          ) : (
            <>
              <span className="banner-icon">⚠️</span>
              <div>
                <strong>Terdapat {status.remaining} data yang belum diekstraksi landmark.</strong>
                <p>
                  Dari total {status.totalVideo} video preprocessed, {status.processed} sudah diekstraksi dan{" "}
                  <strong>{status.remaining}</strong> belum diekstraksi.
                  Klik tombol di bawah untuk mengekstraksi data yang belum selesai.
                </p>
              </div>
            </>
          )}
        </div>
      )}

      <div className="btn" style={{ marginTop: "20px" }}>
        <button
          className="button"
          onClick={handleStartProcessing}
          disabled={isLoading || !selectedDatasetId || allProcessed}
        >
          {isLoading ? "Sedang Mengekstraksi..." : "Ekstraksi Hand Skeleton"}
        </button>
        {selectedDatasetId && allProcessed && !isLoading && (
          <p className="hint-text" style={{ color: "#2e7d32", marginTop: "8px", fontSize: "0.85rem", fontWeight: "bold" }}>
            ✅ Semua data landmark pada dataset ini sudah diekstraksi.
          </p>
        )}
      </div>

      <div className="section process-landmark">
        <h2>Detail Landmark</h2>
        <ListsLandmark datasets={landmarks} />
      </div>

      {status && !result && (
        <div className="dataset-status" style={{ marginTop: "24px" }}>
          <h3>Status Dataset</h3>
          <p>
            <strong>Total Video :</strong> {status.totalVideo}
          </p>
          <p>
            <strong>Sudah Diproses :</strong> {status.processed}
          </p>
          <p>
            <strong>Belum Diproses :</strong>{" "}
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
        <div className="result-section result-success" style={{ marginTop: "24px" }}>
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
                  <th>Sequence Length</th>
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
                    <td>{item.sequence_length ?? "-"}</td>
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
        <div className="result-section result-error" style={{ marginTop: "24px" }}>
          <h3>Ekstraksi Hand Skeleton Gagal</h3>
          <p>{error}</p>
        </div>
      )}
    </div>
  );
}

export default HandSkeleton;