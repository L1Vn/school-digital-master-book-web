import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import HomePage from "./index"; // atau langsung copy konten dashboard lama

export default function Dashboard() {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const logged = localStorage.getItem("logged_in");
    if (!logged) {
      router.push("/"); // guest diarahkan ke landing
    } else {
      setAllowed(true);
    }
  }, []);

  if (!allowed) return null;
  return <HomePage />; // halaman dashboard lama
}
