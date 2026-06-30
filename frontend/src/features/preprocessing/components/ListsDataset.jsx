import React from "react";

function ListsDataset({ datasets = [], selectedDatasetId, onSelectDataset }) {
  return (
    <div className="table-dataset">
      <table>
        <thead>
          <tr>
            <th>No.</th>
            <th>Nama Dataset</th>
            <th>Jumlah Data</th>
            <th>Status</th>
            <th>Pilih</th>
          </tr>
        </thead>
        <tbody>
          {datasets.length === 0 && (
            <tr>
              <td colSpan="5">Tidak ada data</td>
            </tr>
          )}

          {datasets.map((dataset, index) => {
            const isDone = dataset.totalData > 0 && dataset.remainingCount === 0;
            const isEmpty = dataset.totalData === 0;
            
            let statusText = "Belum diproses";
            if (isEmpty) {
              statusText = "Belum ada data";
            } else if (isDone) {
              statusText = "Sudah diproses";
            } else if (dataset.remainingCount > 0) {
              statusText = `Belum diproses (${dataset.remainingCount} video)`;
            }

            return (
              <tr
                key={dataset.idDataset}
                className={selectedDatasetId === dataset.idDataset ? "selected-row" : ""}
              >
                <td className="text-center">{index + 1}.</td>
                <td className="padding-cell">{dataset.datasetName}</td>
                <td className="text-center">{dataset.totalData}</td>
                <td className="text-center">
                  <span
                    className={`status-badge ${
                      isDone ? "status-done" : "status-pending"
                    }`}
                  >
                    {statusText}
                  </span>
                </td>
                <td className="text-center">
                  <input
                    type="radio"
                    name="dataset-select"
                    checked={selectedDatasetId === dataset.idDataset}
                    onChange={() => onSelectDataset(dataset.idDataset)}
                    disabled={isEmpty}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default ListsDataset;