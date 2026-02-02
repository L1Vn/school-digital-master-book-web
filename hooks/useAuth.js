import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { login as loginApi, logout as logoutApi, getCurrentUser as getCurrentUserApi } from '../lib/api';
import toast from 'react-hot-toast';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    // Cek apakah user sudah login saat mount
    useEffect(() => {
        checkAuth();
    }, []);

    async function checkAuth() {
        try {
            const userData = await getCurrentUserApi();
            setUser({ ...userData.user });
        } catch (error) {
            // Belum terautentikasi atau sesi berakhir
            setUser(null);
        } finally {
            setLoading(false);
        }
    }

    async function login(email, password) {
        try {
            const response = await loginApi(email, password);
            const userData = response.user;

            setUser(userData);
            toast.success('Login berhasil!');

            // Redirect berdasarkan role
            redirectByRole(userData);

            return { success: true };
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Email atau password salah';
            toast.error(errorMessage);
            return { success: false, error: errorMessage };
        }
    }

    async function logout() {
        try {
            await logoutApi();
        } catch (error) {
            console.log('Logout error:', error);
        } finally {
            setUser(null);
            toast.success('Logout berhasil');
            router.push('/');
        }
    }

    function redirectByRole(userData) {
        const role = userData.role;

        switch (role) {
            case 'admin':
                router.push('/admin');
                break;

            case 'guru':
                router.push('/guru');
                break;

            case 'wali_kelas':
                router.push('/walikelas');
                break;

            case 'alumni':
                router.push('/alumni/profile');
                break;

            default:
                toast.error('Role tidak dikenali');
                router.push('/');
        }
    }

    const value = {
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        isGuru: user?.role === 'guru',
        isWaliKelas: user?.role === 'wali_kelas',
        isAlumni: user?.role === 'alumni',
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }

    return context;
}

export default AuthContext;
