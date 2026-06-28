
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
            const res = await api.getClassrooms();
            setClasses(res?.data || []);
        } catch (err) {
            console.error("Failed to fetch classes", err);
        } finally {
            setLoading(false);
        }
    };

    return { classes, loading, refetch: fetchClasses };
}
