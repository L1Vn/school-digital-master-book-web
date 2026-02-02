import { useState, useEffect } from "react";
import Modal from "../../molecules/Modal";
import Input from "../../atoms/Input";
import Select from "../../atoms/Select";
import Button from "../../atoms/Button";

export default function AddStudentModal({
  open,
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
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setForm({
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
      });
      setError("");
    }
  }, [open]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    // Validasi NIS unik
    if (students.some((s) => s.nis === form.nis)) {
      setError("NIS sudah terdaftar");
      return;
    }

    setLoading(true);
    try {
      await onSave(form);
      onClose();
    } catch (err) {
      setError(err.message || "Gagal menambahkan siswa");
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

  return (
    <Modal isOpen={open} onClose={onClose} title="Tambah Siswa Baru">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="NIS *"
            name="nis"
            value={form.nis}
            onChange={handleChange}
            required
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

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Batal
          </Button>
          <Button type="submit" loading={loading}>
            Simpan
          </Button>
        </div>
      </form>
    </Modal>
  );
}
