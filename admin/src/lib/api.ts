export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081/api/v1";

/**
 * Helper to make API requests to the backend.
 * Automatically attaches the JWT access token from localStorage.
 */
export async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  let token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options?.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  let response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401 && typeof window !== "undefined") {
    const refreshToken = localStorage.getItem("refresh_token");
    if (refreshToken && !endpoint.includes("/auth/refresh")) {
      try {
        const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refresh_token: refreshToken })
        });
        
        if (refreshRes.ok) {
          const data = await refreshRes.json();
          localStorage.setItem("access_token", data.access_token);
          if (data.refresh_token) {
            localStorage.setItem("refresh_token", data.refresh_token);
          }
          if (data.user) {
            localStorage.setItem("user", JSON.stringify(data.user));
          }
          
          headers["Authorization"] = `Bearer ${data.access_token}`;
          response = await fetch(url, {
            ...options,
            headers,
          });
        } else {
          throw new Error("Refresh failed");
        }
      } catch (err) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user");
        window.location.href = "/";
        throw new Error("Session expired. Please login again.");
      }
    } else {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");
      window.location.href = "/";
      throw new Error("Session expired. Please login again.");
    }
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || `API request failed: ${response.statusText}`);
  }

  return response.json();
}
