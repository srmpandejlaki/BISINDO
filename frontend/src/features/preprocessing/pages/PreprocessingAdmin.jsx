import React from "react";
import ListsDataset from "../components/ListsDataset";
import ParameterSetting from "../components/ParameterSetting";

function PreprocessingAdmin() {
  return (
    <div className="content preprocessing-admin">
      <h1>Preprocessing Admin Page</h1>
      <ListsDataset />
      <ParameterSetting />
    </div>
  );
}

export default PreprocessingAdmin;