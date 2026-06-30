import { BASE_URL } from "@/shared/utils/index-api";

export const getEvaluationMetrics = async (idTraining) => {
  try {
    const response = await fetch(`${BASE_URL}/testing/models/${idTraining}/evaluation`, {
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

export const get_result_by_testing_id = async (idTesting) => {
  try {
    const response = await fetch(`${BASE_URL}/testing/result/${idTesting}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.detail || "Gagal mengambil hasil testing.");
    }

    const data = await response.json();
    if (data && data.success) {
      return data.data;
    }
    return null;
  } catch (error) {
    console.error("Error fetching result by testing ID:", error);
    throw error;
  }
};

