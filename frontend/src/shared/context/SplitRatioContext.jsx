import React, { createContext, useContext, useState, useEffect } from "react";
import { get_all_ratio, get_dataset_preprocess } from "@/features/split-ratio/utils/split_ratio_api";
import { BASE_URL } from "@/shared/utils/index-api";

const SplitRatioContext = createContext(null);

export function SplitRatioProvider({ children }) {
  const [datasets, setDatasets] = useState([]);
  const [ratios, setRatios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [selectedDatasetId, setSelectedDatasetId] = useState(null);
  const [epoch, setepoch] = useState("10");
  const [batchSize, setBatchSize] = useState("16");
  const [learningRate, setLearningRate] = useState("0.001");
  
  const [liveProgress, setLiveProgress] = useState({});
  const [testingStatus, setTestingStatus] = useState("idle"); // 'idle' | 'testing' | 'completed' | 'error'
  const [currentRatioTesting, setCurrentRatioTesting] = useState("");
  const [testingError, setTestingError] = useState(null);
  const [currentepochConfig, setCurrentepochConfig] = useState(null);

  const fetchRatios = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await get_all_ratio();
      if (response && response.success) {
        setRatios(response.data);
      } else {
        setError("Gagal memuat data ratio.");
      }
    } catch (err) {
      setError("Terjadi kesalahan koneksi ke server.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDatasets = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await get_dataset_preprocess();
      if (response && response.success) {
        setDatasets(response.data);
      }
    } catch (err) {
      console.error(err);
    }
  };
  
  useEffect(() => {
    fetchRatios();
    fetchDatasets();
  }, []);

  const handleSelectedId = (idDataset) => {
    setSelectedDatasetId(idDataset);
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!epoch || !batchSize || !learningRate) {
      alert("Semua parameter harus diisi!");
      return;
    }
    
    runTestRatios({
      epoch: parseInt(epoch),
      batch_size: parseInt(batchSize),
      learning_rate: parseFloat(learningRate),
    });
  };

  const runTestRatios = async (config) => {
    setTestingStatus("testing");
    setCurrentepochConfig(config.epoch);
    setLiveProgress({});
    setTestingError(null);
    setCurrentRatioTesting("");

    try {
      const response = await fetch(`${BASE_URL}/processing/test-ratios/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        throw new Error("Gagal memulai pengujian ratio.");
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
              if (event.type === "ratio_start") {
                setCurrentRatioTesting(event.ratio);
                setLiveProgress((prev) => ({
                  ...prev,
                  [event.ratio]: [],
                }));
              } else if (event.type === "epoch") {
                setLiveProgress((prev) => ({
                  ...prev,
                  [event.ratio]: [...(prev[event.ratio] || []), event],
                }));
              } else if (event.type === "complete") {
                setRatios(event.data);
              } else if (event.type === "error") {
                throw new Error(event.message);
              }
            } catch (e) {
              console.error("Error parsing stream line:", e);
            }
          }
        }
      }
      setTestingStatus("completed");
    } catch (err) {
      console.error(err);
      setTestingError(err.message || "Terjadi kesalahan saat pengujian.");
      setTestingStatus("error");
    }
  };

  return (
    <SplitRatioContext.Provider
      value={{
        datasets,
        selectedDatasetId,
        handleSelectedId,
        epoch,
        setepoch,
        batchSize,
        setBatchSize,
        learningRate,
        setLearningRate,
        handleSubmit,
        ratios,
        setRatios,
        loading,
        error,
        fetchRatios,
        liveProgress,
        testingStatus,
        currentRatioTesting,
        testingError,
        currentepochConfig,
        runTestRatios,
      }}
    >
      {children}
    </SplitRatioContext.Provider>
  );
}

export function useSplitRatio() {
  const context = useContext(SplitRatioContext);
  if (!context) {
    throw new Error("useSplitRatio must be used within a SplitRatioProvider");
  }
  return context;
}
