
import { useState, useCallback } from 'react';
import * as api from '../lib/api';
import toast from 'react-hot-toast';

export function useStudents(initialParams = {}) {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchStudents = useCallback(async (params) => {
        setLoading(true);
        try {
            const res = await api.getStudents({ ...initialParams, ...params });
            const data = res.data?.data || res.data || [];
            setStudents(data);
            return data;
        } catch (err) {
            console.error("Error fetching students", err);
            toast.error("Gagal memuat data siswa");
            return [];
        } finally {
            setLoading(false);
        }
    }, [JSON.stringify(initialParams)]);

    return { students, loading, fetchStudents, setStudents };
}
