import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TestingPreparation from "../components/TestingPrepearation";
import TestingResult from "../components/TestingResult";
import { get_all_models } from "../../processing/utils/processing_api";
import { useTesting } from "../../../shared/context/TestingContext";

function TestingPage() {
  const navigate = useNavigate();
  const [models, setModels] = useState([]);
  
  const {
    selectedModelId,
    setSelectedModelId,
    testingMode,
    setTestingMode,
    uploadFile,
    setUploadFile,
    isLoading,
    error,
    setError,
    testResults,
    startTesting
  } = useTesting();

  // Fetch models on load
  useEffect(() => {
    const fetchModels = async () => {
      try {
        const data = await get_all_models();
        setModels(data);
        if (data.length > 0 && !selectedModelId) {
          setSelectedModelId(data[0].idTraining);
        }
      } catch (err) {
        console.error("Gagal mengambil model:", err);
        setError("Gagal memuat daftar model.");
      }
    };
    fetchModels();
  }, [selectedModelId, setSelectedModelId, setError]);

  const selectedModel = models.find((m) => String(m.idTraining) === String(selectedModelId)) || null;

  const handleStartTesting = async () => {
    await startTesting(selectedModelId);
  };

  const handleViewEvaluation = () => {
    if (selectedModelId) {
      navigate("/admin/evaluation", { state: { selectedModelId } });
    } else {
      navigate("/admin/evaluation");
    }
  };

  return (
    <div className="content testing-page">
      <div className="title">
        <h2>Testing Page</h2>
        <p>Uji model saraf LSTM BISINDO menggunakan dataset uji terpisah atau unggah berkas baru.</p>
      </div>

      <TestingPreparation
        models={models}
        selectedModelId={selectedModelId}
        setSelectedModelId={setSelectedModelId}
        selectedModel={selectedModel}
        testingMode={testingMode}
        setTestingMode={setTestingMode}
        uploadFile={uploadFile}
        setUploadFile={setUploadFile}
        onStartTesting={handleStartTesting}
        isLoading={isLoading}
      />

      <TestingResult
        isLoading={isLoading}
        error={error}
        testResults={testResults}
      />

      <button className="detail-evaluation" onClick={handleViewEvaluation} style={{ cursor: "pointer" }}>
        Lihat Detail Evaluasi
      </button>
    </div>
  );
}

export default TestingPage;