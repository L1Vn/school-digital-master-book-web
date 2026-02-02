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
        <Toaster position="top-right" />
      </div>
    </AuthProvider>
  );
}
