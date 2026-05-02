import React from "react";

function TableLabel() {
  return (
    <div className="table-label">
      <h3>Table Label</h3>

      <table>
        <thead>
          <tr>
            <th>Label</th>
            <th>Jumlah Data</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>A</td>
            <td>100</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

export default TableLabel;