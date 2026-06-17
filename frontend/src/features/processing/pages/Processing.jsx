import React, { useState, useEffect } from "react";
import SectionDataset from "../components/SectionDataset";
import SectionPreparation from "../components/SectionPreparation";
import SectionHasilTraining from "../components/SectionHasilTraining";
import { get_all_models } from "../utils/processing_api";

function ProcessingPage() {
  const [models, setModels] = useState([]);

  const fetchModels = async () => {
    try {
      const response = await get_all_models();
      setModels(response);
    } catch (error) {
      console.log("Error fetching models", error);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchModels();
  }, []);

  return (
    <div className="content processing-page">
      <h1>Processing Page</h1>
      <SectionDataset models={models} />
      <SectionPreparation models={models} />
      <SectionHasilTraining />
    </div>
  );
}

export default ProcessingPage;