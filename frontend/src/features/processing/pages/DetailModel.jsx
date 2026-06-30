import React, { useState, useEffect } from "react";
import { useParams, NavLink } from "react-router-dom";
import { get_model_by_id } from "../utils/processing_api";

function DetailModel() {
  const { idTraining } = useParams();
  const [model, setModel] = useState(null);

  const loadModel = async (idTraining) => {
    try {
      const response = await get_model_by_id(idTraining);
      console.log("Response:", response);
      setModel(response ?? null);
    } catch (err) {
      console.error("Gagal mengambil model:", err);
      setModel({});
    }
  }

  const { confusionMatrix, createdAt } = model || {};

  const formattedDate = createdAt 
  ? new Date(createdAt).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  : "";

  useEffect(() => {
    if (idTraining) {
      loadModel(idTraining);
    }
  }, [idTraining]);

  const cm = typeof confusionMatrix === "string" ? JSON.parse(confusionMatrix) : confusionMatrix;
  const N = cm && Array.isArray(cm) ? cm.length : 0;
  const labels = Array.from({ length: N }, (_, i) => String.fromCharCode(65 + i));

  if (!model) {
    return <div>Loading...</div>;
  }

  return (
    <div className="content detail-model">
      <div className="title">
        <h2>Informasi Detail Model {model.modelName}</h2>
        <p>Tanggal Melatih Model {formattedDate}</p>
      </div>

      <div className="model-info">
        <p>Dataset yang digunakan: {model.idDataset}</p>
      </div>

      <div className="parameter">
        <div className="table table-parameter">
          <table>
            <thead>
              <tr>
                <th>Parameter Model</th>
                <th>Nilai</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>LSTM Units 1</td>
                <td className="text-center">{model.LSTMUnits1}</td>
              </tr>
              <tr>
                <td>LSTM Units 2</td>
                <td className="text-center">{model.LSTMUnits2}</td>
              </tr>
              <tr>
                <td>Dropout 1</td>
                <td className="text-center">{model.dropout1}</td>
              </tr>
              <tr>
                <td>Dropout 2</td>
                <td className="text-center">{model.dropout2}</td>
              </tr>
              <tr>
                <td>Dense Units</td>
                <td className="text-center">{model.denseUnits}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="table table-parameter">
          <table>
            <thead>
              <tr>
                <th>Parameter Training</th>
                <th>Nilai</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Epoch</td>
                <td className="text-center">{model.epoch}</td>
              </tr>
              <tr>
                <td>Batch Size</td>
                <td className="text-center">{model.batchSize}</td>
              </tr>
              <tr>
                <td>Learning Rate</td>
                <td className="text-center">{model.learningRate}</td>
              </tr>
              <tr>
                <td>Dense Activation</td>
                <td className="text-center">relu</td>
              </tr>
              <tr>
                <td>Optimizer</td>
                <td className="text-center">adam</td>
              </tr>
              <tr>
                <td>Loss Function</td>
                <td className="text-center">categorical_crossentropy</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="table">
          <table>
            <thead>
              <tr>
                <th>Akurasi</th>
                <th>Train Loss</th>
                <th>Val Loss</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="text-center">{(model.accuracy * 100).toFixed(2)}%</td>
                <td className="text-center">{(model.trainLoss * 100).toFixed(2)}</td>
                <td className="text-center">{(model.valLoss * 100).toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="table">
          <table>
            <thead>
              <tr>
                <th>Precision</th>
                <th>Recall</th>
                <th>Macro Average</th>
                <th>Weighted Average</th>
                <th>MCC</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="text-center">{(model.precision * 100).toFixed(2)}%</td>
                <td className="text-center">{(model.recall * 100).toFixed(2)}%</td>
                <td className="text-center">{(model.macroAverage * 100).toFixed(2)}%</td>
                <td className="text-center">{(model.weightedAverage * 100).toFixed(2)}%</td>
                <td className="text-center">{model.mcc ? model.mcc.toFixed(3) : "0.000"}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="confusion-matrix">
        <h4>Confusion Matrix</h4>
        <div className="container">
          <div className="main-table">
            {/* Matrix Row */}
            <div className="row">
              <div className="act-pred">act/pred</div>
                {labels.map((lbl) => (
                  <div key={lbl} className="label-col">{lbl}</div>
                ))}
            </div>

            {cm.map((row, rIdx) => (
                <div key={rIdx} style={{ display: "flex", alignItems: "center" }}>
                  {/* Row header */}
                  <div className="label-row">{labels[rIdx]}</div>
                  {/* Row values */}
                  {row.map((val, cIdx) => {
                    const isDiagonal = rIdx === cIdx;
                    let bgColor = "#fff";
                    let textColor = "#333";
                    
                    if (val > 0) {
                      if (isDiagonal) {
                        bgColor = `rgba(40, 167, 69, ${Math.min(0.1 + val * 0.15, 0.9)})`;
                        textColor = val > 3 ? "#fff" : "#0f5132";
                      } else {
                        bgColor = `rgba(220, 53, 69, ${Math.min(0.1 + val * 0.2, 0.9)})`;
                        textColor = val > 2 ? "#fff" : "#842029";
                      }
                    }
                    
                    return (
                      <div
                        key={cIdx}
                        title={`Actual: ${labels[rIdx]}, Predicted: ${labels[cIdx]} - Value: ${val}`}
                        className="matrix-cell"
                        style={{
                          fontWeight: val > 0 ? "bold" : "normal",
                          backgroundColor: bgColor,
                          color: textColor
                        }}
                      >
                        {val}
                      </div>
                    );
                  })}
                </div>
              ))}
          </div>
        </div>
      </div>

      <div className="btn">
        <NavLink to="/admin/processing/training">
          <button className="button">Kembali</button>
        </NavLink>
      </div>
    </div>
  );
}

export default DetailModel;