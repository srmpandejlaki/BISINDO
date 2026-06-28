import { BASE_URL } from "@/shared/utils/index-api";

export async function get_preprocessing_status(idDataset) {
  const response = await fetch(
    `${BASE_URL}/preprocessing/${idDataset}/status`
  );

  if (!response.ok) {
    throw new Error("Gagal mengambil status preprocessing");
  }

  const result = await response.json();

  return result.data;
}

export const run_preprocessing = async (idDataset, config) => {
  try {
    const response = await fetch(`${BASE_URL}/preprocessing/${idDataset}/preprocess`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(config),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Preprocessing gagal");
    }

    return await response.json();
  } catch (error) {
    console.error("Error running preprocessing", error);
    throw error;
  }
};
