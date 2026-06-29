import { BASE_URL } from "@/shared/utils/index-api";

export const get_all_label = async () => {
  const response = await fetch(`${BASE_URL}/datasets/labels`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const data = await response.json();
  return data;
};