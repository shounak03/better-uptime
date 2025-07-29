"use client";

import Link from "next/link";
import { useAuth } from "../lib/auth";
import { useRouter } from "next/navigation";
import { Globe, LogOut, User, Plus } from "lucide-react";

export default function Navigation() {
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <header style={{ 
      backgroundColor: "white", 
      borderBottom: "1px solid rgb(var(--border))",
      padding: "1rem 0"
    }}>
      <div className="container" style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center" 
      }}>
        <Link 
          href="/dashboard"
          style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: "0.75rem",
            textDecoration: "none",
            color: "inherit"
          }}
        >
          <Globe size={24} color="rgb(var(--primary))" />
          <h1 style={{ fontSize: "1.25rem", fontWeight: "bold" }}>
            Better Uptime
          </h1>
        </Link>
        
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <Link 
            href="/add-website" 
            className="btn btn-primary"
            style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "0.5rem",
              fontSize: "0.875rem"
            }}
          >
            <Plus size={16} />
            Add Website
          </Link>
          
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <User size={16} />
            <span style={{ fontSize: "0.875rem", color: "rgb(var(--secondary))" }}>
              Welcome back!
            </span>
          </div>
          
          <button 
            onClick={handleLogout}
            className="btn btn-outline"
            style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </div>
    </header>
  );
} 