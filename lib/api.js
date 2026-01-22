const API_URL =
  "https://school-digital-master-book-api-production.up.railway.app";

// =====================
// LOGIN
// =====================
export async function loginApi(payload) {
  const res = await fetch(`${API_URL}/api/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error("Email atau password salah");
  }

  return res.json();
}

// =====================
// CURRENT USER
// =====================
export async function getCurrentUser() {
  const token = localStorage.getItem("token");
  if (!token) return null;

  const res = await fetch(`${API_URL}/api/current-user`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    localStorage.clear();
    return null;
  }

  return res.json();
}

// =====================
// LOGOUT
// =====================
export async function logoutApi() {
  const token = localStorage.getItem("token");

  try {
    await fetch(`${API_URL}/api/logout`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (err) {
    console.log("Token expired / logout gagal");
  } finally {
    localStorage.clear();
  }
}
