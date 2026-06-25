import React, { useEffect } from "react";
import AddRatioSection from "../components/AddRatio";
import TableRatio from "../components/TableRatio";
import TableDataPreprocess from "../components/TablePreprocess";
import ParameterTest from "../components/ParameterTest";
import ResultRatio from "../components/ResultRatio";
import { useSplitRatio } from "@/shared/context/SplitRatioContext";

function SplitRatio() {
  const {
    ratios,
    loading,
    error,
    fetchRatios,
    liveProgress,
    testingStatus,
    currentRatioTesting,
    testingError,
    currentEpochsConfig,
    runTestRatios,
  } = useSplitRatio();

  useEffect(() => {
    fetchRatios();
  }, []);

  return (
    <div className="content split-ratio-page">
      <h1>Pengaturan Rasio Pembagian Data</h1>
      
      <div className="add-ratio-section">
        <AddRatioSection 
          fetchRatios={fetchRatios}
          testingStatus={testingStatus}
        />

        <TableRatio 
          ratios={ratios} 
          loading={loading} 
          error={error} 
          fetchRatios={fetchRatios}
          testingStatus={testingStatus}
        />

        <TableDataPreprocess 
          // ratios={ratios} 
          // loading={loading} 
          // error={error} 
          // fetchRatios={fetchRatios}
          // testingStatus={testingStatus}
        />
      </div>
      
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
        currentEpochsConfig={currentEpochsConfig}
      />
    </div>
  );
}

export default SplitRatio;