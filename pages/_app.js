import "../styles/globals.css";
import Footer from "../components/organisms/layout/Footer";


import { AuthProvider } from "../hooks/useAuth";
import { Toaster } from "react-hot-toast";

export default function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col">
        {/* Halaman */}
        <main className="flex-1">
          <Component {...pageProps} />
        </main>

        {/* Global Footer */}
        <Footer />


        {/* Toast notifications */}
        <Toaster 
          position="top-right" 
          toastOptions={{
            duration: 3000,
            style: {
              background: '#fff',
              color: '#1f2937',
              borderRadius: '12px',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
              fontFamily: '"Source Sans 3", sans-serif',
              border: '1px solid #f3f4f6',
            },
            success: {
              iconTheme: {
                primary: '#955893',
                secondary: '#fff',
              },
            },
            error: {
              duration: 5000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </div>
    </AuthProvider>
  );
}
