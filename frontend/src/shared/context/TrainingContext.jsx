import React, { createContext, useContext, useState, useEffect } from "react";
import { get_all_models, get_best_ratio, delete_model } from "@/features/processing/utils/processing_api";
import { get_all_datasets } from "../utils/general_api";
import { BASE_URL } from "@/shared/utils/index-api";

const TrainingContext = createContext(null);

export function TrainingProvider({ children }) {
  const [datasets, setDatasets] = useState([]);
  const [models, setModels] = useState([]);
  const [bestRatio, setBestRatio] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Training Live Progress State
  const [trainingStatus, setTrainingStatus] = useState("idle"); // 'idle' | 'training' | 'completed' | 'error'
  const [currentTrainingModelName, setCurrentTrainingModelName] = useState("");
  const [liveProgress, setLiveProgress] = useState([]);
  const [trainingError, setTrainingError] = useState(null);
  const [finalResults, setFinalResults] = useState(null);

  const fetchModels = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await get_all_models();
      setModels(response);
    } catch (err) {
      setError("Gagal memuat data riwayat training.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDatasets = async () => {
    try {
      const response = await get_all_datasets();
      setDatasets(response);
    } catch (err) {
      console.error("Error fetching datasets", err);
    }
  }

  const fetchBestRatio = async () => {
    try {
      const response = await get_best_ratio();
      setBestRatio(response);
    } catch (err) {
      console.error("Error fetching best ratio:", err);
    }
  };

  useEffect(() => {
    fetchDatasets();
    fetchModels();
    fetchBestRatio();
  }, []);

  const startModelTraining = async (config) => {
    setTrainingStatus("training");
    setTrainingError(null);
    setLiveProgress([]);
    setFinalResults(null);
    setCurrentTrainingModelName(config.modelName || "Model Baru");

    try {
      const response = await fetch(`${BASE_URL}/processing/train/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        throw new Error("Gagal memulai proses training model.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split("\n");
        buffer = lines.pop();

        for (const line of lines) {
          if (line.trim()) {
            try {
              const event = JSON.parse(line);
              if (event.type === "training_start") {
                setCurrentTrainingModelName(event.modelName);
              } else if (event.type === "epoch") {
                setLiveProgress((prev) => [...prev, event]);
              } else if (event.type === "complete") {
                setFinalResults(event.data);
                setTrainingStatus("completed");
                await fetchModels(); // Refresh the list
              } else if (event.type === "error") {
                throw new Error(event.message);
              }
            } catch (e) {
              console.error("Error parsing stream line:", e);
            }
          }
        }
      }
    } catch (err) {
      console.error(err);
      setTrainingError(err.message || "Terjadi kesalahan saat training model.");
      setTrainingStatus("error");
    }
  };

  const deleteModel = async (idTraining) => {
    try {
      const response = await delete_model(idTraining);
      if (response && response.success) {
        await fetchModels();
        return { success: true };
      } else {
        return { success: false, message: response?.message || "Gagal menghapus model." };
      }
    } catch (err) {
      console.error("Error deleting model:", err);
      return { success: false, message: "Terjadi kesalahan saat menghapus model." };
    }
  };

  return (
    <TrainingContext.Provider
      value={{
        models,
        bestRatio,
        loading,
        error,
        fetchModels,
        fetchBestRatio,
        trainingStatus,
        setTrainingStatus,
        currentTrainingModelName,
        liveProgress,
        trainingError,
        finalResults,
        startModelTraining,
        deleteModel,
        datasets,
      }}
    >
      {children}
    </TrainingContext.Provider>
  );
}

export function useTraining() {
  const context = useContext(TrainingContext);
  if (!context) {
    throw new Error("useTraining must be used within a TrainingProvider");
  }
  return context;
}
