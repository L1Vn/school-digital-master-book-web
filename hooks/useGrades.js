
import { useState, useCallback } from 'react';
import * as api from '../lib/api';
import toast from 'react-hot-toast';

export function useGrades() {
    const [grades, setGrades] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchGrades = useCallback(async (params) => {
        setLoading(true);
        try {
            const res = await api.getMyGrades(params);
            setGrades(res.data?.data || res.data || []);
        } catch (error) {
            console.error("Error fetching grades", error);
            toast.error("Gagal memuat nilai");
        } finally {
            setLoading(false);
        }
    }, []);

    const saveGrade = async (studentId, semester, score, existingGradeId = null) => {
        const data = {
            student_id: studentId,
            semester: semester,
            score: score
        };

        try {
            let res;
            if (existingGradeId) {
                res = await api.updateMyGrade(existingGradeId, data);
            } else {
                res = await api.storeMyGrade(data);
            }
            return res.data?.data || res.data;
        } catch (error) {
            console.error(error);
            throw error;
        }
    };

    return { 
        grades, 
        loading, 
        fetchGrades, 
        saveGrade,
        setGrades 
    };
}
