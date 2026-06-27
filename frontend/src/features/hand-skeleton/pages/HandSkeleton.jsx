import React, { useState, useEffect } from "react";
import InfoConfiguration from "../components/InfoConfiguration";
import InfoOutput from "../components/InfoOutput";
import ListsDataPrep from "../components/ListsDataPrep";
import DetailLandmark from "./DetailLandmark";

import { get_all_datasets } from "@/shared/utils/general_api";

function HandSkeleton() {
  const [datasets, setDatasets] = useState([]);

  const fetchDatasets = async () => {
    try {
      const response = await get_all_datasets();
      if (response && response.success) {
        setDatasets(response.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDatasets();
  }, []);

  return (
    <div className="content hand-skeleton-page">
      <h1>Hand Skeleton</h1>

      <InfoConfiguration />
      <InfoOutput />

      <div className="section-dataset">
        <h2>Dataset</h2>
        <ListsDataPrep datasets={datasets} />
      </div>

      <div className="section process-landmark">
        <h2>Detail Landmark</h2>
      </div>

      <div className="btn">
        <button className="button">Ekstraksi Hand Skeleton</button>
      </div>
    </div>
  );
}

export default HandSkeleton;