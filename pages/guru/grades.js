import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../../hooks/useAuth";
import { useClasses } from "../../hooks/useClasses";
import { useGrades } from "../../hooks/useGrades";
import { useStudents } from "../../hooks/useStudents";
import DashboardLayout from "../../components/templates/DashboardLayout";
import Loading from "../../components/atoms/Loading";
import Card from "../../components/atoms/Card";
import Button from "../../components/atoms/Button";
import Input from "../../components/atoms/Input";
import Select from "../../components/atoms/Select";
import Badge from "../../components/atoms/Badge";
import AddGradeModal from "../../components/organisms/modals/AddGradeModal";
import toast from "react-hot-toast";

const SEMESTER_OPTIONS = [
  { value: "Ganjil 2023/2024", label: "Ganjil 2023/2024" },
  { value: "Genap 2023/2024", label: "Genap 2023/2024" },
  { value: "Ganjil 2024/2025", label: "Ganjil 2024/2025" },
  { value: "Genap 2024/2025", label: "Genap 2024/2025" },
  { value: "Ganjil 2025/2026", label: "Ganjil 2025/2026" },
  { value: "Genap 2025/2026", label: "Genap 2025/2026" },
];

export default function InputNilaiPage() {
  const { user, isGuru, loading: authLoading } = useAuth();
  const router = useRouter();

  // Hooks
  const { classes } = useClasses(isGuru);
  const {
    grades,
    loading: gradesLoading,
    fetchGrades,
    saveGrade,
    setGrades,
  } = useGrades();
  const {
    students,
    loading: studentsLoading,
    fetchStudents,
  } = useStudents({ per_page: 1000 });

  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filter
  const [filters, setFilters] = useState({
    kelas: "",
    semester: "",
    search: "",
  });

  const [inputValues, setInputValues] = useState({});

  useEffect(() => {
    if (!authLoading && !isGuru) {
      router.push("/login");
    }
  }, [authLoading, isGuru, router]);

  // Load Data
  useEffect(() => {
    if (isGuru) {
      loadData();
    }
  }, [isGuru, filters.kelas, filters.semester]);

  const loadData = async () => {
    // Siapkan parameter
    const commonParams = { per_page: 1000 };
    if (filters.kelas) commonParams.class = filters.kelas;

    // Fetch Paralel
    await Promise.all([
      fetchStudents(commonParams), // Updates 'students' state
      fetchGrades({ ...commonParams, semester: filters.semester }), // Updates 'grades' state
    ]);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  // Sinkronisasi nilai input dari data grades
  useEffect(() => {
    const newValues = {};
    // students come from hook state
    students.forEach((s) => {
      const g = grades.find(
        (gx) => gx.student_id == s.nis && gx.semester === filters.semester,
      );
      newValues[s.nis] = g ? g.score : "";
    });
    setInputValues(newValues);
  }, [grades, students, filters.semester]);

  const handleInputChange = (studentId, value) => {
    setInputValues((prev) => ({ ...prev, [studentId]: value }));
  };

  const handleSaveGrade = async (studentId) => {
    if (!filters.semester) {
      toast.error("Pilih semester terlebih dahulu");
      return;
    }

    const score = inputValues[studentId];
    if (score === "" || score === null || score === undefined) {
      toast.error("Nilai tidak boleh kosong");
      return;
    }

    const numScore = parseInt(score);
    if (numScore < 0 || numScore > 100 || isNaN(numScore)) {
      toast.error("Nilai harus 0-100");
      return;
    }

    const toastId = toast.loading("Menyimpan...");
    const existingGrade = grades.find(
      (g) => g.student_id == studentId && g.semester === filters.semester,
    );

    try {
      const updatedGrade = await saveGrade(
        studentId,
        filters.semester,
        numScore,
        existingGrade?.id,
      );

      // Optimistic update atau sinkronisasi state
      if (existingGrade) {
        setGrades((prev) =>
          prev.map((g) => (g.id === existingGrade.id ? updatedGrade : g)),
        );
      } else {
        setGrades((prev) => [...prev, updatedGrade]);
      }

      toast.success("Nilai berhasil disimpan", { id: toastId });
    } catch (error) {
      const msg = error.response?.data?.error || "Gagal menyimpan";
      toast.error(msg, { id: toastId });
    }
  };

  const handleGradeAdded = (newGrade) => {
    setGrades((prev) => [...prev, newGrade]);
  };

  // Logika Tampilan Terfilter
  const studentIdsWithGrades = useMemo(() => {
    return grades
      .filter((g) => g.semester === filters.semester)
      .map((g) => String(g.student_id));
  }, [grades, filters.semester]);

  const displayedStudents = useMemo(() => {
    if (!filters.semester) return [];

    return students.filter((s) => {
      const hasGrade = studentIdsWithGrades.includes(String(s.nis));
      if (!hasGrade) return false;

      const matchSearch = filters.search
        ? (s.name?.toLowerCase() || "").includes(
            filters.search.toLowerCase(),
          ) ||
          (s.nis && s.nis.toString().includes(filters.search))
        : true;

      return matchSearch;
    });
  }, [students, studentIdsWithGrades, filters.semester, filters.search]);

  if (authLoading || !isGuru) return <Loading fullScreen />;

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Input Nilai
            </h1>
            <p className="text-gray-600">Kelola nilai siswa</p>
          </div>
          <div>
            <Button
              variant="primary"
              onClick={() => {
                if (!filters.semester) {
                  toast.error("Pilih semester terlebih dahulu");
                  return;
                }
                setIsModalOpen(true);
              }}
              disabled={!filters.semester}
            >
              + Tambah Nilai
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6 sticky top-0 z-10 shadow-md">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              name="semester"
              label="Semester"
              placeholder="Pilih Semester"
              value={filters.semester}
              onChange={handleFilterChange}
              options={SEMESTER_OPTIONS}
            />
            <Select
              name="kelas"
              label="Kelas"
              placeholder="Semua Kelas"
              value={filters.kelas}
              onChange={handleFilterChange}
              options={classes.map((c) => ({ value: c, label: c }))}
            />
            <Input
              name="search"
              label="Cari"
              placeholder="Nama / NIS..."
              value={filters.search}
              onChange={handleFilterChange}
            />
          </div>
        </Card>

        {/* Grid */}
        {gradesLoading || studentsLoading ? (
          <Loading text="Memuat data..." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayedStudents.map((student) => {
              const val = inputValues[student.nis] ?? "";
              const gradeLetter =
                val !== ""
                  ? val >= 90
                    ? "A"
                    : val >= 75
                      ? "B"
                      : val >= 60
                        ? "C"
                        : "D"
                  : "-";

              return (
                <div
                  key={student.nis}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 transition hover:shadow-md"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 flex items-center justify-center rounded-full text-lg ${student.gender === "L" ? "bg-blue-50 text-blue-600" : "bg-pink-50 text-pink-600"}`}
                      >
                        {student.gender === "L" ? "👨" : "👩"}
                      </div>
                      <div>
                        <h3
                          className="font-bold text-gray-900 line-clamp-1"
                          title={student.name}
                        >
                          {student.name}
                        </h3>
                        <span className="text-sm font-mono text-gray-500">
                          {student.nis}
                        </span>
                      </div>
                    </div>
                    <Badge variant="success">Aktif</Badge>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4 text-xs">
                    <span className="px-2 py-1 bg-gray-100 rounded text-gray-600 font-medium">
                      Kelas: {student.class || student.kelas || "N/A"}
                    </span>
                    <span className="px-2 py-1 bg-gray-100 rounded text-gray-600 font-medium">
                      Sem: {filters.semester}
                    </span>
                  </div>

                  <div className="border-t border-gray-50 pt-4">
                    <label className="block text-xs font-semibold text-gray-700 mb-2">
                      Nilai
                    </label>
                    <div className="flex items-stretch gap-2">
                      <div className="relative flex-1">
                        <input
                          type="number"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition font-medium"
                          placeholder="0"
                          min="0"
                          max="100"
                          value={val}
                          onChange={(e) =>
                            handleInputChange(student.nis, e.target.value)
                          }
                          onKeyDown={(e) =>
                            e.key === "Enter" && handleSaveGrade(student.nis)
                          }
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 pointer-events-none">
                          {gradeLetter}
                        </div>
                      </div>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleSaveGrade(student.nis)}
                      >
                        Simpan
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {!gradesLoading &&
          !studentsLoading &&
          displayedStudents.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              {!filters.semester
                ? "Pilih semester untuk melihat data nilai"
                : "Tidak ada data nilai ditemukan. Tambahkan nilai baru."}
            </div>
          )}
      </div>

      <AddGradeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        semester={filters.semester}
        students={students}
        existingGradeStudentIds={studentIdsWithGrades}
        onSuccess={handleGradeAdded}
      />
    </DashboardLayout>
  );
}
