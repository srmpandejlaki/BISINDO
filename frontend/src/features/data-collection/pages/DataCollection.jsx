import React from "react";
import TableLabel from "../components/TableLabel";
import TableDataset from "../components/TableDataset";

function DataCollection() {
  return (
    <div className="content data-collection">
      <h1>Data Collection</h1>
      <TableLabel />
      <TableDataset />
    </div>
  )
}

export default DataCollection