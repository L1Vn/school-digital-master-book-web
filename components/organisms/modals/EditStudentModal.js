import { useState, useEffect } from "react";
import Modal from "../../molecules/Modal";
import Input from "../../atoms/Input";
import Select from "../../atoms/Select";
import Button from "../../atoms/Button";

export default function EditStudentModal({
  open,
  student,
  onClose,
  onSave,
  students = [],
}) {
  const [form, setForm] = useState({
    nis: "",
    nisn: "",
    name: "",
    gender: "L",
    birth_place: "",
    birth_date: "",
    religion: "Islam",
    father_name: "",
    address: "",
    ijazah_number: "",
    rombel_absen: "",
    status: "siswa",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Populate form when student changes
  useEffect(() => {
    if (student && open) {
      setForm({
        nis: student.nis || "",
        nisn: student.nisn || "",
        name: student.name || "",
        gender: student.gender || "L",
        birth_place: student.birth_place || "",
        birth_date: student.birth_date || "",
        religion: student.religion || "Islam",
        father_name: student.father_name || "",
        address: student.address || "",
        ijazah_number: student.ijazah_number || "",
        rombel_absen: student.rombel_absen || "",
        status: student.status || "siswa",
      });
      setError("");
    }
  }, [student, open]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    setLoading(true);
    try {
      await onSave(form);
      onClose();
    } catch (err) {
      setError(err.message || "Gagal memperbarui data siswa");
    } finally {
      setLoading(false);
    }
  }

  const religionOptions = [
    { value: "Islam", label: "Islam" },
    { value: "Kristen", label: "Kristen" },
    { value: "Katolik", label: "Katolik" },
    { value: "Hindu", label: "Hindu" },
    { value: "Buddha", label: "Buddha" },
    { value: "Konghucu", label: "Konghucu" },
  ];

  const genderOptions = [
    { value: "L", label: "Laki-laki" },
    { value: "P", label: "Perempuan" },
  ];

  const statusOptions = [
    { value: "siswa", label: "Siswa Aktif" },
    { value: "alumni", label: "Alumni" },
  ];

  return (
    <Modal isOpen={open} onClose={onClose} title="Edit Data Siswa">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="NIS"
            name="nis"
            value={form.nis}
            onChange={handleChange}
            disabled
          />
          <Input
            label="NISN *"
            name="nisn"
            value={form.nisn}
            onChange={handleChange}
            required
          />
        </div>

        <Input
          label="Nama Lengkap *"
          name="name"
          value={form.name}
          onChange={handleChange}
          required
        />

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Jenis Kelamin"
            name="gender"
            value={form.gender}
            onChange={handleChange}
            options={genderOptions}
          />
          <Select
            label="Agama"
            name="religion"
            value={form.religion}
            onChange={handleChange}
            options={religionOptions}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Tempat Lahir *"
            name="birth_place"
            value={form.birth_place}
            onChange={handleChange}
            required
          />
          <Input
            type="date"
            label="Tanggal Lahir *"
            name="birth_date"
            value={form.birth_date}
            onChange={handleChange}
            required
          />
        </div>

        <Input
          label="Nama Ayah *"
          name="father_name"
          value={form.father_name}
          onChange={handleChange}
          required
        />

        <Input
          label="Alamat *"
          name="address"
          value={form.address}
          onChange={handleChange}
          required
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="No. Ijazah"
            name="ijazah_number"
            value={form.ijazah_number}
            onChange={handleChange}
          />
          <Input
            label="Rombel & Absen *"
            name="rombel_absen"
            value={form.rombel_absen}
            onChange={handleChange}
            placeholder="Contoh: X-1-01"
            required
          />
        </div>

        <Select
          label="Status"
          name="status"
          value={form.status}
          onChange={handleChange}
          options={statusOptions}
        />

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Batal
          </Button>
          <Button type="submit" loading={loading}>
            Simpan Perubahan
          </Button>
        </div>
      </form>
    </Modal>
  );
}
