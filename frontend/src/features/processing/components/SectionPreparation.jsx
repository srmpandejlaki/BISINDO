import React, { useState } from "react";

function SectionPreparation({ models }) {
  const [modelType, setModelType] = useState("");
  const [selectedModel, setSelectedModel] = useState(null);

  console.log("Models:", models);

  return (
    <div className="section-preparation">
      <h2>Section Preparation</h2>
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
        <div className="parameter-model-items">
          <div className="parameter-items">
            <label>Jumlah Layer LSTM :</label>
            <input type="text" disabled defaultValue="2-layer LSTM" />
          </div>
          <div className="parameter-items">
            <label>Dense Units :</label>
            <input type="number" placeholder="16 - 512" defaultValue={16} />
          </div>
          <div className="parameter-items">
            <label>LSTM Units 1 :</label>
            <input type="number" placeholder="128" defaultValue={128} />
          </div>
          <div className="parameter-items">
            <label>Dropout 1 :</label>
            <input type="number" placeholder="0.2" defaultValue={0.2} />
          </div>
          <div className="parameter-items">
            <label>LSTM Units 2 :</label>
            <input type="number" placeholder="128" defaultValue={128} />
          </div>
          <div className="parameter-items">
            <label>Dropout 2 :</label>
            <input type="number" placeholder="0.2" defaultValue={0.2} />
          </div>
        </div>
      </div>
      <div className="parameter-training">
        <h4>Parameter Training</h4>
        <p>atur parameter untuk training model</p>
        <div className="parameter-training-items">
          <div className="parameter-items">
            <label>Epochs :</label>
            <input type="number" placeholder="0" defaultValue={5} />
          </div>
          <div className="parameter-items">
            <label>Batch Size :</label>
            <input type="number" placeholder="32" defaultValue={32} />
          </div>
          <div className="parameter-items">
            <label>Learning Rate :</label>
            <input type="number" placeholder="0.001" defaultValue={0.001} />
          </div>
        </div>
      </div>
      <button>Mulai Training</button>
    </div>
  );
}

export default SectionPreparation;