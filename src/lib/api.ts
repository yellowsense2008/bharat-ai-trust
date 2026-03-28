const API_BASE = "https://rbi-track-c-api-1008375634733.asia-south1.run.app";

async function request(path: string, options?: RequestInit) {
  const token = localStorage.getItem("access_token");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers: { ...headers, ...options?.headers } });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`API error ${res.status}: ${body}`);
  }
  return res.json();
}

export const api = {
  register: (data: { name: string; email: string; password: string; phone?: string }) =>
    request("/auth/register", { method: "POST", body: JSON.stringify({ ...data, role: "citizen" }) }),

  login: async (data: { email: string; password: string }) => {
    const token = localStorage.getItem("access_token");
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: new URLSearchParams({
        username: data.email,
        password: data.password,
      }).toString(),
    });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`API error ${res.status}: ${body}`);
    }
    return res.json();
  },

  createComplaint: (data: { category: string; subcategory?: string; description: string; priority?: string; title?: string }) =>
    request("/complaints/", { method: "POST", body: JSON.stringify(data) }),

  getComplaint: (id: string) => request(`/complaints/${id}`),

  getComplaints: () => request("/complaints/"),

  getMyComplaints: () => request("/complaints/my"),

  getAnalytics: () => request("/analytics/"),
};
