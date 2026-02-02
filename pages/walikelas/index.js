import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../../hooks/useAuth";
import DashboardLayout from "../../components/templates/DashboardLayout";
import Loading from "../../components/atoms/Loading";
import Card from "../../components/atoms/Card";
import Button from "../../components/atoms/Button";
import Badge from "../../components/atoms/Badge";
import * as api from "../../lib/api";
import toast from "react-hot-toast";

export default function WaliKelasDashboard() {
  const { user, isWaliKelas, loading: authLoading } = useAuth();
  const router = useRouter();

  const [students, setStudents] = useState([]);
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summaries, setSummaries] = useState([]);

  useEffect(() => {
    if (!authLoading && !isWaliKelas) {
      if (user) {
        toast.error("Anda tidak memiliki akses ke halaman ini");
      }
      router.replace("/");
    }
  }, [authLoading, isWaliKelas, user, router]);

  useEffect(() => {
    if (isWaliKelas) {
      loadData();
    }
  }, [isWaliKelas]);

  const loadData = async () => {
    try {
      setLoading(true);

      const [studentsRes, gradesRes, summariesRes] = await Promise.all([
        api.getClassStudents(),
        api.getClassGrades(),
        api.getClassSummaries().catch(() => ({ data: [] })),
      ]);

      // Handle paginated response atau array langsung
      const studentsData = Array.isArray(studentsRes.data)
        ? studentsRes.data
        : studentsRes.data?.data || [];

      const gradesData = Array.isArray(gradesRes.data)
        ? gradesRes.data
        : gradesRes.data?.data || [];

      const summariesData = Array.isArray(summariesRes.data)
        ? summariesRes.data
        : summariesRes.data?.data || [];

      setStudents(studentsData);
      setGrades(gradesData);
      setSummaries(summariesData);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Gagal memuat data");
    } finally {
      setLoading(false);
    }
  };

  // Hitung statistik dengan useMemo untuk optimasi
  const stats = useMemo(() => {
    const totalStudents = students.length;
    const maleStudents = students.filter((s) => s.gender === "L").length;
    const femaleStudents = students.filter((s) => s.gender === "P").length;
    const totalGrades = grades.length;

    const avgGrade =
      grades.length > 0
        ? (
            grades.reduce((sum, g) => sum + parseFloat(g.score || 0), 0) /
            grades.length
          ).toFixed(2)
        : 0;

    const excellentGrades = grades.filter((g) => g.score >= 90).length;
    const goodGrades = grades.filter(
      (g) => g.score >= 75 && g.score < 90,
    ).length;
    const averageGrades = grades.filter(
      (g) => g.score >= 60 && g.score < 75,
    ).length;
    const poorGrades = grades.filter((g) => g.score < 60).length;

    // Data untuk grafik distribusi nilai
    const gradeDistribution = [
      { label: "A (≥90)", count: excellentGrades, color: "bg-green-500" },
      { label: "B (75-89)", count: goodGrades, color: "bg-blue-500" },
      { label: "C (60-74)", count: averageGrades, color: "bg-yellow-500" },
      { label: "D (<60)", count: poorGrades, color: "bg-red-500" },
    ];

    // Top 5 siswa dengan rata-rata tertinggi
    const studentAverages = summaries
      .map((summary) => ({
        ...summary,
        student:
          students.find((s) => s.id === summary.student_id) ||
          students.find((s) => s.nis === summary.student_id),
      }))
      .sort((a, b) => (b.average_score || 0) - (a.average_score || 0))
      .slice(0, 5);

    return {
      totalStudents,
      maleStudents,
      femaleStudents,
      totalGrades,
      avgGrade,
      excellentGrades,
      goodGrades,
      averageGrades,
      poorGrades,
      gradeDistribution,
      studentAverages,
    };
  }, [students, grades, summaries]);

  if (authLoading || !isWaliKelas) {
    return <Loading fullScreen />;
  }

  if (loading) {
    return (
      <DashboardLayout>
        <Loading fullScreen text="Memuat data dashboard..." />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Dashboard Wali Kelas
          </h1>
          <p className="text-gray-600">
            Selamat datang, <span className="font-semibold">{user?.name}</span>
          </p>
          <div className="mt-2 flex flex-wrap gap-2 items-center">
            <Badge variant="primary" size="lg">
              🏫 Kelas {user?.class || "-"}
            </Badge>
            <Badge variant="secondary" size="lg">
              📧 {user?.email}
            </Badge>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            {new Date().toLocaleDateString("id-ID", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        {/* Kartu Statistik */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card className="text-center">
            <div className="text-4xl font-bold text-gray-900">
              {stats.totalStudents}
            </div>
            <div className="text-sm text-gray-600 mt-1">Total Siswa</div>
          </Card>
          <Card className="text-center">
            <div className="text-4xl font-bold text-blue-600">
              {stats.maleStudents}
            </div>
            <div className="text-sm text-gray-600 mt-1">Laki-laki</div>
          </Card>
          <Card className="text-center">
            <div className="text-4xl font-bold text-pink-600">
              {stats.femaleStudents}
            </div>
            <div className="text-sm text-gray-600 mt-1">Perempuan</div>
          </Card>
          <Card className="text-center">
            <div className="text-4xl font-bold text-green-600">
              {stats.totalGrades}
            </div>
            <div className="text-sm text-gray-600 mt-1">Total Nilai</div>
          </Card>
          <Card className="text-center">
            <div className="text-4xl font-bold text-purple-600">
              {stats.avgGrade}
            </div>
            <div className="text-sm text-gray-600 mt-1">Rata-rata</div>
          </Card>
          <Card className="text-center">
            <div className="text-4xl font-bold text-yellow-600">
              {stats.excellentGrades}
            </div>
            <div className="text-sm text-gray-600 mt-1">Nilai A</div>
          </Card>
        </div>

        {/* Bagian Grafik */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Distribusi Nilai */}
          <Card>
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              📊 Distribusi Nilai
            </h3>
            <div className="space-y-3">
              {stats.gradeDistribution.map((item, idx) => {
                const percentage =
                  stats.totalGrades > 0
                    ? ((item.count / stats.totalGrades) * 100).toFixed(1)
                    : 0;
                return (
                  <div key={idx}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-700">
                        {item.label}
                      </span>
                      <span className="text-sm font-bold text-gray-900">
                        {item.count} ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`${item.color} h-3 rounded-full transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Top 5 Siswa */}
          <Card>
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              🏆 Top 5 Siswa Berprestasi
            </h3>
            {stats.studentAverages.length > 0 ? (
              <div className="space-y-3">
                {stats.studentAverages.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white font-bold shadow-md">
                        {idx + 1}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">
                          {item.student?.name || "Unknown"}
                        </div>
                        <div className="text-xs text-gray-500">
                          {item.student?.nis || "-"}
                        </div>
                      </div>
                    </div>
                    <Badge variant="success" size="lg">
                      {parseFloat(item.average_score || 0).toFixed(2)}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Belum ada data nilai siswa
              </div>
            )}
          </Card>
        </div>

        {/* Aksi Cepat */}
        <Card>
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            ⚡ Aksi Cepat
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="primary"
              size="lg"
              onClick={() => router.push("/walikelas/siswa")}
              className="w-full"
            >
              👨‍🎓 Kelola Data Siswa
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => router.push("/")}
              className="w-full"
            >
              🔍 Data Publik
            </Button>
            <Button
              variant="ghost"
              size="lg"
              onClick={loadData}
              className="w-full"
            >
              🔄 Refresh Data
            </Button>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
