import React from "react";

function TableLabel({ labels }) {
  return (
    <div className="table-label">
      <table>
        <thead>
          <tr>
            <th>Label</th>
            <th>Jumlah Data Saat Ini</th>
          </tr>
        </thead>
        <tbody>
          {labels.map((label) => (
            <tr key={label.idLabel}>
              <td className="text-center">{label.labelName}</td>
              <td className="text-center">{label.total}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default TableLabel;