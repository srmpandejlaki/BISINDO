import React from "react";

function TableDataPreprocess({ datasets, selectedDatasetId, onSelectDataset, loading, error }) {
  return (
    <div className="table-ratio">
      <h3>Tabel Data Prapemrosesan</h3>
      {loading ? (
        <p>Memuat data ratio...</p>
      ) : error ? (
        <p className="error-message text-error">{error}</p>
      ) : (
        <div className="table-dataset">
          <table>
            <thead>
              <tr>
                <th>No.</th>
                <th>Nama Dataset</th>
                <th>Jumlah Data</th>
                <th>Pilih</th>
              </tr>
            </thead>
            <tbody>
              {datasets.length === 0 ? (
                <tr>
                  <td colSpan={4}>Tidak ada data</td>
                </tr>
              ) : (
                datasets.map((dataset, index) => (
                  <tr key={dataset.idDataset}>
                    <td className="text-center">{index + 1}.</td>
                    <td className="padding-cell">{dataset.datasetName}</td>
                    <td className="text-center">{dataset.totalData}</td>
                    <td className="text-center">
                      <input
                        type="radio"
                        name="dataset"
                        checked={selectedDatasetId === dataset.idDataset}
                        onChange={() =>
                          onSelectDataset(dataset.idDataset)
                        }
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default TableDataPreprocess;