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
    <header className="bg-white dark:bg-gray-800 border-b border-border dark:border-border-dark py-4">
      <div className="container flex justify-between items-center">
        <Link 
          href="/dashboard"
          className="flex items-center gap-3 no-underline text-inherit"
        >
          <Globe size={24} className="text-primary" />
          <h1 className="text-xl font-bold">
            Better Uptime
          </h1>
        </Link>
        
        <div className="flex items-center gap-4">
          <Link 
            href="/add-website" 
            className="btn btn-primary flex items-center gap-2 text-sm"
          >
            <Plus size={16} />
            Add Website
          </Link>
          
          <div className="flex items-center gap-2">
            <User size={16} />
            <span className="text-sm text-secondary dark:text-secondary-dark">
              Welcome back!
            </span>
          </div>
          
          <button 
            onClick={handleLogout}
            className="btn btn-outline flex items-center gap-2"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </div>
    </header>
  );
} 