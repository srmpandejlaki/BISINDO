import { BASE_URL } from "@/shared/utils/index-api";

export const getEvaluationMetrics = async (idTrainTest) => {
  try {
    const response = await fetch(`${BASE_URL}/testing/models/${idTrainTest}/evaluation`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.detail || "Gagal memuat data evaluasi.");
    }

    const data = await response.json();
    if (data && data.success) {
      return data.data;
    }
    return null;
  } catch (error) {
    console.error("Error fetching evaluation metrics:", error);
    throw error;
  }
};
