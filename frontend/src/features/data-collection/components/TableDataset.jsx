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
              <td className="text-center">{index + 1}.</td>
              <td className="padding-cell">{dataset.datasetName}</td>
              <td className="text-center">{dataset.totalData}</td>
              <td className="btn-column">
                <NavLink to={`/admin/data-collection/${dataset.idDataset}/detail_dataset`}>
                  <button className="button">detail</button>
                </NavLink>
                <button className="button edit">edit</button>
                <button className="button delete" onClick={() => handleDelete(dataset.idDataset)}>hapus</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default TableDataset;