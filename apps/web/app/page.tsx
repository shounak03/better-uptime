"use client";

import { useEffect } from "react";
import { useAuth } from "../lib/auth";
import { useRouter } from "next/navigation";
import { Globe } from "lucide-react";

export default function Home() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        router.push("/dashboard");
      } else {
        router.push("/login");
      }
    }
  }, [user, isLoading, router]);

  // Show loading screen while checking authentication
  return (
    <div style={{ 
      minHeight: "100vh", 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center",
      flexDirection: "column",
      gap: "1rem"
    }}>
      <div style={{ 
        display: "flex", 
        alignItems: "center", 
        gap: "0.75rem",
        marginBottom: "1rem"
      }}>
        <Globe size={32} color="rgb(var(--primary))" />
        <h1 style={{ fontSize: "2rem", fontWeight: "bold" }}>
          Better Uptime
        </h1>
      </div>
      
      <div style={{ 
        color: "rgb(var(--secondary))",
        fontSize: "1rem"
      }}>
        Loading...
      </div>
    </div>
  );
}
