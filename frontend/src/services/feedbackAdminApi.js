import { API_BASE_URL } from "./api";

export async function getAdminFeedback() {
  const response = await fetch(
    `${API_BASE_URL}/admin/feedback?role=admin`
  );

  if (!response.ok) {
    throw new Error("Unable to load feedback");
  }

  return response.json();
}