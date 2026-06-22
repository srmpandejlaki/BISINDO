import React, { useState, useEffect } from "react";
import SectionDataset from "../components/SectionDataset";
import SectionPreparation from "../components/SectionPreparation";
import SectionHasilTraining from "../components/SectionHasilTraining";
import { get_all_models, get_best_ratio } from "../utils/processing_api";

function ProcessingPage() {
  const [models, setModels] = useState([]);
  const [bestRatio, setBestRatio] = useState(null);

  const fetchModels = async () => {
    try {
      const response = await get_all_models();
      setModels(response);
    } catch (error) {
      console.log("Error fetching models", error);
    }
  };

  const fetchBestRatio = async () => {
    try {
      const response = await get_best_ratio();
      setBestRatio(response);
    } catch (error) {
      console.log("Error fetching best ratio", error);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchModels();
    fetchBestRatio();
  }, []);

  return (
    <div className="content processing-page">
      <h1>Processing Page</h1>
      <SectionDataset models={models} bestRatio={bestRatio} />
      <SectionPreparation models={models} bestRatio={bestRatio} />
      <SectionHasilTraining />
    </div>
  );
}

export default ProcessingPage;