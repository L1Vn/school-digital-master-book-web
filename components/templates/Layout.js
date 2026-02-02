import Header from '../Header';

export default function Layout({ children }) {
    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            <Header />

            <main className="flex-1">
                {children}
            </main>


        </div>
    );
}
