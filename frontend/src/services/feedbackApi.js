const API_BASE_URL = "http://127.0.0.1:8000";

export async function submitFeedback({
  sessionId,
  query,
  answer,
  rating,
  comment = null,
}) {
  const response = await fetch(
    `${API_BASE_URL}/feedback`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        session_id: sessionId,
        query,
        answer,
        rating,
        comment,
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Feedback failed: ${response.status} ${errorText}`
    );
  }

  return response.json();
}