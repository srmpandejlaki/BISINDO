import React from "react";
import SectionDataset from "../components/SectionDataset";
import SectionPreparation from "../components/SectionPreparation";
import SectionHasilTraining from "../components/SectionHasilTraining";
import { useTraining } from "@/shared/context/TrainingContext";

function ProcessingPage() {
  const {
    models,
    bestRatio,
    loading,
    error,
    trainingStatus,
    currentTrainingModelName,
    liveProgress,
    trainingError,
    finalResults,
    startModelTraining,
    deleteModel,
  } = useTraining();

  return (
    <div className="content processing-page">
      <h1>Processing Page</h1>
      <SectionDataset 
        models={models} 
        bestRatio={bestRatio} 
        loading={loading}
        error={error}
        deleteModel={deleteModel}
      />
      <SectionPreparation 
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