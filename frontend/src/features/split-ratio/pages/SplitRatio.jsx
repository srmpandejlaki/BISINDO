import React, { useEffect } from "react";
import AddRatioSection from "../components/AddRatio";
import TableRatio from "../components/TableRatio";
import TableDataPreprocess from "../components/TablePreprocess";
import ParameterTest from "../components/ParameterTest";
import ResultRatio from "../components/ResultRatio";
import { useSplitRatio } from "@/shared/context/SplitRatioContext";

function SplitRatio() {
  const {
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
    loading,
    error,
    fetchRatios,
    liveProgress,
    testingStatus,
    currentRatioTesting,
    testingError,
    currentepochConfig,
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
          loading={loading} 
          error={error}
          datasets={datasets}
          selectedDatasetId={selectedDatasetId}
          onSelectDataset={handleSelectedId}
        />
      </div>
      
      <div className="parameter-section">
        <h3>Pengujian Ratio Data Split</h3>
        <ParameterTest 
          epoch={epoch}
          setepoch={setepoch}
          batchSize={batchSize}
          setBatchSize={setBatchSize}
          learningRate={learningRate}
          setLearningRate={setLearningRate}
          handleSubmit={handleSubmit}
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
        currentepochConfig={currentepochConfig}
      />
    </div>
  );
}

export default SplitRatio;