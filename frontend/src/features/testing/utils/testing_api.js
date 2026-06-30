import { BASE_URL } from "@/shared/utils/index-api";

export const testModelOnDataset = async (idTrainTest) => {
  try {
    const response = await fetch(`${BASE_URL}/testing/models/${idTrainTest}/test-dataset`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.detail || "Gagal melakukan testing dataset.");
    }

    const data = await response.json();
    if (data && data.success) {
      return data.data;
    }
    throw new Error("Gagal mengambil data testing.");
  } catch (error) {
    console.error("Error testing on dataset:", error);
    throw error;
  }
};

export const testModelOnUpload = async (idTrainTest, file) => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${BASE_URL}/testing/models/${idTrainTest}/test-upload`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.detail || "Gagal menguji file yang diunggah.");
    }

    const data = await response.json();
    if (data && data.success) {
      return data.data;
    }
    throw new Error("Gagal mengambil data prediksi.");
  } catch (error) {
    console.error("Error testing on upload:", error);
    throw error;
  }
};
