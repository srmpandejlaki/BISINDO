import { BASE_URL } from "@/shared/utils/index-api";

export const add_ratio = async (data) => {
  try {
    const response = await fetch(`${BASE_URL}/processing/add-ratio/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      console.error("Failed to fetch datasets. ", response.status, response.statusText);
      return [];
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.log("Error fetching datasets", error);
    return [];
  }
};

export const get_all_ratio = async () => {
  try {
    const response = await fetch(`${BASE_URL}/processing/ratio/`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      console.error("Failed to fetch datasets. ", response.status, response.statusText);
      return [];
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.log("Error fetching datasets", error);
    return [];
  }
};

export const delete_ratio = async (id) => {
  try {
    const response = await fetch(`${BASE_URL}/processing/ratio/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      console.error("Failed to fetch datasets. ", response.status, response.statusText);
      return [];
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.log("Error fetching datasets", error);
    return [];
  }
};