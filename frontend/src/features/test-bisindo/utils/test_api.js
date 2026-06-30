import { BASE_URL } from "@/shared/utils/index-api";

export const run_test = async (idTrainTest, config) => {
  try {
    const response = await fetch(`${BASE_URL}/testing/realtime/${idTrainTest}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(config),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Test gagal");
    }

    return await response.json();
  } catch (error) {
    console.error("Error running test", error);
    throw error;
  }
};