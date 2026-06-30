import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import EvaluationTesting from "../components/EvaluationTesting";
import EvaluationTraining from "../components/EvaluationTraining";
import AnalisisPerbandingan from "../components/AnalisisPerbandingan";
import { get_all_models } from "../../processing/utils/processing_api";
import { getEvaluationMetrics } from "../utils/evaluation_api";

function EvaluationPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [models, setModels] = useState([]);
  const [selectedModelId, setSelectedModelId] = useState("");
  const [testingEvaluation, setTestingEvaluation] = useState(null);
  const [isLoadingTesting, setIsLoadingTesting] = useState(false);
  const [error, setError] = useState("");

  // Fetch models on load
  useEffect(() => {
    const fetchModels = async () => {
      try {
        const data = await get_all_models();
        setModels(data);
        
        // Check if there is a preselected model ID from navigation state
        const targetId = location.state?.selectedModelId;
        if (targetId && data.some((m) => String(m.idTraining) === String(targetId))) {
          setSelectedModelId(targetId);
        } else if (data.length > 0) {
          setSelectedModelId(data[0].idTraining);
        }
      } catch (err) {
        console.error("Gagal mengambil model:", err);
        setError("Gagal memuat daftar model.");
      }
    };
    fetchModels();
  }, [location.state]);

  // Fetch testing evaluation metrics when selected model changes
  useEffect(() => {
    if (!selectedModelId) {
      setTestingEvaluation(null);
      return;
    }

    const fetchTestingEvaluation = async () => {
      setIsLoadingTesting(true);
      try {
        const data = await getEvaluationMetrics(selectedModelId);
        setTestingEvaluation(data);
      } catch (err) {
        console.error("Gagal mengambil metrik pengujian:", err);
        setTestingEvaluation(null);
      } finally {
        setIsLoadingTesting(false);
      }
    };

    fetchTestingEvaluation();
  }, [selectedModelId]);

  const selectedModel = models.find((m) => String(m.idTraining) === String(selectedModelId)) || null;

  return (
    <div className="content evaluation-page">
      {/* Title */}
      <div className="title">
        <div>
          <h2>Evaluation Page</h2>
          <p>Analisis mendalam performa training dan testing model saraf LSTM.</p>
        </div>
        
        {/* Model Selection Dropdown */}
        <div className="model-selection">
          <label htmlFor="model-select" className="select-label">Pilih Model:</label>
          <select
            id="model-select"
            value={selectedModelId}
            onChange={(e) => setSelectedModelId(e.target.value)}
            className="model-select"
          >
            {models.map((m) => (
              <option key={m.idTraining} value={m.idTraining}>
                {m.modelName}
              </option>
            ))}
            {models.length === 0 && <option value="">Tidak ada model</option>}
          </select>
          <button 
            onClick={() => navigate("/admin/testing")} 
            className="btn-model"
          >
            Uji Model Baru
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {selectedModel ? (
        <div className="evaluation-content">
          {/* Analisis Perbandingan (Comparison) */}
          <AnalisisPerbandingan 
            trainingData={selectedModel}
            testingData={testingEvaluation}
            isLoadingTesting={isLoadingTesting}
          />

          {/* Training vs Testing side-by-side or stacked layout */}
          <div className="training-vs-testing">
            {/* Evaluation Training */}
            <EvaluationTraining trainingData={selectedModel} />

            {/* Evaluation Testing */}
            <EvaluationTesting 
              testingData={testingEvaluation}
              isLoading={isLoadingTesting}
              idTraining={selectedModelId}
            />
          </div>
        </div>
      ) : (
        !error && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "200px", color: "#6c757d", border: "2px dashed #dee2e6", borderRadius: "8px" }}>
            <p style={{ margin: 0, fontWeight: "600" }}>Belum Ada Model yang Dipilih</p>
            <p style={{ margin: "5px 0 0 0", fontSize: "0.8rem", color: "#adb5bd" }}>Silakan lakukan training model terlebih dahulu di menu Processing.</p>
          </div>
        )
      )}
    </div>
  );
}

export default EvaluationPage;