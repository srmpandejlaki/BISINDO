import { BASE_URL } from "@/shared/utils/index-api";

export const get_datasets_preprocess = async () => {
  try {
    const response = await fetch(`${BASE_URL}/processing/dataset-landmarks/`, {
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

export async function run_processing(idDataset, config) {
  const response = await fetch(
    `${BASE_URL}/processing/${idDataset}/run-landmark`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(config),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.detail);
  }

  return result;
}

export async function get_processing_status(idDataset) {
  const response = await fetch(
    `${BASE_URL}/processing/${idDataset}/status`
  );

  const result = await response.json();

  return result;
}