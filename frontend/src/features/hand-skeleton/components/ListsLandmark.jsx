import React from "react";
import { NavLink } from "react-router-dom";

function ListsLandmark({ datasets = [] }) {
  return (
    <div className="table-dataset">
      <table>
        <thead>
          <tr>
            <th>No.</th>
            <th>Nama Dataset</th>
            <th>Status Landmark</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {datasets.length === 0 && (
            <tr>
              <td colSpan="4" className="text-center">Belum ada data landmark</td>
            </tr>
          )}

          {datasets.map((dataset, index) => (
            <tr key={dataset.idDataset}>
              <td className="text-center">{index + 1}.</td>
              <td className="padding-cell">{dataset.datasetName}</td>
              <td className="text-center">
                <span
                  className={`status-badge ${
                    dataset.landmarkFolderPath
                      ? "status-done"
                      : "status-pending"
                  }`}
                >
                  {dataset.landmarkFolderPath
                    ? "Sudah diproses"
                    : "Belum diproses"}
                </span>
              </td>
              <td className="text-center">
                <NavLink to={`/admin/processing/hand-skeleton/${dataset.idDataset}/detail_landmark`}>
                  <button className="button" disabled={!dataset.landmarkFolderPath}>
                    Lihat Detail
                  </button>
                </NavLink>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ListsLandmark;
