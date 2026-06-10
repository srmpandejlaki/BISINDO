import { BASE_URL } from "@/shared/utils/index-api";

export const get_all_datasets = async () => {
  try {
    const response = await fetch(`${BASE_URL}/datasets/`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      console.error("Failed to fetch datasets. ", response.status, response.statusText);
      return [];
    }

    const data = await response.json();
    
    if (data?.data && Array.isArray(data.data)) return data.data;
    if (Array.isArray(data.data)) return data;
    console.log("Unknown data format", data);

    return [];

  } catch (error) {
    console.log("Error fetching datasets", error);
    return [];
  }
};

export const create_dataset_from_zip = async (file) => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${BASE_URL}/datasets/`, {
      method: "POST",
      body: formData, 
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