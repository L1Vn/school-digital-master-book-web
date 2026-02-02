import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../../hooks/useAuth";
import DashboardLayout from "../../components/templates/DashboardLayout";
import Loading from "../../components/atoms/Loading";
import Card from "../../components/atoms/Card";
import Select from "../../components/atoms/Select";
import Badge from "../../components/atoms/Badge";
import * as api from "../../lib/api";
import toast from "react-hot-toast";

const SimpleBarChart = ({ data }) => {
    const maxVal = Math.max(...data.map(d => d.value), 1);
    
    return (
        <div className="space-y-4">
            {data.map((item, idx) => (
                <div key={idx} className="relative">
                    <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-gray-700">{item.label}</span>
                        <span className="text-gray-500">{item.value} ({Math.round(item.value / (data.reduce((a,b)=>a+b.value,0) || 1) * 100)}%)</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5">
                        <div 
                            className={`h-2.5 rounded-full ${item.color}`} 
                            style={{ width: `${(item.value / maxVal) * 100}%` }}
                        ></div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default function GuruDashboard() {
    const { user, isGuru, loading: authLoading } = useAuth();
    const router = useRouter();

    const [grades, setGrades] = useState([]);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);

    const [filters, setFilters] = useState({
        semester: "",
        kelas: "",
    });

    const SEMESTER_OPTIONS = [
        { value: "Ganjil 2023/2024", label: "Ganjil 2023/2024" },
        { value: "Genap 2023/2024", label: "Genap 2023/2024" },
        { value: "Ganjil 2024/2025", label: "Ganjil 2024/2025" },
        { value: "Genap 2024/2025", label: "Genap 2024/2025" },
        { value: "Ganjil 2025/2026", label: "Ganjil 2025/2026" },
        { value: "Genap 2025/2026", label: "Genap 2025/2026" },
    ];

    useEffect(() => {
        if (!authLoading && !isGuru) {
            router.push("/login");
        }
    }, [authLoading, isGuru, router]);

    useEffect(() => {
        if (isGuru) {
            loadData();
        }
    }, [isGuru, filters]);

    const loadData = async () => {
        const toastId = toast.loading("Sedang memuat data...");
        try {
            setLoading(true);
            const params = {
                per_page: 1000, // Ensure we get enough data for stats
            };
            
            if (filters.semester) params.semester = filters.semester;
            if (filters.kelas) params.class = filters.kelas;

            const [gradesRes, studentsRes] = await Promise.all([
                api.getMyGrades(params),
                api.getStudents({ per_page: 1000 }), 
            ]);

            setGrades(gradesRes.data?.data || gradesRes.data || []);
            setStudents(studentsRes.data?.data || studentsRes.data || []);
            toast.success("Data berhasil dimuat", { id: toastId });
        } catch (error) {
            console.error("Error loading data:", error);
            toast.error("Gagal memuat data", { id: toastId });
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    // State Turunan
    const classes = useMemo(() => {
        const s = new Set(students.map(std => std.class || std.kelas).filter(Boolean));
        return Array.from(s).sort();
    }, [students]);

    const filteredGrades = grades; // Data sudah difilter oleh API

    const stats = useMemo(() => {
        const total = filteredGrades.length;
        const totalScore = filteredGrades.reduce((acc, curr) => acc + parseFloat(curr.score), 0);
        const avg = total > 0 ? (totalScore / total).toFixed(2) : 0;
        
        const excellent = filteredGrades.filter(g => g.score >= 90).length;
        const good = filteredGrades.filter(g => g.score >= 75 && g.score < 90).length;
        const fair = filteredGrades.filter(g => g.score >= 60 && g.score < 75).length;
        const poor = filteredGrades.filter(g => g.score < 60).length;

        return { total, avg, excellent, good, fair, poor };
    }, [filteredGrades]);

    const chartData = [
        { label: "Sangat Baik (≥90)", value: stats.excellent, color: "bg-green-500" },
        { label: "Baik (75-89)", value: stats.good, color: "bg-blue-500" },
        { label: "Cukup (60-74)", value: stats.fair, color: "bg-yellow-500" },
        { label: "Kurang (<60)", value: stats.poor, color: "bg-red-500" },
    ];

    if (authLoading || !isGuru) return <Loading fullScreen />;

    return (
        <DashboardLayout>
            <div className="container mx-auto px-4 max-w-7xl pb-12">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Dashboard Guru
                    </h1>
                    <div className="flex flex-col md:flex-row md:items-center gap-4 text-gray-600">
                        <p>Selamat datang, <span className="font-semibold text-gray-900">{user?.name}</span></p>
                        <div className="hidden md:block h-1 w-1 bg-gray-300 rounded-full"></div>
                        <div className="flex items-center gap-2">
                            <Badge variant="primary" size="sm">📚 {user?.subject?.name || "Mapel"}</Badge>
                            <span className="text-sm">{user?.email}</span>
                        </div>
                    </div>
                </div>

                {/* Filter */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row gap-4">
                   <div className="w-full md:w-64">
                        <Select
                            name="kelas"
                            placeholder="Semua Kelas"
                            value={filters.kelas}
                            onChange={handleFilterChange}
                            options={classes.map(c => ({ value: c, label: c }))}
                        />
                   </div>
                   <div className="w-full md:w-64">
                        <Select
                            name="semester"
                            placeholder="Semua Semester"
                            value={filters.semester}
                            onChange={handleFilterChange}
                            options={SEMESTER_OPTIONS}
                        />
                   </div>
                   <div className="flex-1 flex justify-end">
                       {/* Aksi Opsional */}
                   </div>
                </div>

                {/* Kartu Statistik */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                    <Card padding="normal" className="transform transition hover:scale-105">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
                            <div className="text-xs text-gray-500 font-medium mt-1 uppercase tracking-wider">Total Data</div>
                        </div>
                    </Card>
                    <Card padding="normal" className="transform transition hover:scale-105">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-indigo-600">{stats.avg}</div>
                            <div className="text-xs text-gray-500 font-medium mt-1 uppercase tracking-wider">Rata-rata</div>
                        </div>
                    </Card>
                    <Card padding="normal" className="bg-green-50 border-green-100">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-green-600">{stats.excellent}</div>
                            <div className="text-xs text-green-700 font-medium mt-1 uppercase tracking-wider">Sangat Baik</div>
                        </div>
                    </Card>
                    <Card padding="normal" className="bg-blue-50 border-blue-100">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-blue-600">{stats.good}</div>
                            <div className="text-xs text-blue-700 font-medium mt-1 uppercase tracking-wider">Baik</div>
                        </div>
                    </Card>
                    <Card padding="normal" className="bg-yellow-50 border-yellow-100">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-yellow-600">{stats.fair}</div>
                            <div className="text-xs text-yellow-700 font-medium mt-1 uppercase tracking-wider">Cukup</div>
                        </div>
                    </Card>
                    <Card padding="normal" className="bg-red-50 border-red-100">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-red-600">{stats.poor}</div>
                            <div className="text-xs text-red-700 font-medium mt-1 uppercase tracking-wider">Kurang</div>
                        </div>
                    </Card>
                </div>

                {/* Area Grafik */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card className="lg:col-span-2">
                        <div className="mb-4">
                            <h3 className="text-lg font-bold text-gray-900">Distribusi Nilai</h3>
                             <p className="text-sm text-gray-500">
                                {filters.kelas ? `Kelas ${filters.kelas}` : "Semua Kelas"} • {filters.semester || "Semua Semester"}
                            </p>
                        </div>
                        <SimpleBarChart data={chartData} />
                    </Card>

                    <Card>
                        <div className="mb-4">
                            <h3 className="text-lg font-bold text-gray-900">Informasi</h3>
                        </div>
                        <div className="space-y-4 text-sm text-gray-600">
                            <p>
                                Dashboard ini menampilkan ringkasan data nilai yang telah Anda input. Gunakan filter di atas untuk melihat statistik spesifik per kelas atau semester.
                            </p>
                            <div className="p-4 bg-blue-50 rounded-lg text-blue-800">
                                <strong>Tips:</strong>
                                <br/>
                                Klik menu "Input Nilai" di samping untuk menambah atau mengedit nilai siswa.
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}
