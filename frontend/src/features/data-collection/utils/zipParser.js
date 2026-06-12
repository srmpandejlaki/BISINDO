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
  const zip = await JSZip.loadAsync(zipFile);

  const labels = new Set();
  let totalData = 0;

  zip.forEach((path, file) => {
    if (file.dir) return;

    if (!path.endsWith(".npy")) return;

    const parts = path.split("/");

    if (parts.length >= 2) {
      labels.add(parts[parts.length - 2]);
    }

    totalData++;
  });

  return {
    fileName: zipFile.name,
    fileSize: (zipFile.size / 1024 / 1024).toFixed(2),
    totalLabel: labels.size,
    totalData,
  };
};