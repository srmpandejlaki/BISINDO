import { BASE_URL } from "@/shared/utils/index-api";

export const run_preprocessing = async (idDataset, config) => {
  try {
    const response = await fetch(`${BASE_URL}/preprocessing/${idDataset}/run`, {
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
