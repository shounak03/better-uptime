"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../lib/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Globe, LogOut, User } from "lucide-react";

interface Website {
  id: string;
  name: string;
  url: string;
  timeAdded: string;
  WebsiteTick?: Array<{
    status: "UP" | "DOWN" | "UNKNOWN";
    responseTime?: number;
    timeAdded: string;
  }>;
}

export default function DashboardPage() {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();
  const [websites, setWebsites] = useState<Website[]>([]);
  const [isLoadingWebsites, setIsLoadingWebsites] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    // TODO: Fetch user's websites from API
    // For now, using mock data
    const mockWebsites: Website[] = [
      {
        id: "1",
        name: "My Blog",
        url: "https://example.com",
        timeAdded: new Date().toISOString(),
        WebsiteTick: [
          {
            status: "UP",
            responseTime: 250,
            timeAdded: new Date().toISOString(),
          },
        ],
      },
      {
        id: "2",
        name: "E-commerce Site",
        url: "https://shop.example.com",
        timeAdded: new Date().toISOString(),
        WebsiteTick: [
          {
            status: "DOWN",
            responseTime: undefined,
            timeAdded: new Date().toISOString(),
          },
        ],
      },
    ];
    
    setTimeout(() => {
      setWebsites(mockWebsites);
      setIsLoadingWebsites(false);
    }, 1000);
  }, []);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  if (isLoading) {
    return (
      <div style={{ 
        minHeight: "100vh", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center" 
      }}>
        <div>Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "rgb(var(--muted))" }}>
      {/* Header */}
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
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <Globe size={24} color="rgb(var(--primary))" />
            <h1 style={{ fontSize: "1.25rem", fontWeight: "bold" }}>
              Better Uptime
            </h1>
          </div>
          
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
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

      {/* Main Content */}
      <main className="container" style={{ paddingTop: "2rem", paddingBottom: "2rem" }}>
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center",
          marginBottom: "2rem"
        }}>
          <div>
            <h2 style={{ fontSize: "1.875rem", fontWeight: "bold", marginBottom: "0.5rem" }}>
              Your Websites
            </h2>
            <p style={{ color: "rgb(var(--secondary))" }}>
              Monitor your website uptime and performance
            </p>
          </div>
          
          <Link href="/add-website" className="btn btn-primary" style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: "0.5rem" 
          }}>
            <Plus size={16} />
            Add Website
          </Link>
        </div>

        {/* Website List */}
        {isLoadingWebsites ? (
          <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
            <div>Loading your websites...</div>
          </div>
        ) : websites.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
            <Globe size={48} style={{ 
              margin: "0 auto 1rem", 
              color: "rgb(var(--secondary))" 
            }} />
            <h3 style={{ fontSize: "1.25rem", fontWeight: "600", marginBottom: "0.5rem" }}>
              No websites yet
            </h3>
            <p style={{ color: "rgb(var(--secondary))", marginBottom: "2rem" }}>
              Start monitoring your first website by adding it below.
            </p>
            <Link href="/add-website" className="btn btn-primary">
              Add Your First Website
            </Link>
          </div>
        ) : (
          <div style={{ 
            display: "grid", 
            gap: "1rem",
            gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))"
          }}>
            {websites.map((website) => {
              const lastTick = website.WebsiteTick?.[0];
              const status = lastTick?.status || "UNKNOWN";
              
              return (
                <Link 
                  key={website.id} 
                  href={`/website/${website.id}`}
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <div className="card" style={{ 
                    transition: "all 0.2s",
                    cursor: "pointer"
                  }}>
                    <div style={{ 
                      display: "flex", 
                      justifyContent: "space-between", 
                      alignItems: "flex-start",
                      marginBottom: "1rem"
                    }}>
                      <div>
                        <h3 style={{ 
                          fontSize: "1.125rem", 
                          fontWeight: "600",
                          marginBottom: "0.25rem"
                        }}>
                          {website.name}
                        </h3>
                        <p style={{ 
                          color: "rgb(var(--secondary))",
                          fontSize: "0.875rem"
                        }}>
                          {website.url}
                        </p>
                      </div>
                      
                      <div className={`status-indicator status-${status.toLowerCase()}`}>
                        <div style={{ 
                          width: "8px", 
                          height: "8px", 
                          borderRadius: "50%",
                          backgroundColor: status === "UP" ? "rgb(var(--success))" : 
                                        status === "DOWN" ? "rgb(var(--error))" : 
                                        "rgb(var(--warning))"
                        }} />
                        {status}
                      </div>
                    </div>
                    
                    {lastTick && (
                      <div style={{ 
                        display: "flex", 
                        justifyContent: "space-between",
                        fontSize: "0.875rem",
                        color: "rgb(var(--secondary))"
                      }}>
                        <span>
                          Response time: {lastTick.responseTime ? `${lastTick.responseTime}ms` : "N/A"}
                        </span>
                        <span>
                          Last checked: {new Date(lastTick.timeAdded).toLocaleTimeString()}
                        </span>
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
} 