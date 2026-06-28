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
        console.log("Datasets:", response);
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

    if (!selectedDatasetId) return;
    async function loadStatus() {
      try {
        const data = await get_preprocessing_status(
          selectedDatasetId
        );
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
      const newStatus =
          await get_preprocessing_status(
              selectedDatasetId
          );

      setStatus(newStatus);
      // Refresh datasets to update status
      await loadDatasets();
    } catch (err) {
      setError(err.message || "Terjadi kesalahan saat preprocessing");
    } finally {
      setIsLoading(false);
    }
  };

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

      <ParameterSetting
        config={config}
        onConfigChange={setConfig}
        onStartPreprocessing={handleStartPreprocessing}
        isLoading={isLoading}
        selectedDatasetId={selectedDatasetId}
      />

      {
        status && (
          <div className="dataset-status">
            <h3>Status Dataset</h3>
            <p>
              <strong>Total Video :</strong>
              {status.totalVideo}
            </p>
            <p>
              <strong>Sudah Dipraproses :</strong>
              {status.preprocessed}
            </p>
            <p>
              <strong>Belum Dipraproses :</strong>
              {status.remaining}
            </p>
            <p>
              <strong>Progress :</strong>
              {status.totalVideo === 0
                  ? "0%"
                  : `${Math.round(
                        (status.preprocessed /
                        status.totalVideo) * 100
                    )}%`
              }
            </p>
          </div>
        )
      }

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
  );
}

export default PreprocessingPage;