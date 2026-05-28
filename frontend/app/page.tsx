"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userType = localStorage.getItem("userType");
    if (token && userType === "ADMIN") {
      router.replace("/dashboard");
    } else if (token && userType === "DOCTOR") {
      router.replace("/doctor-portal");
    } else {
      router.replace("/login");
    }
  }, [router]);
  return null;
}
