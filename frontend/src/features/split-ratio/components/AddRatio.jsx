import React from "react";

function AddRatioSection() {
  return (
    <div className="add-ratio-section">
      <div className="add-form">
        <h5>Ratio Data Split (train : test)</h5>
        <form action="">
          <div className="input">
            <label>Train:</label>
            <input type="number" placeholder="60, 70, 80" />
          </div>
          <div className="input">
            <label>Test:</label>
            <input type="number" placeholder="40, 30, 20" />
          </div>
        </form>
        <button>Tambah Ratio</button>
      </div>
      <div className="table-ratio">
        <h5>Tabel Data Split Ratio</h5>
        <table>
          <thead>
            <th>Train</th>
            <th>Test</th>
            <th>Best Ratio</th>
            <th>Action</th>
          </thead>
          <tbody>
            <tr>
              <td>80</td>
              <td>20</td>
              <td></td>
              <td>
                <button>Hapus</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AddRatioSection;