import { BASE_URL } from "@/shared/utils/index-api";

export const get_datasets_landmarks = async () => {
  try {
    const response = await fetch(`${BASE_URL}/processing/landmarks/`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      console.error("Failed to fetch datasets. ", response.status, response.statusText);
      return [];
    }

    const data = await response.json();
    if (data && data.success && Array.isArray(data.data)) {
      return data.data;
    }
    return [];
  } catch (error) {
    console.log("Error fetching datasets", error);
    return [];
  }
};

export const get_dataset_landmark_by_id = async (idDataset) => {
  try {
    const response = await fetch(`${BASE_URL}/processing/landmarks/${idDataset}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      console.error("Failed to fetch datasets. ", response.status, response.statusText);
      return [];
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.log("Error fetching datasets", error);
    return [];
  }
};