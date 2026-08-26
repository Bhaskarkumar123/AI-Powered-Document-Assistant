const API_BASE_URL = "http://127.0.0.1:8000";

export async function getAdminFeedback() {
  const response = await fetch(
    `${API_BASE_URL}/admin/feedback?role=admin`
  );

  if (!response.ok) {
    throw new Error("Unable to load feedback");
  }

  return response.json();
}