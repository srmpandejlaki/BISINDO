import { BASE_URL } from "@/shared/utils/index-api";

export const get_all_models = async () => {
  try {
    const response = await fetch(`${BASE_URL}/processing/models/`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      console.error("Failed to fetch models. ", response.status, response.statusText);
      return [];
    }

    const data = await response.json();
    if (data && data.success && Array.isArray(data.data)) {
      return data.data;
    }
    return [];
    
  } catch (error) {
    console.log("Error fetching models", error);
    return [];
  }
};

export const get_best_ratio = async () => {
  try {
    const response = await fetch(`${BASE_URL}/processing/best-ratio/`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      console.error("Failed to fetch best ratio. ", response.status, response.statusText);
      return null;
    }

    const data = await response.json();
    if (data && data.success) {
      return data.data;
    }
    return null;
    
  } catch (error) {
    console.log("Error fetching best ratio", error);
    return null;
  }
};