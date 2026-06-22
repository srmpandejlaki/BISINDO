import React, { createContext, useContext, useState, useEffect } from "react";
import { get_all_ratio } from "@/features/split-ratio/utils/split_ratio_api";
import { BASE_URL } from "@/shared/utils/index-api";

const SplitRatioContext = createContext(null);

export function SplitRatioProvider({ children }) {
  const [ratios, setRatios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [liveProgress, setLiveProgress] = useState({});
  const [testingStatus, setTestingStatus] = useState("idle"); // 'idle' | 'testing' | 'completed' | 'error'
  const [currentRatioTesting, setCurrentRatioTesting] = useState("");
  const [testingError, setTestingError] = useState(null);
  const [currentEpochsConfig, setCurrentEpochsConfig] = useState(null);

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

  useEffect(() => {
    fetchRatios();
  }, []);

  const runTestRatios = async (config) => {
    setTestingStatus("testing");
    setCurrentEpochsConfig(config.epochs);
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
        ratios,
        setRatios,
        loading,
        error,
        fetchRatios,
        liveProgress,
        testingStatus,
        currentRatioTesting,
        testingError,
        currentEpochsConfig,
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
