import React, { useState, useEffect } from "react";

import SectionUpload from "../components/SectionUpload";
import SectionPreview from "../components/SectionPreview";
import TableLabel from "../components/TableLabel";
import TableDataset from "../components/TableDataset";

import { get_all_datasets } from "../../../shared/utils/general_api";
import { get_label_with_total } from "../utils/data_collection_api";

function DataCollection() {
  // useState
  const [labels, setLabels] = useState([]);
  const [dataset, setDataset] = useState([]);
  const [_error, setError] = useState(null);
  const [previewData, setPreviewData] = useState(null);

  // function
  const loadLabel = async () => {
    const response = await get_label_with_total();
    setLabels(response);
  };

  const loadDatasets = async () => {
    try {
      const response = await get_all_datasets();

      console.log("Datasets:", response);

      if (!response || !Array.isArray(response)) {
        console.error("Data is not valid", response);
        setDataset([]);

        if (response === null) {
          setError("Fetch data from server failed.");
        }
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
    loadDatasets();
    loadLabel();
  }, []);

  return (
    <div className="content data-collection">
      <h1>Pengumpulan Data</h1>

      <div className="section-atas">
        <SectionUpload
          onUploadSuccess={loadDatasets}
          onPreviewGenerated={setPreviewData}
        />

        <SectionPreview preview={previewData} />

        <TableLabel labels={labels} />
      </div>

      <h2>Table Dataset</h2>

      <TableDataset
        datasets={dataset}
        onDeleteSuccess={(idDataset) =>{
          setDataset((prev) =>
            prev.filter((d) => d.idDataset !== idDataset)
          );
          loadLabel();
        }}
        onUpdateSuccess={(idDataset, newName) =>
          setDataset((prev) =>
            prev.map((d) =>
              d.idDataset === idDataset
                ? {
                    ...d,
                    datasetName: newName,
                  }
                : d
            )
          )
        }
      />

      <p className="info-total">
        Total Dataset: {dataset.length}
      </p>
    </div>
  );
}

export default DataCollection;