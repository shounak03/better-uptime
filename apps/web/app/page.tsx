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
    <div className="min-h-screen flex items-center justify-center flex-col gap-4">
      <div className="flex items-center gap-3 mb-4">
        <Globe size={32} className="text-primary" />
        <h1 className="text-3xl font-bold">
          Better Uptime
        </h1>
      </div>
      
      <div className="text-secondary text-base">
        Loading...
      </div>
    </div>
  );
}
