// Role Pengguna
export const ROLES = {
    ADMIN: 'admin',
    GURU: 'guru',
    WALI_KELAS: 'wali_kelas',
    ALUMNI: 'alumni',
};

// Pilihan Jenis Kelamin
export const GENDER = {
    MALE: 'L',
    FEMALE: 'P',
};

// Pesan Error API
export const ERROR_MESSAGES = {
    NETWORK_ERROR: 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.',
    UNAUTHORIZED: 'Sesi Anda telah berakhir. Silakan login kembali.',
    FORBIDDEN: 'Anda tidak memiliki akses untuk melakukan aksi ini.',
    NOT_FOUND: 'Data tidak ditemukan.',
    VALIDATION_ERROR: 'Data yang Anda masukkan tidak valid.',
    SERVER_ERROR: 'Terjadi kesalahan pada server. Silakan coba lagi nanti.',
};

// Kredensial Test (untuk development)
export const TEST_CREDENTIALS = {
    ADMIN: {
        email: 'admin@school.com',
        password: 'password123',
    },
    GURU: {
        email: 'guru@school.com',
        password: 'password123',
    },
    WALI_KELAS: {
        email: 'wali@school.com',
        password: 'password123',
    },
    ALUMNI: {
        email: 'alumni@school.com',
        password: 'password123',
    },
};
