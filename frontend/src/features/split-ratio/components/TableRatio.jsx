import React from "react";
import { delete_ratio } from "../utils/split_ratio_api";

function TableRatio({ ratios, loading, error, fetchRatios, testingStatus}) {
  // Handler untuk menghapus ratio
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Apakah Anda yakin ingin menghapus ratio ini?");
    if (!confirmDelete) return;

    try {
      const result = await delete_ratio(id);
      if (result && result.success) {
        alert("Ratio berhasil dihapus.");
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
    <div className="table-ratio">
      <h3>Daftar Rasio Pembagian Data</h3>
      {loading ? (
        <p>Memuat data ratio...</p>
      ) : error ? (
        <p className="error-message text-error">{error}</p>
      ) : (
        <div className="table">
          <table>
            <thead>
              <tr>
                <th>Latih</th>
                <th>Uji</th>
                <th>Validasi</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {ratios.length > 0 ? (
                ratios.map((item) => {
                  // Pisahkan format string "80:20" menjadi 80 dan 20
                  const parts = item.trainRatio ? item.trainRatio.split(":") : [];
                  const train = parts[0] || item.trainRatio;
                  const test = parts[1] || "";
                  const val = parts[2] || "";


                  return (
                    <tr key={item.idRatioDataSplit}>
                      <td className="text-center">{train}</td>
                      <td className="text-center">{test}</td>
                      <td className="text-center">{val}</td>
                      <td className="text-center">{item.bestRatio ? "⭐" : "-"}</td>
                      <td className="text-center">
                        <button 
                          onClick={() => handleDelete(item.idRatioDataSplit)}
                          disabled={isTesting}
                          className="button delete"
                        >
                          Hapus
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="5" className="text-center">
                    Tidak ada data ratio
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default TableRatio;