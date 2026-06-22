import React, { useState, useEffect } from "react";
import AddRatioSection from "../components/AddRatio";
import ParameterTest from "../components/ParameterTest";
import ResultRatio from "../components/ResultRatio";
import { get_all_ratio } from "../utils/split_ratio_api";
import { BASE_URL } from "@/shared/utils/index-api";

function SplitRatio() {
  const [ratios, setRatios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // State untuk live progress training
  const [liveProgress, setLiveProgress] = useState({});
  const [testingStatus, setTestingStatus] = useState("idle"); // 'idle' | 'testing' | 'completed' | 'error'
  const [currentRatioTesting, setCurrentRatioTesting] = useState("");
  const [testingError, setTestingError] = useState(null);

  // Ambil semua ratio dari backend
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

  // Fungsi untuk menjalankan pengujian ratio secara streaming (real-time)
  const runTestRatios = async (config) => {
    setTestingStatus("testing");
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
        buffer = lines.pop(); // Simpan baris terakhir yang parsial

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
    <div className="content split-ratio-page">
      <h1>Split Ratio</h1>
      
      <AddRatioSection 
        ratios={ratios} 
        loading={loading} 
        error={error} 
        fetchRatios={fetchRatios}
        testingStatus={testingStatus}
      />
      
      <div className="parameter-section">
        <h3>Pengujian Ratio Data Split</h3>
        <ParameterTest 
          runTestRatios={runTestRatios} 
          testingStatus={testingStatus}
          testingError={testingError}
        />
      </div>

      <ResultRatio 
        ratios={ratios} 
        liveProgress={liveProgress}
        testingStatus={testingStatus}
        currentRatioTesting={currentRatioTesting}
      />
    </div>
  );
}

export default SplitRatio;