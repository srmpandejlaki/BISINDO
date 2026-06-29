import React, { useState, useEffect } from "react";
import { get_label_with_total } from "../utils/data_collection_api";

function TableLabel() {
  const [labels, setLabels] = useState([]);

  const loadLabel = async () => {
    const response = await get_label_with_total();
    setLabels(response);
  };

  useEffect(() => {
    loadLabel();
  }, []);

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