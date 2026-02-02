
import { useState, useEffect } from 'react';
import * as api from '../lib/api';

export function useClasses(shouldFetch = true) {
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (shouldFetch) {
            fetchClasses();
        }
    }, [shouldFetch]);

    const fetchClasses = async () => {
        setLoading(true);
        try {
            // Ambil semua data siswa untuk mendapatkan daftar kelas
            // Idealnya backend menyediakan endpoint khusus untuk list kelas, tapi kita ikuti pola yang ada
            const res = await api.getStudents({ per_page: 1000, status: 'Aktif' });
            const allStds = res.data?.data || res.data || [];
            const uniqueClasses = Array.from(new Set(allStds.map(s => s.class || s.kelas).filter(Boolean))).sort();
            setClasses(uniqueClasses);
        } catch (err) {
            console.error("Failed to fetch classes", err);
        } finally {
            setLoading(false);
        }
    };

    return { classes, loading, refetch: fetchClasses };
}
