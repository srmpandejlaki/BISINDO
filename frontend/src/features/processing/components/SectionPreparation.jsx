import React, { useState } from "react";

function SectionPreparation({ models }) {
  const [modelType, setModelType] = useState("");
  const [selectedModel, setSelectedModel] = useState(null);

  console.log("Models:", models);

  return (
    <div className="section-preparation">
      <h2>Section Preparation</h2>
      <div className="data-preparation">
        <div className="split-data">
          <h4>Split Data</h4>
          <p>training menggunakan rasio terbaik</p>
          <p className="split-rasio">80:20</p>
        </div>
        <div className="pilih-model">
          <h4>Pemilihan Model</h4>
          <select value={modelType} onChange={(e) => setModelType(e.target.value)}>
            <option value="new">Model Baru</option>
            <option value="existing">Model yang sudah ada</option>
          </select>
        </div>
        {modelType === "existing" && (
          <div className="opsi-model">
            <h4>Opsi Model</h4>
              <select 
                value={selectedModel} 
                onChange={(e) => setSelectedModel(e.target.value)}
              >
                <option value="">Pilih Model</option>
                
                {models.map((model) => (
                  <option key={model.idTraining} value={model.idTraining}>{model.modelName}</option>
                ))}
              </select>
          </div>
        )}
      </div>
      <div className="parameter-model">
        <h4>Parameter Model</h4>
        <p>atur parameter untuk model</p>
      </div>
      <div className="parameter-training">
        <h4>Parameter Training</h4>
        <p>atur parameter untuk training model</p>
      </div>
      <button>Mulai Training</button>
    </div>
  );
}

export default SectionPreparation;