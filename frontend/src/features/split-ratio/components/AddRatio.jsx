import React from "react";

function AddRatioSection() {
  return (
    <div className="add-ratio-section">
      <div className="add-form">
        <h3>Ratio Data Split (train : test)</h3>
        <form className="form-ratio">
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
        <h3>Tabel Data Split Ratio</h3>
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