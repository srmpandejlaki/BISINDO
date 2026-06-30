import React, { useState } from "react";
import { add_ratio } from "../utils/split_ratio_api";

function AddRatioSection({ fetchRatios, testingStatus }) {
  const [trainVal, setTrainVal] = useState("");
  const [testVal, setTestVal] = useState("");
  const [valVal, setValVal] = useState("");

  // Handler untuk menambah ratio
  const handleAdd = async (e) => {
    e.preventDefault();
    if (!trainVal || !testVal || !valVal) {
      alert("Mohon isi nilai Train, Test dan Val!");
      return;
    }

    const trainNum = parseInt(trainVal);
    const testNum = parseInt(testVal);
    const valNum = parseInt(valVal);
    
    // Validasi opsional agar total input berjumlah 100%
    if (trainNum + testNum + valNum !== 100) {
      const confirmAdd = window.confirm("Jumlah Train + Test + Val tidak sama dengan 100. Tetap tambahkan?");
      if (!confirmAdd) return;
    }

    const ratioString = `${trainVal}:${testVal}:${valVal}`; // Format tersimpan 80:10:10
    try {
      const result = await add_ratio({ trainRatio: ratioString });
      if (result && result.success) {
        setTrainVal("");
        setTestVal("");
        setValVal("");
        alert("Ratio berhasil ditambahkan.");
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
          <label>Latih:</label>
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
          <label>Uji:</label>
          <input
            type="number"
            placeholder="20"
            value={testVal}
            onChange={(e) => setTestVal(e.target.value)}
            min="0"
            max="100"
            disabled={isTesting}
            required
          />
        </div>
        <div className="input">
          <label>Validasi:</label>
          <input
            type="number"
            placeholder="20"
            value={valVal}
            onChange={(e) => setValVal(e.target.value)}
            min="0"
            max="100"
            disabled={isTesting}
            required
          />
        </div>
        <button className="button" type="submit" disabled={isTesting}>Tambah Rasio</button>
      </form>
    </div>
  );
}

export default AddRatioSection;