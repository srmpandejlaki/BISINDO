import React from "react";
import SectionUpload from "../components/SectionUpload";
import SectionPreview from "../components/SectionPreview";
import TableLabel from "../components/TableLabel";
import TableDataset from "../components/TableDataset";

function DataCollection() {
  return (
    <div className="content data-collection">
      <h1>Data Collection</h1>
      <div className="section-atas">
        <SectionUpload />
        <SectionPreview />
        <TableLabel />
      </div>
      <TableDataset />
    </div>
  )
}

export default DataCollection