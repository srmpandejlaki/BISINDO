import React from "react";

function ListsDataset({ datasets = [] }) {
  return (
    <div className="lists-dataset">
      <div className="pengantar">
        <h1>Daftar Dataset</h1>
        <p>Pilih dataset yang ingin belum melakukan preprocessing</p>
      </div>
      <table>
        <thead>
          <tr>
            <th>No.</th>
            <th>Nama Dataset</th>
            <th>Jumlah Data</th>
            <th>Pilih Dataset</th>
          </tr>
        </thead>
        <tbody>
          {datasets.length === 0 && (
            <tr>
              <td colSpan="5">Tidak ada data</td>
            </tr>
          )}

          {datasets.map((dataset, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{dataset.datasetName}</td>
              <td>{dataset.totalData}</td>
              <td>
                <input type="checkbox" name="dataset" id="dataset1" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ListsDataset;