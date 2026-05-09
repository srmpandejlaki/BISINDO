import React from "react";
import SectionDataset from "../components/SectionDataset";
import SectionPreparation from "../components/SectionPreparation";
import SectionHasilTraining from "../components/SectionHasilTraining";

function ProcessingPage() {
  return (
    <div className="content processing-page">
      <h1>Processing Page</h1>
      <SectionDataset />
      <SectionPreparation />
      <SectionHasilTraining />
    </div>
  );
}

export default ProcessingPage;