import React from "react";
import { delete_dataset } from "../utils/data_collection_api";
import { NavLink } from "react-router-dom";

function TableDataset({ datasets = [] }) {
  const handleDelete = async (idDataset) => {
    try {
      const response = await delete_dataset(idDataset);
      console.log("Datasets:", response);
    } catch (error) {
      console.error("Error fetching data", error);
    }
  };

  return (
    <div className="table-dataset">
      <h3>Table Dataset</h3>

      <table>
        <thead>
          <tr>
            <th>No.</th>
            <th>Nama Dataset</th>
            <th>Jumlah Data</th>
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
              <td>
                <NavLink to={`/admin/data-collection/${dataset.idDataset}/detail_dataset`}>Detail</NavLink>
                <button>Edit</button>
                <button onClick={() => handleDelete(dataset.idDataset)}>Hapus</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="info-total">Total Data: {datasets.length}</p>
    </div>
  )
}

export default TableDataset;