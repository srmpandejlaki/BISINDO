import React from "react";
import { delete_dataset, update_dataset_name } from "../utils/data_collection_api";
import { NavLink } from "react-router-dom";

function TableDataset({ datasets = [], onDeleteSuccess, onUpdateSuccess }) {
  const handleDelete = async (idDataset) => {
    const isConfirmed = window.confirm(
        "Apakah Anda yakin ingin menghapus dataset ini?"
    );

    if (!isConfirmed) return;

    try {
        await delete_dataset(idDataset);
        onDeleteSuccess?.(idDataset);
    } catch (error) {
        alert(error.message || "Gagal menghapus dataset.");
    }
  };

  const handleEdit = async (idDataset, oldName) => {
    const newName = window.prompt(
      "Masukkan nama dataset baru:",
      oldName
    );

    if (newName === null) return; // User menekan Cancel

    if (newName.trim() === "") {
      alert("Nama dataset tidak boleh kosong.");
      return;
    }

    if (newName === oldName) return;

    try {
      await update_dataset_name(idDataset, newName);
      onUpdateSuccess?.(idDataset, newName);
    } catch (error) {
      alert(error.message || "Gagal mengubah nama dataset.");
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
              <td colSpan="4">Tidak ada data</td>
            </tr>
          )}
          
          {datasets.map((dataset, index) => (
            <tr key={dataset.idDataset}>
              <td className="text-center">{index + 1}.</td>
              <td className="padding-cell">{dataset.datasetName}</td>
              <td className="text-center">{dataset.totalData}</td>
              <td className="btn-column">
                <NavLink to={`/admin/data-collection/${dataset.idDataset}/detail_dataset`}>
                  <button className="button">detail</button>
                </NavLink>
                <button 
                  className="button edit"
                  onClick={() => handleEdit(dataset.idDataset, dataset.datasetName)}
                >
                  edit
                </button>
                <button 
                  className="button delete" 
                  onClick={() => handleDelete(dataset.idDataset)}
                  disabled={!!dataset.preprocessedFolderPath}
                >
                  hapus
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default TableDataset;