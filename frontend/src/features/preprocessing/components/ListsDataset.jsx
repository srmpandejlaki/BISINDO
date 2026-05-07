import React from "react";

function ListsDataset() {
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
          <tr>
            <td>1</td>
            <td>Dataset 1</td>
            <td>100</td>
            <td>
              <input type="checkbox" name="dataset" id="dataset1" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default ListsDataset;