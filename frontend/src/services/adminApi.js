const API_BASE_URL = "http://127.0.0.1:8000";

export async function getAdminDashboard() {
  const response = await fetch(
    `${API_BASE_URL}/admin/dashboard?role=admin`
  );

  if (!response.ok) {
    throw new Error("Failed to load admin dashboard");
  }

  return response.json();
}