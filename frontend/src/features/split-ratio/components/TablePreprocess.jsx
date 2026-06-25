import React from "react";

function TableDataPreprocess() {
  return (
    <div className="table-ratio">
      <h3>Tabel Data Praproses</h3>
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
            <tr>
              <td className="text-center">1.</td>
              <td className="padding-cell">Dataset 1</td>
              <td className="text-center">100</td>
              <td className="text-center">
                <input type="radio" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TableDataPreprocess;