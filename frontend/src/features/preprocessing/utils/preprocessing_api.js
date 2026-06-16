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

export const get_dataset_by_id = async (idDataset) => {
  try {
    const response = await fetch(`${BASE_URL}/preprocessing/${idDataset}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      console.error("Failed to fetch dataset.", response.status);
      return null;
    }

    const data = await response.json();
    return data?.data || null;
  } catch (error) {
    console.error("Error fetching dataset", error);
    return null;
  }
};
