import "../styles/globals.css";
import Footer from "../components/footer";

export default function MyApp({ Component, pageProps }) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Halaman */}
      <main className="flex-1">
        <Component {...pageProps} />
      </main>

      {/* Footer global */}
      <Footer />
    </div>
  );
}
