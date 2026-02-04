function base64UrlEncode(bytes) {
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

async function sha256ToBase64Url(text) {
  const enc = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest("SHA-256", enc);
  return base64UrlEncode(new Uint8Array(hash));
}

function randomString(len = 64) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
  const arr = crypto.getRandomValues(new Uint8Array(len));
  let out = "";
  for (let i = 0; i < len; i++) out += chars[arr[i] % chars.length];
  return out;
}

export async function startLogin() {
  const { clientId, cognitoDomain, redirectUri } = window.ERIS_CONFIG;

  const verifier = randomString(64);
  const challenge = await sha256ToBase64Url(verifier);

  sessionStorage.setItem("pkce_verifier", verifier);

  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: "openid email",
    code_challenge_method: "S256",
    code_challenge: challenge
  });

  location.href = `${cognitoDomain}/oauth2/authorize?${params.toString()}`;
}

export async function exchangeCodeForTokens(code) {
  const { clientId, cognitoDomain, redirectUri } = window.ERIS_CONFIG;
  const verifier = sessionStorage.getItem("pkce_verifier");
  if (!verifier) throw new Error("Missing PKCE verifier");

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: clientId,
    code,
    redirect_uri: redirectUri,
    code_verifier: verifier
  });

  const res = await fetch(`${cognitoDomain}/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString()
  });

  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();

  localStorage.setItem("access_token", data.access_token);
  localStorage.setItem("id_token", data.id_token);
  if (data.refresh_token) localStorage.setItem("refresh_token", data.refresh_token);

  sessionStorage.removeItem("pkce_verifier");
  return data;
}

function parseJwt(token) {
  const payload = token.split(".")[1];
  const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
  return JSON.parse(json);
}

export function getCurrentUser() {
  const idToken = localStorage.getItem("id_token");
  if (!idToken) return null;

  const claims = parseJwt(idToken);
  const groups = claims["cognito:groups"] || [];
  const role = Array.isArray(groups) ? groups[0] : groups;

  return {
    username: claims["cognito:username"] || claims["username"] || claims["email"],
    email: claims["email"] || "",
    role: role || "unknown",
    claims
  };
}

export function requireAuth(allowedRoles = []) {
  const user = getCurrentUser();
  if (!user) {
    location.href = "index.html";
    return null;
  }
  if (allowedRoles.length && !allowedRoles.includes(user.role)) {
    location.href = "index.html";
    return null;
  }
  return user;
}

export function routeByRole(user) {
  if (!user || !user.role) return "index.html";
  if (user.role === "operator") return "operator.html";
  if (user.role === "manager") return "manager.html";
  if (user.role === "emt") return "emt.html";
  return "index.html";
}

export function logout() {
  const { cognitoDomain, clientId, logoutUri } = window.ERIS_CONFIG;

  localStorage.removeItem("access_token");
  localStorage.removeItem("id_token");
  localStorage.removeItem("refresh_token");

  const params = new URLSearchParams({
    client_id: clientId,
    logout_uri: logoutUri
  });

  location.href = `${cognitoDomain}/logout?${params.toString()}`;
}
