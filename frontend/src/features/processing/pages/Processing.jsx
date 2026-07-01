import React from "react";
import SectionDataset from "../components/SectionDataset";
import SectionPreparation from "../components/SectionPreparation";
import SectionHasilTraining from "../components/SectionHasilTraining";
import { useTraining } from "@/shared/context/TrainingContext";
import { useSplitRatio } from "@/shared/context/SplitRatioContext";

function ProcessingPage() {
  const {
    models,
    loading,
    error,
    trainingStatus,
    currentTrainingModelName,
    liveProgress,
    trainingError,
    finalResults,
    startModelTraining,
    deleteModel,
    datasets,
  } = useTraining();

  const {ratios, highestAccuracy } = useSplitRatio();
  const bestRatio = ratios.find(
    (ratio) => ratio.accuracy === highestAccuracy
  );

  return (
    <div className="content processing-page">
      <h1>Pelatihan Model</h1>
      <SectionDataset 
        models={models} 
        loading={loading}
        error={error}
        deleteModel={deleteModel}
        bestRatio={bestRatio}
      />
      <SectionPreparation 
        datasets={datasets}
        models={models} 
        bestRatio={bestRatio} 
        trainingStatus={trainingStatus}
        startModelTraining={startModelTraining}
        trainingError={trainingError}
      />
      <SectionHasilTraining 
        trainingStatus={trainingStatus}
        currentTrainingModelName={currentTrainingModelName}
        liveProgress={liveProgress}
        finalResults={finalResults}
      />
    </div>
  );
}

export default ProcessingPage;