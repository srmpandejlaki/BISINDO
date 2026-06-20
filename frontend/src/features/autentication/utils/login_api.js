import { BASE_URL } from "@/shared/utils/index-api";

export const login = async (username, password) => {
  try {
    const response = await fetch(`${BASE_URL}/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Login gagal");
    }

    return await response.json();
  } catch (error) {
    console.error("Error logging in", error);
    throw error;
  }
};