import { API_BASE_URL } from "./api";

export async function getAdminDashboard() {
  const response = await fetch(
    `${API_BASE_URL}/admin/dashboard?role=admin`
  );

  if (!response.ok) {
    throw new Error("Failed to load admin dashboard");
  }

  return response.json();
}