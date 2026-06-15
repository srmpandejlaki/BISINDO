import React, { useState, useEffect } from "react";
import ListsDataset from "../components/ListsDataset";
import ParameterSetting from "../components/ParameterSetting";

import { get_all_datasets } from "../../../shared/utils/general_api";

function PreprocessingPage() {
  const [datasets, setDatasets] = useState([]);
  const [_error, setError] = useState(null);

  const loadDatasets = async () => {
      try {
        const response = await get_all_datasets();
        console.log("Datasets:", response);
  
        if(!response || !Array.isArray(response)) {
          console.error("Data is not valid", response);
          setDatasets([]);
  
          if(response === null) setError("Fetch data from server failed.");
        } else {
          setDatasets(response);
        }
      } catch (error) {
        console.error("Error fetching data", error);
        setError(error);
        setDatasets([]);
      }
    };
  
    useEffect(() => {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadDatasets();
      // loadDetailDataset();
    }, []);
  
    console.log("Datasets:", datasets);
  
  return (
    <div className="content preprocessing-admin">
      <h1>Preprocessing Page</h1>
      <ListsDataset datasets={datasets} />
      <ParameterSetting />
    </div>
  );
}

export default PreprocessingPage;