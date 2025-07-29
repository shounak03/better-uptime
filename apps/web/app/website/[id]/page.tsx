"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../../lib/auth";
import { websiteAPI } from "../../../lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Globe, Activity, Clock, TrendingUp, AlertCircle } from "lucide-react";

interface WebsiteTick {
  id: string;
  status: "UP" | "DOWN" | "UNKNOWN";
  responseTime?: number;
  timeAdded: string;
}

interface Website {
  id: string;
  name: string;
  url: string;
  timeAdded: string;
  WebsiteTick: WebsiteTick[];
}

export default function WebsiteStatusPage({ params }: { params: { id: string } }) {
  const { user } = useAuth();
  const router = useRouter();
  const [website, setWebsite] = useState<Website | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    const fetchWebsiteStatus = async () => {
      try {
        const data = await websiteAPI.getStatus(params.id);
        setWebsite(data);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to fetch website status");
      } finally {
        setIsLoading(false);
      }
    };

    fetchWebsiteStatus();
  }, [user, params.id, router]);

  if (!user) {
    return null;
  }

  if (isLoading) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "rgb(var(--muted))" }}>
        <header style={{ 
          backgroundColor: "white", 
          borderBottom: "1px solid rgb(var(--border))",
          padding: "1rem 0"
        }}>
          <div className="container">
            <Link 
              href="/dashboard" 
              className="btn btn-outline"
              style={{ display: "flex", alignItems: "center", gap: "0.5rem", width: "fit-content" }}
            >
              <ArrowLeft size={16} />
              Back to Dashboard
            </Link>
          </div>
        </header>
        
        <main className="container" style={{ paddingTop: "2rem" }}>
          <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
            <div>Loading website status...</div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !website) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "rgb(var(--muted))" }}>
        <header style={{ 
          backgroundColor: "white", 
          borderBottom: "1px solid rgb(var(--border))",
          padding: "1rem 0"
        }}>
          <div className="container">
            <Link 
              href="/dashboard" 
              className="btn btn-outline"
              style={{ display: "flex", alignItems: "center", gap: "0.5rem", width: "fit-content" }}
            >
              <ArrowLeft size={16} />
              Back to Dashboard
            </Link>
          </div>
        </header>
        
        <main className="container" style={{ paddingTop: "2rem" }}>
          <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
            <AlertCircle size={48} style={{ 
              margin: "0 auto 1rem", 
              color: "rgb(var(--error))" 
            }} />
            <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "0.5rem" }}>
              Website Not Found
            </h2>
            <p style={{ color: "rgb(var(--secondary))", marginBottom: "2rem" }}>
              {error || "The website you're looking for doesn't exist or you don't have access to it."}
            </p>
            <Link href="/dashboard" className="btn btn-primary">
              Return to Dashboard
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const lastTick = website.WebsiteTick[0];
  const currentStatus = lastTick?.status || "UNKNOWN";
  
  // Calculate uptime percentage (mock calculation for demo)
  const uptimePercentage = website.WebsiteTick.length > 0 
    ? Math.round((website.WebsiteTick.filter(tick => tick.status === "UP").length / website.WebsiteTick.length) * 100)
    : 0;

  // Calculate average response time
  const responseTimes = website.WebsiteTick
    .filter(tick => tick.responseTime)
    .map(tick => tick.responseTime!);
  const avgResponseTime = responseTimes.length > 0 
    ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length)
    : 0;

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "rgb(var(--muted))" }}>
      {/* Header */}
      <header style={{ 
        backgroundColor: "white", 
        borderBottom: "1px solid rgb(var(--border))",
        padding: "1rem 0"
      }}>
        <div className="container">
          <Link 
            href="/dashboard" 
            className="btn btn-outline"
            style={{ display: "flex", alignItems: "center", gap: "0.5rem", width: "fit-content" }}
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container" style={{ paddingTop: "2rem", paddingBottom: "2rem" }}>
        {/* Website Header */}
        <div className="card" style={{ marginBottom: "2rem" }}>
          <div style={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "flex-start",
            marginBottom: "1rem"
          }}>
            <div>
              <h1 style={{ 
                fontSize: "2rem", 
                fontWeight: "bold", 
                marginBottom: "0.5rem" 
              }}>
                {website.name}
              </h1>
              <p style={{ 
                color: "rgb(var(--secondary))",
                fontSize: "1rem",
                marginBottom: "0.5rem"
              }}>
                {website.url}
              </p>
              <p style={{ 
                color: "rgb(var(--secondary))",
                fontSize: "0.875rem"
              }}>
                Monitoring since {new Date(website.timeAdded).toLocaleDateString()}
              </p>
            </div>
            
            <div className={`status-indicator status-${currentStatus.toLowerCase()}`} style={{
              fontSize: "1rem",
              padding: "0.5rem 1rem"
            }}>
              <div style={{ 
                width: "10px", 
                height: "10px", 
                borderRadius: "50%",
                backgroundColor: currentStatus === "UP" ? "rgb(var(--success))" : 
                              currentStatus === "DOWN" ? "rgb(var(--error))" : 
                              "rgb(var(--warning))"
              }} />
              {currentStatus}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div style={{ 
          display: "grid", 
          gap: "1rem",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          marginBottom: "2rem"
        }}>
          <div className="card">
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
              <TrendingUp size={20} color="rgb(var(--success))" />
              <h3 style={{ fontSize: "1rem", fontWeight: "600" }}>Uptime</h3>
            </div>
            <div style={{ fontSize: "2rem", fontWeight: "bold", color: "rgb(var(--success))" }}>
              {uptimePercentage}%
            </div>
            <p style={{ color: "rgb(var(--secondary))", fontSize: "0.875rem" }}>
              Last 30 days
            </p>
          </div>

          <div className="card">
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
              <Clock size={20} color="rgb(var(--primary))" />
              <h3 style={{ fontSize: "1rem", fontWeight: "600" }}>Avg Response Time</h3>
            </div>
            <div style={{ fontSize: "2rem", fontWeight: "bold", color: "rgb(var(--primary))" }}>
              {avgResponseTime}ms
            </div>
            <p style={{ color: "rgb(var(--secondary))", fontSize: "0.875rem" }}>
              Last 24 hours
            </p>
          </div>

          <div className="card">
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
              <Activity size={20} color="rgb(var(--warning))" />
              <h3 style={{ fontSize: "1rem", fontWeight: "600" }}>Last Check</h3>
            </div>
            <div style={{ fontSize: "1.25rem", fontWeight: "600" }}>
              {lastTick ? new Date(lastTick.timeAdded).toLocaleTimeString() : "Never"}
            </div>
            <p style={{ color: "rgb(var(--secondary))", fontSize: "0.875rem" }}>
              {lastTick ? `${lastTick.responseTime}ms response` : "No data available"}
            </p>
          </div>
        </div>

        {/* Recent Checks */}
        <div className="card">
          <h3 style={{ 
            fontSize: "1.25rem", 
            fontWeight: "600", 
            marginBottom: "1.5rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem"
          }}>
            <Activity size={20} />
            Recent Checks
          </h3>
          
          {website.WebsiteTick.length === 0 ? (
            <div style={{ textAlign: "center", padding: "2rem", color: "rgb(var(--secondary))" }}>
              No monitoring data available yet. Checks will appear here shortly.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {website.WebsiteTick.slice(0, 10).map((tick) => (
                <div 
                  key={tick.id}
                  style={{ 
                    display: "flex", 
                    justifyContent: "space-between", 
                    alignItems: "center",
                    padding: "0.75rem",
                    backgroundColor: "rgb(var(--muted))",
                    borderRadius: "0.5rem"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <div style={{ 
                      width: "8px", 
                      height: "8px", 
                      borderRadius: "50%",
                      backgroundColor: tick.status === "UP" ? "rgb(var(--success))" : 
                                    tick.status === "DOWN" ? "rgb(var(--error))" : 
                                    "rgb(var(--warning))"
                    }} />
                    <span style={{ fontWeight: "500" }}>{tick.status}</span>
                  </div>
                  
                  <div style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    gap: "1rem",
                    fontSize: "0.875rem",
                    color: "rgb(var(--secondary))"
                  }}>
                    <span>
                      {tick.responseTime ? `${tick.responseTime}ms` : "No response"}
                    </span>
                    <span>
                      {new Date(tick.timeAdded).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 