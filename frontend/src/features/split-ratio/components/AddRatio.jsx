import React, { useState } from "react";
import { add_ratio, delete_ratio } from "../utils/split_ratio_api";

function AddRatioSection({ ratios, loading, error, fetchRatios, testingStatus }) {
  const [trainVal, setTrainVal] = useState("");
  const [testVal, setTestVal] = useState("");

  // Handler untuk menambah ratio
  const handleAdd = async (e) => {
    e.preventDefault();
    if (!trainVal || !testVal) {
      alert("Mohon isi nilai Train dan Test!");
      return;
    }

    const trainNum = parseInt(trainVal);
    const testNum = parseInt(testVal);
    
    // Validasi opsional agar total input berjumlah 100%
    if (trainNum + testNum !== 100) {
      const confirmAdd = window.confirm("Jumlah Train + Test tidak sama dengan 100. Tetap tambahkan?");
      if (!confirmAdd) return;
    }

    const ratioString = `${trainVal}:${testVal}`; // Format tersimpan 80:20
    try {
      const result = await add_ratio({ trainRatio: ratioString });
      if (result && result.success) {
        setTrainVal("");
        setTestVal("");
        fetchRatios(); // Refresh tabel setelah berhasil menambahkan
      } else {
        alert("Gagal menambahkan ratio.");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan saat menghubungi server.");
    }
  };

  // Handler untuk menghapus ratio
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Apakah Anda yakin ingin menghapus ratio ini?");
    if (!confirmDelete) return;

    try {
      const result = await delete_ratio(id);
      if (result && result.success) {
        fetchRatios(); // Refresh tabel setelah berhasil menghapus
      } else {
        alert("Gagal menghapus ratio.");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan saat menghapus ratio.");
    }
  };

  const isTesting = testingStatus === "testing";

  return (
    <div className="add-ratio-section">
      <div className="add-form">
        <h3>Ratio Data Split (train : test)</h3>
        <form className="form-ratio" onSubmit={handleAdd}>
          <div className="input">
            <label>Train:</label>
            <input
              type="number"
              placeholder="60"
              value={trainVal}
              onChange={(e) => setTrainVal(e.target.value)}
              min="0"
              max="100"
              disabled={isTesting}
              required
            />
          </div>
          <div className="input">
            <label>Test:</label>
            <input
              type="number"
              placeholder="40"
              value={testVal}
              onChange={(e) => setTestVal(e.target.value)}
              min="0"
              max="100"
              disabled={isTesting}
              required
            />
          </div>
          <button type="submit" disabled={isTesting}>Tambah Ratio</button>
        </form>
      </div>

      <div className="table-ratio">
        <h3>Tabel Data Split Ratio</h3>
        {loading ? (
          <p>Memuat data ratio...</p>
        ) : error ? (
          <p className="error-message text-error">{error}</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Train</th>
                <th>Test</th>
                <th>Best Ratio</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {ratios.length > 0 ? (
                ratios.map((item) => {
                  // Pisahkan format string "80:20" menjadi 80 dan 20
                  const parts = item.trainRatio ? item.trainRatio.split(":") : [];
                  const train = parts[0] || item.trainRatio;
                  const test = parts[1] || "";

                  return (
                    <tr key={item.idRatioDataSplit}>
                      <td className="text-center">{train}</td>
                      <td className="text-center">{test}</td>
                      <td className="text-center">{item.bestRatio ? "⭐" : "-"}</td>
                      <td className="text-center">
                        <button 
                          onClick={() => handleDelete(item.idRatioDataSplit)}
                          disabled={isTesting}
                        >
                          Hapus
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="4" className="text-center">
                    Tidak ada data ratio
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default AddRatioSection;