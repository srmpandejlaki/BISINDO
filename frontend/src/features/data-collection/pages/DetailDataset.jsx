import React from "react";

function DetailDataset() {
  return (
    <div className="content detail-dataset">
      <h1>Detail Dataset</h1>

      <table>
        <thead>
          <tr>
            <th>No.</th>
            <th>Name</th>
            <th>Label</th>
            <th>Frame</th>
            <th>Tangan</th>
            <th>Preview</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>1</td>
            <td>Dataset 1</td>
            <td>This is the first dataset.</td>
            <td>Frame 1</td>
            <td>Tangan 1</td>
            <td>Preview 1</td>
            <td>Status 1</td>
            <td>Action 1</td>
          </tr>
          <tr>
            <td>2</td>
            <td>Dataset 2</td>
            <td>This is the second dataset.</td>
            <td>Frame 2</td>
            <td>Tangan 2</td>
            <td>Preview 2</td>
            <td>Status 2</td>
            <td>Action 2</td>
          </tr>
        </tbody>
      </table>
      <button><a href="/admin/data-collection">Kembali</a></button>
    </div>
  )
}

export default DetailDataset;