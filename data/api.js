const API_URL = process.env.NEXT_PUBLIC_API_URL;

// =======================
// STUDENT
// =======================

export async function getStudentById(id) {
  const res = await fetch(`${API_URL}/students/${id}`);
  if (!res.ok) throw new Error("Data siswa tidak ditemukan");
  return res.json();
}

export async function createStudent(data) {
  const res = await fetch(`${API_URL}/students`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Gagal menambah data siswa");
  return res.json();
}

export async function updateStudent(id, data) {
  const res = await fetch(`${API_URL}/students/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Gagal update data siswa");
  return res.json();
}

export async function deleteStudent(id) {
  const res = await fetch(`${API_URL}/students/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Gagal hapus data siswa");
  return true;
}

// =======================
// RAPORT & OTHERS
// =======================

export async function getRaport(id) {
  const res = await fetch(`${API_URL}/students/${id}/report`);
  if (!res.ok) return null;
  return res.json();
}

export async function getOthers(id) {
  const res = await fetch(`${API_URL}/students/${id}/others`);
  if (!res.ok) return null;
  return res.json();
}