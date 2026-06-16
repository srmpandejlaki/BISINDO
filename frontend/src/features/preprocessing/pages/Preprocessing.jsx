import React, { useState, useEffect } from "react";
import ListsDataset from "../components/ListsDataset";
import ParameterSetting from "../components/ParameterSetting";

import { get_all_datasets } from "../../../shared/utils/general_api";
import { run_preprocessing } from "../utils/preprocessing_api";

import "./Preprocessing.scss";

function PreprocessingPage() {
  const [datasets, setDatasets] = useState([]);
  const [selectedDatasetId, setSelectedDatasetId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const [config, setConfig] = useState({
    sequence_length: 60,
    feature_size: 126,
    use_augmentation: true,
    noise_level: 0.01,
    scale_range_min: 0.9,
    scale_range_max: 1.1,
    use_frame_dropout: false,
    frame_dropout_prob: 0.1,
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

  const handleStartPreprocessing = async () => {
    if (!selectedDatasetId) return;

    setIsLoading(true);
    setResult(null);
    setError(null);

    try {
      const response = await run_preprocessing(selectedDatasetId, config);
      setResult(response.data);
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
      <h1>Preprocessing</h1>

      <ListsDataset
        datasets={datasets}
        selectedDatasetId={selectedDatasetId}
        onSelectDataset={setSelectedDatasetId}
      />

      <ParameterSetting
        config={config}
        onConfigChange={setConfig}
        onStartPreprocessing={handleStartPreprocessing}
        isLoading={isLoading}
        selectedDatasetId={selectedDatasetId}
      />

      {/* Result Section */}
      {result && (
        <div className="result-section result-success">
          <h3>Preprocessing Berhasil</h3>
          <div className="result-details">
            <p><strong>Dataset:</strong> {result.dataset_name}</p>
            <p><strong>Output Path:</strong> {result.output_path}</p>
            <p><strong>Total Diproses:</strong> {result.total_processed}</p>
            <p><strong>Total Augmentasi:</strong> {result.total_augmented}</p>
            <p><strong>Total Dilewati:</strong> {result.total_skipped}</p>
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