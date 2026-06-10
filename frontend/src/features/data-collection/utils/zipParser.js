import JSZip from "jszip";

/**
 * Menganalisis struktur file ZIP untuk preview dataset
 * Struktur yang diharapkan:
 * - nama_dataset/
 *   - LABEL_A/
 *     - file1.npy
 *     - file2.npy
 *   - LABEL_B/
 *     - file1.npy
 */
export const parseZipDataset = async (zipFile) => {
  const zip = new JSZip();
  
  try {
    // Load file ZIP ke memori
    const loadedZip = await zip.loadAsync(zipFile);
    
    const labelData = {}; // Menyimpan format: { "LABEL_A": 12, "LABEL_B": 15 }
    let totalData = 0;
    let ukuranFile = 0;

    // Menghitung total data dan ukuran file
    loadedZip.forEach((relativePath, fileInfo) => {
      if (!fileInfo.dir && relativePath.endsWith(".npy")) {
        totalData += 1;
        ukuranFile += fileInfo.size;
      }
    });

    // Iterasi setiap file/folder di dalam ZIP
    loadedZip.forEach((relativePath, fileInfo) => {
      // Abaikan jika folder bawaan OS (seperti __MACOSX) atau file tersembunyi
      if (relativePath.includes("__MACOSX") || relativePath.startsWith(".")) {
        return;
      }

      // Pecah path untuk menganalisis struktur folder
      // Contoh path: "dataset_name/LABEL_A/data1.npy"
      const pathParts = relativePath.split("/");
      
      // Kita mencari file .npy yang berada di dalam folder label (indeks ke-1 atau ke-2 tergantung struktur zip)
      // Struktur ideal: pathParts[0] = Nama Dataset, pathParts[1] = Label, pathParts[2] = File .npy
      if (!fileInfo.dir && relativePath.endsWith(".npy")) {
        let labelName = "UNKNOWN";

        if (pathParts.length >= 3) {
          // Jika ada root folder utama di dalam zip
          labelName = pathParts[1].toUpperCase();
        } else if (pathParts.length === 2) {
          // Jika folder label berada langsung di root zip
          labelName = pathParts[0].toUpperCase();
        }

        if (labelName) {
          labelData[labelName] = (labelData[labelName] || 0) + 1;
          totalData++;
        }
      }
    });

    // Ubah ke format array untuk mempermudah rendering di tabel
    const labelsList = Object.entries(labelData).map(([name, count]) => ({
      name,
      count,
    }));

    return {
      fileName: zipFile.name,
      fileSize: (ukuranFile / 1024 / 1024).toFixed(2),
      totalLabel: labelsList.length,
      totalData: totalData,
      labels: labelsList, // Array berisi [{ name: "A", count: 100 }, ...]
    };
  } catch (error) {
    console.error("Gagal membaca file ZIP:", error);
    throw new Error("File ZIP rusak atau tidak valid.");
  }
};