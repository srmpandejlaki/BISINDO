import React from "react";

function TableDataset({ datasets = [] }) {
  return (
    <div className="table-dataset">
      <h3>Table Dataset</h3>

      <table>
        <thead>
          <tr>
            <th>No.</th>
            <th>Nama Dataset</th>
            <th>Jumlah Data</th>
            <th>Jumlah Label</th>
            <th>Aksi</th>
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
              <td>{dataset.totalLabel}</td>
              <td>
                <button><a href="/admin/data-collection/1">Detail</a></button>
                <button>Edit</button>
                <button>Hapus</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default TableDataset;