import { BASE_URL } from "@/shared/utils/index-api";

export const get_dataset_by_id_dataset = async (idDataset) => {
  try {
    const response = await fetch(`${BASE_URL}/datasets/${idDataset}/detail-dataset`, {
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
}

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

export const delete_dataset = async (idDataset) => {
  try {
    const response = await fetch(`${BASE_URL}/datasets/${idDataset}`, {
      method: "DELETE",
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
