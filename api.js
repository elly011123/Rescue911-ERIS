function authHeader() {
  const token = localStorage.getItem("access_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(path, options = {}) {
  const base = window.ERIS_CONFIG.apiBaseUrl;
  const headers = {
    ...(options.headers || {}),
    ...authHeader()
  };

  const res = await fetch(`${base}${path}`, { ...options, headers });

  if (res.status === 401) {
    localStorage.removeItem("access_token");
    localStorage.removeItem("id_token");
    localStorage.removeItem("refresh_token");
    location.href = "index.html";
    return null;
  }

  return res;
}

export async function apiGet(path) {
  const res = await request(path, { method: "GET" });
  if (!res) return null;
  return res.ok ? res.json() : null;
}

export async function apiPost(path, body) {
  const res = await request(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body || {})
  });
  if (!res) return null;
  return res.ok ? res.json() : null;
}

export async function apiPatch(path, body) {
  const res = await request(path, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body || {})
  });
  if (!res) return null;
  return res.ok ? res.json() : null;
}
