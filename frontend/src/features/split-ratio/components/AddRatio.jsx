import React, { useState } from "react";
import { add_ratio } from "../utils/split_ratio_api";

function AddRatioSection({ fetchRatios, testingStatus }) {
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

  const isTesting = testingStatus === "testing";

  return (
    <div className="add-form add-ratio">
      <h3>Rasio Pembagian<br />Data Latih : Data Uji</h3>
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
      </form>
      <button className="button" type="submit" disabled={isTesting}>Tambah Ratio</button>
    </div>
  );
}

export default AddRatioSection;