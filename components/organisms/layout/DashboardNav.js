import Link from "next/link";
import { useRouter } from "next/router";

export default function DashboardNav({ items }) {
    const router = useRouter();

    return (
        <nav className="bg-white rounded-2xl shadow-soft p-2 mb-8 overflow-hidden">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                {items.map((item) => {
                    const isActive = router.pathname === item.href;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`
                                flex items-center gap-2 px-5 py-3 rounded-xl font-semibold whitespace-nowrap transition-all duration-200
                                ${isActive
                                    ? "bg-gradient-to-r from-primary to-indigo-600 text-white shadow-lg"
                                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                                }
                            `}
                        >
                            <span className={`text-lg ${isActive ? "scale-110" : ""} transition-transform`}>
                                {item.icon}
                            </span>
                            <span className="hidden sm:inline">{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
