import React from "react";
import ListsDataset from "../components/ListsDataset";
import ParameterSetting from "../components/ParameterSetting";

function PreprocessingPage() {
  return (
    <div className="content preprocessing-admin">
      <h1>Preprocessing Page</h1>
      <ListsDataset />
      <ParameterSetting />
    </div>
  );
}

export default PreprocessingPage;