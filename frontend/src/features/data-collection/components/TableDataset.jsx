import React from "react";

function TableDataset() {
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
          <tr>
            <td>1</td>
            <td>Dataset 1</td>
            <td>100</td>
            <td>
              <button><a href="/admin/data-collection/1">Detail</a></button>
              <button>Edit</button>
              <button>Hapus</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

export default TableDataset;