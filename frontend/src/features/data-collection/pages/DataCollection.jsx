import React, { useState, useEffect } from "react";

import SectionUpload from "../components/SectionUpload";
import SectionPreview from "../components/SectionPreview";
import TableLabel from "../components/TableLabel";
import TableDataset from "../components/TableDataset";

import { get_all_datasets } from "../utils/data_collection_api";

function DataCollection() {
  // useState
  const [dataset, setDataset] = useState([]);
  const [_error, setError] = useState(null);

  // function
  const loadDatasets = async () => {
    try {
      const response = await get_all_datasets();
      console.log("Datasets:", response);

      if(!response || !Array.isArray(response)) {
        console.error("Data is not valid", response);
        setDataset([]);

        if(response === null) setError("Fetch data from server failed.");
      } else {
        setDataset(response);
      }
    } catch (error) {
      console.error("Error fetching data", error);
      setError(error);
      setDataset([]);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadDatasets();
  }, []);

  console.log("Datasets:", dataset);

  return (
    <div className="content data-collection">
      <h1>Data Collection</h1>
      <div className="section-atas">
        <SectionUpload />
        <SectionPreview />
        <TableLabel />
      </div>
      <TableDataset datasets={dataset} />
      <p className="info-total">Total Data: 360</p>
    </div>
  )
}

export default DataCollection