import { useState, useEffect } from "react";
import Modal from "../../molecules/Modal";
import Select from "../../atoms/Select";
import Input from "../../atoms/Input";
import Button from "../../atoms/Button";
import * as api from "../../../lib/api";
import toast from "react-hot-toast";

export default function AddGradeModal({
  isOpen,
  onClose,
  semester,
  students,
  onSuccess,
  existingGradeStudentIds,
}) {
  const [formData, setFormData] = useState({
    student_id: "",
    score: "",
  });
  const [loading, setLoading] = useState(false);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setFormData({ student_id: "", score: "" });
    }
  }, [isOpen]);

  // Filter siswa yang belum memiliki nilai untuk semester ini
  // KECUALI jika kita ingin mengizinkan input ulang. Requirement mengatakan "tampilkan siswa yang sudah dinilai" dalam list yang berbeda.
  // Jadi list ini hanya untuk siswa yang BELUM dinilai.
  const availableStudents = students
    .filter(
      (s) =>
        !existingGradeStudentIds.includes(String(s.nis)) &&
        s.status !== "Alumni", // Filter out Alumni from creation? Requirement implies managing active students mostly.
    )
    .map((s) => ({
      value: s.nis,
      label: `${s.name} (${s.nis}) - ${s.class}`,
    }));

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.student_id) {
      toast.error("Pilih siswa terlebih dahulu");
      return;
    }
    if (formData.score === "") {
      toast.error("Nilai tidak boleh kosong");
      return;
    }

    const numScore = parseInt(formData.score);
    if (numScore < 0 || numScore > 100) {
      toast.error("Nilai harus 0-100");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        student_id: formData.student_id,
        semester: semester,
        score: numScore,
      };

      const res = await api.storeMyGrade(payload);
      toast.success("Nilai berhasil ditambahkan");
      onSuccess(res.data?.data || res.data);
      onClose();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Gagal menambahkan nilai");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Tambah Nilai"
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Batal
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={loading || !formData.student_id}
          >
            {loading ? "Menyimpan..." : "Simpan"}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-700 mb-4">
          Menambahkan nilai untuk semester: <strong>{semester}</strong>
        </div>

        <Select
          label="Pilih Siswa"
          name="student_id"
          value={formData.student_id}
          onChange={handleChange}
          options={availableStudents}
          placeholder={
            availableStudents.length === 0
              ? "Semua siswa sudah dinilai"
              : "Pilih Siswa..."
          }
          disabled={availableStudents.length === 0}
        />

        <Input
          label="Nilai (0-100)"
          type="number"
          name="score"
          value={formData.score}
          onChange={handleChange}
          min="0"
          max="100"
          placeholder="Contoh: 85"
        />
      </div>
    </Modal>
  );
}
