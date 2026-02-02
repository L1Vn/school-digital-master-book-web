// API Base URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

// Helper to get cookie by name
function getCookie(name) {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2)
    return decodeURIComponent(parts.pop().split(";").shift());
  return null;
}

// Helper function to make authenticated requests
async function apiRequest(endpoint, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
    "X-Requested-With": "XMLHttpRequest", // Penting agar Laravel menganggap sebagai AJAX
    ...options.headers,
  };

  // Manual CSRF Token injection (karena fetch tidak auto-attach X-XSRF-TOKEN)
  const xsrfToken = getCookie("XSRF-TOKEN");
  if (xsrfToken) {
    headers["X-XSRF-TOKEN"] = xsrfToken;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: "include", // Penting: kirim cookies dengan request
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "Request failed" }));
    // Jika 401 (Unauthenticated) atau 419 (CSRF Token Mismatch), lempar error
    throw { response: { data: error }, status: response.status };
  }

  return response.json();
}

// =====================
// AUTHENTICATION
// =====================

export async function getCsrfToken() {
  // Sanctum CSRF endpoint ada di root (bukan /api)
  // Hapus '/api' di akhir API_URL jika ada
  const baseUrl = API_URL.replace(/\/api\/?$/, "");

  // Gunakan fetch langsung karena endpoint ini bisa jadi return 204 No Content
  return fetch(`${baseUrl}/sanctum/csrf-cookie`, {
    method: "GET",
    credentials: "include",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });
}

export async function login(email, password) {
  // Initialize CSRF protection first
  await getCsrfToken();

  return apiRequest("/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function logout() {
  return apiRequest("/logout", { method: "POST" });
}

export async function getCurrentUser() {
  return apiRequest("/current-user");
}

// =====================
// STUDENTS (Admin)
// =====================

export async function getStudents(params = {}) {
  const query = new URLSearchParams(params).toString();
  return apiRequest(`/students${query ? `?${query}` : ""}`);
}

export async function getStudent(nis) {
  return apiRequest(`/students/${nis}`);
}

export async function createStudent(data) {
  return apiRequest("/students", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateStudent(nis, data) {
  return apiRequest(`/students/${nis}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteStudent(nis) {
  return apiRequest(`/students/${nis}`, {
    method: "DELETE",
  });
}

// =====================
// ALUMNI (Admin)
// =====================

export async function getAlumni(params = {}) {
  const query = new URLSearchParams(params).toString();
  return apiRequest(`/alumni${query ? `?${query}` : ""}`);
}

export async function getAlumnus(nim) {
  return apiRequest(`/alumni/${nim}`);
}

export async function createAlumnus(data) {
  return apiRequest("/alumni", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateAlumnus(nim, data) {
  return apiRequest(`/alumni/${nim}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteAlumnus(nim) {
  return apiRequest(`/alumni/${nim}`, {
    method: "DELETE",
  });
}

// Alumni profile (for logged-in alumni)
export async function getMyProfile() {
  return apiRequest("/my-profile");
}

export async function updateMyProfile(data) {
  return apiRequest("/my-profile", {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

// =====================
// SUBJECTS (Admin)
// =====================

export async function getSubjects(params = {}) {
  const query = new URLSearchParams(params).toString();
  return apiRequest(`/subjects${query ? `?${query}` : ""}`);
}

export async function getSubject(id) {
  return apiRequest(`/subjects/${id}`);
}

export async function createSubject(data) {
  return apiRequest("/subjects", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateSubject(id, data) {
  return apiRequest(`/subjects/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteSubject(id) {
  return apiRequest(`/subjects/${id}`, {
    method: "DELETE",
  });
}

// =====================
// USERS (Admin)
// =====================

export async function getUsers(params = {}) {
  const query = new URLSearchParams(params).toString();
  return apiRequest(`/users${query ? `?${query}` : ""}`);
}

export async function getUser(id) {
  return apiRequest(`/users/${id}`);
}

export async function createUser(data) {
  return apiRequest("/users", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateUser(id, data) {
  return apiRequest(`/users/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteUser(id) {
  return apiRequest(`/users/${id}`, {
    method: "DELETE",
  });
}

// =====================
// GRADES
// =====================

// Admin - Get all grades
export async function getGrades(params = {}) {
  const query = new URLSearchParams(params).toString();
  return apiRequest(`/grades${query ? `?${query}` : ""}`);
}

// Admin - Create grade
export async function createGrade(data) {
  return apiRequest("/grades", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// Admin - Update grade
export async function updateGrade(id, data) {
  return apiRequest(`/grades/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

// Admin - Delete grade
export async function deleteGrade(id) {
  return apiRequest(`/grades/${id}`, {
    method: "DELETE",
  });
}

// Guru - Get my grades (for subject I teach)
export async function getMyGrades(params = {}) {
  const query = new URLSearchParams(params).toString();
  return apiRequest(`/my-grades${query ? `?${query}` : ""}`);
}

// Guru - Store grade for my subject
export async function storeMyGrade(data) {
  return apiRequest("/my-grades", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// Guru - Update grade for my subject
export async function updateMyGrade(id, data) {
  return apiRequest(`/my-grades/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

// Guru - Delete grade for my subject
export async function deleteMyGrade(id) {
  return apiRequest(`/my-grades/${id}`, {
    method: "DELETE",
  });
}

// Wali Kelas - Get grades for my class
export async function getClassGrades(params = {}) {
  const query = new URLSearchParams(params).toString();
  return apiRequest(`/wali/grades${query ? `?${query}` : ""}`);
}

// Wali Kelas - Store grade for my class
export async function storeClassGrade(data) {
  return apiRequest("/wali/grades", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// Wali Kelas - Update grade for my class
export async function updateClassGrade(id, data) {
  return apiRequest(`/wali/grades/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

// Wali Kelas - Delete grade for my class
export async function deleteClassGrade(id) {
  return apiRequest(`/wali/grades/${id}`, {
    method: "DELETE",
  });
}

export async function getClassStudents() {
  return apiRequest("/wali/students");
}

export async function getClassStudent(nis) {
  return apiRequest(`/wali/students/${nis}`);
}

export async function updateClassStudent(nis, data) {
  return apiRequest(`/wali/students/${nis}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

// Wali Kelas - Get subjects (for dropdown in grade form)
export async function getClassSubjects() {
  return apiRequest("/wali/subjects");
}

// =====================
// GRADE SUMMARIES
// =====================

export async function getGradeSummaries(params = {}) {
  const query = new URLSearchParams(params).toString();
  return apiRequest(`/grade-summaries${query ? `?${query}` : ""}`);
}

export async function getGradeSummary(studentId, semester) {
  return apiRequest(`/grade-summaries/${studentId}/${semester}`);
}

// Wali Kelas - Get summaries for my class
export async function getClassSummaries() {
  return apiRequest("/wali/grade-summaries");
}

// =====================
// PUBLIC ENDPOINTS (No Auth Required)
// =====================

export async function publicGetStudents(search = "") {
  const query = search ? `?q=${encodeURIComponent(search)}` : "";
  return fetch(`${API_URL}/public/students${query}`).then((res) => res.json());
}

export async function publicSearchStudents(search) {
  return fetch(
    `${API_URL}/public/students/search?q=${encodeURIComponent(search)}`,
  ).then((res) => res.json());
}

export async function publicGetStudent(nis) {
  return fetch(`${API_URL}/public/students/${nis}`).then((res) => res.json());
}

export async function publicGetAlumni(search = "") {
  const query = search ? `?q=${encodeURIComponent(search)}` : "";
  return fetch(`${API_URL}/public/alumni${query}`).then((res) => res.json());
}

export async function publicSearchAlumni(search) {
  return fetch(
    `${API_URL}/public/alumni/search?q=${encodeURIComponent(search)}`,
  ).then((res) => res.json());
}

export async function publicGetAlumnus(nim) {
  return fetch(`${API_URL}/public/alumni/${nim}`).then((res) => res.json());
}

// =====================
// NOTIFICATIONS (Admin)
// =====================

export async function getNotifications(params = {}) {
  const query = new URLSearchParams(params).toString();
  return apiRequest(`/notifications${query ? `?${query}` : ""}`);
}

export async function getNotification(id) {
  return apiRequest(`/notifications/${id}`);
}

export async function markNotificationAsRead(id) {
  return apiRequest(`/notifications/${id}/read`, {
    method: "PATCH",
  });
}

export async function markAllNotificationsAsRead() {
  return apiRequest("/notifications/mark-all-read", {
    method: "POST",
  });
}

export async function getUnreadNotificationsCount() {
  return apiRequest("/notifications/unread-count");
}

export async function deleteNotification(id) {
  return apiRequest(`/notifications/${id}`, {
    method: "DELETE",
  });
}
