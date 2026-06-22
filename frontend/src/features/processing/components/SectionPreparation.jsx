import React, { useState, useEffect } from "react";

function SectionPreparation({ models, bestRatio, trainingStatus, startModelTraining, trainingError }) {
  const [modelType, setModelType] = useState("new");
  const [selectedModelId, setSelectedModelId] = useState("");
  
  // Model Parameters State
  const [modelName, setModelName] = useState("");
  const [denseUnits, setDenseUnits] = useState(16);
  const [lstmUnits1, setLstmUnits1] = useState(128);
  const [dropout1, setDropout1] = useState(0.2);
  const [lstmUnits2, setLstmUnits2] = useState(128);
  const [dropout2, setDropout2] = useState(0.2);

  // Training Parameters State
  const [epochs, setEpochs] = useState(5);
  const [batchSize, setBatchSize] = useState(32);
  const [learningRate, setLearningRate] = useState(0.001);

  // Auto-fill values when existing model is selected
  useEffect(() => {
    if (modelType === "existing" && selectedModelId) {
      const selected = models.find(m => String(m.idTraining) === String(selectedModelId));
      if (selected) {
        setModelName(selected.modelName || "");
        setDenseUnits(selected.denseUnits || 16);
        setLstmUnits1(selected.LSTMUnits1 || 128);
        setDropout1(selected.dropout1 || 0.2);
        setLstmUnits2(selected.LSTMUnits2 || 128);
        setDropout2(selected.dropout2 || 0.2);
        setEpochs(selected.epochs || 5);
        setBatchSize(selected.batchSize || 32);
        setLearningRate(selected.learningRate || 0.001);
      }
    } else if (modelType === "new") {
      // Reset to defaults for new model
      setModelName("");
      setDenseUnits(16);
      setLstmUnits1(128);
      setDropout1(0.2);
      setLstmUnits2(128);
      setDropout2(0.2);
      setEpochs(5);
      setBatchSize(32);
      setLearningRate(0.001);
    }
  }, [modelType, selectedModelId, models]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (modelType !== "new") return;
    
    if (!modelName.trim()) {
      alert("Nama Model harus diisi!");
      return;
    }

    const config = {
      modelName: modelName.trim(),
      lstm_units1: Number(lstmUnits1),
      lstm_units2: Number(lstmUnits2),
      dropout1: Number(dropout1),
      dropout2: Number(dropout2),
      dense_units: Number(denseUnits),
      epochs: Number(epochs),
      batch_size: Number(batchSize),
      learning_rate: Number(learningRate),
    };

    startModelTraining(config);
  };

  const isTraining = trainingStatus === "training";
  const isDisabled = isTraining || modelType === "existing";

  return (
    <div className="section-preparation">
      <h2>Section Preparation</h2>
      
      <div className="split-data">
        <h4>Split Data</h4>
        <p>training menggunakan rasio terbaik</p>
        <p className="split-rasio">{bestRatio?.trainRatio || "Belum ditentukan"}</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="pilih-model">
          <h4>Pemilihan Model</h4>
          <select 
            value={modelType} 
            onChange={(e) => setModelType(e.target.value)}
            disabled={isTraining}
          >
            <option value="new">Model Baru</option>
            <option value="existing">Model yang sudah ada</option>
          </select>

          {modelType === "existing" && (
            <div className="opsi-model mt-3">
              <h4>Opsi Model</h4>
              <select 
                value={selectedModelId} 
                onChange={(e) => setSelectedModelId(e.target.value)}
                disabled={isTraining}
              >
                <option value="">Pilih Model</option>
                {models.map((model) => (
                  <option key={model.idTraining} value={model.idTraining}>
                    {model.modelName} (Acc: {(model.accuracy * 100).toFixed(1)}%)
                  </option>
                ))}
              </select>
            </div>
          )}

          {modelType === "new" && (
            <div className="input-group mt-3">
              <label>Nama Model Baru :</label>
              <input 
                type="text" 
                placeholder="Masukkan nama model..." 
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
                disabled={isTraining}
                required
              />
            </div>
          )}
        </div>

        <div className="parameter-model">
          <h4>Parameter Model</h4>
          <p>atur parameter untuk model</p>
          <div className="parameter-model-items">
            <div className="parameter-items">
              <label>Jumlah Layer LSTM :</label>
              <input type="text" disabled value="2-layer LSTM" />
            </div>
            <div className="parameter-items">
              <label>Dense Units :</label>
              <input 
                type="number" 
                placeholder="16 - 512" 
                value={denseUnits}
                onChange={(e) => setDenseUnits(Number(e.target.value))}
                disabled={isDisabled}
                min={1}
              />
            </div>
            <div className="parameter-items">
              <label>LSTM Units 1 :</label>
              <input 
                type="number" 
                placeholder="128" 
                value={lstmUnits1} 
                onChange={(e) => setLstmUnits1(Number(e.target.value))}
                disabled={isDisabled}
                min={1}
              />
            </div>
            <div className="parameter-items">
              <label>Dropout 1 :</label>
              <input 
                type="number" 
                step="0.1"
                placeholder="0.2" 
                value={dropout1}
                onChange={(e) => setDropout1(Number(e.target.value))}
                disabled={isDisabled}
                min={0}
                max={1}
              />
            </div>
            <div className="parameter-items">
              <label>LSTM Units 2 :</label>
              <input 
                type="number" 
                placeholder="128" 
                value={lstmUnits2}
                onChange={(e) => setLstmUnits2(Number(e.target.value))}
                disabled={isDisabled}
                min={1}
              />
            </div>
            <div className="parameter-items">
              <label>Dropout 2 :</label>
              <input 
                type="number" 
                step="0.1"
                placeholder="0.2" 
                value={dropout2}
                onChange={(e) => setDropout2(Number(e.target.value))}
                disabled={isDisabled}
                min={0}
                max={1}
              />
            </div>
          </div>
        </div>

        <div className="parameter-training">
          <h4>Parameter Training</h4>
          <p>atur parameter untuk training model</p>
          <div className="parameter-training-items">
            <div className="parameter-items">
              <label>Epochs :</label>
              <input 
                type="number" 
                placeholder="5" 
                value={epochs}
                onChange={(e) => setEpochs(Number(e.target.value))}
                disabled={isDisabled}
                min={1}
              />
            </div>
            <div className="parameter-items">
              <label>Batch Size :</label>
              <input 
                type="number" 
                placeholder="32" 
                value={batchSize}
                onChange={(e) => setBatchSize(Number(e.target.value))}
                disabled={isDisabled}
                min={1}
              />
            </div>
            <div className="parameter-items">
              <label>Learning Rate :</label>
              <input 
                type="number" 
                step="0.0001"
                placeholder="0.001" 
                value={learningRate}
                onChange={(e) => setLearningRate(Number(e.target.value))}
                disabled={isDisabled}
                // min={0.00001}
              />
            </div>
          </div>
        </div>

        {trainingError && (
          <div className="training-error-message mt-3">
            ⚠️ {trainingError}
          </div>
        )}

        {modelType === "new" && (
          <button 
            type="submit" 
            className={`btn-train mt-4 ${isTraining ? "running" : ""}`}
            disabled={isTraining}
          >
            {isTraining ? "Proses Training..." : "Mulai Training"}
          </button>
        )}
      </form>
    </div>
  );
}

export default SectionPreparation;