import React from "react";

function SectionDataset() {
  return (
    <div className="section-dataset">
      <h2>Section Dataset</h2>
      <div className="option-rasio">
        <label htmlFor="ratio">Ratio:</label>
        <select name="" id="">
          <option value="">80:20</option>
          <option value="">70:30</option>
          <option value="">60:40</option>
        </select>
      </div>
      <div className="search-data">
        <input type="text" placeholder="Search data..." />
      </div>
      <div className="history-training">
        <p>Riwayat Training</p>
        <table>
          <thead>
            <tr>
              <th>No.</th>
              <th>Nama Model</th>
              <th>Date</th>
              <th>Akurasi</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1</td>
              <td>Model A</td>
              <td>2023-01-01</td>
              <td>95%</td>
              <td>
                <button>Detail</button>
                <button>Edit</button>
                <button>Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default SectionDataset;