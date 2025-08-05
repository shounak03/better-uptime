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
      <div className="min-h-screen bg-muted dark:bg-muted-dark">
        <header className="bg-white dark:bg-gray-800 border-b border-border dark:border-border-dark py-4">
          <div className="container">
            <Link 
              href="/dashboard" 
              className="btn btn-outline flex items-center gap-2 w-fit"
            >
              <ArrowLeft size={16} />
              Back to Dashboard
            </Link>
          </div>
        </header>
        
        <main className="container pt-8">
          <div className="card text-center py-12">
            <div>Loading website status...</div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !website) {
    return (
      <div className="min-h-screen bg-muted dark:bg-muted-dark">
        <header className="bg-white dark:bg-gray-800 border-b border-border dark:border-border-dark py-4">
          <div className="container">
            <Link 
              href="/dashboard" 
              className="btn btn-outline flex items-center gap-2 w-fit"
            >
              <ArrowLeft size={16} />
              Back to Dashboard
            </Link>
          </div>
        </header>
        
        <main className="container pt-8">
          <div className="card text-center py-12">
            <AlertCircle size={48} className="mx-auto mb-4 text-error" />
            <h2 className="text-2xl font-bold mb-2">
              Website Not Found
            </h2>
            <p className="text-secondary dark:text-secondary-dark mb-8">
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
    <div className="min-h-screen bg-muted dark:bg-muted-dark">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-border dark:border-border-dark py-4">
        <div className="container">
          <Link 
            href="/dashboard" 
            className="btn btn-outline flex items-center gap-2 w-fit"
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container pt-8 pb-8">
        {/* Website Header */}
        <div className="card mb-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                {website.name}
              </h1>
              <p className="text-secondary dark:text-secondary-dark text-base mb-2">
                {website.url}
              </p>
              <p className="text-secondary dark:text-secondary-dark text-sm">
                Monitoring since {new Date(website.timeAdded).toLocaleDateString()}
              </p>
            </div>
            
            <div className={`status-indicator status-${currentStatus.toLowerCase()} text-base px-4 py-2`}>
              <div className={`w-2.5 h-2.5 rounded-full ${
                currentStatus === "UP" ? "bg-success" : 
                currentStatus === "DOWN" ? "bg-error" : 
                "bg-warning"
              }`} />
              {currentStatus}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 grid-cols-1 md:grid-cols-3 mb-8">
          <div className="card">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp size={20} className="text-success" />
              <h3 className="text-base font-semibold">Uptime</h3>
            </div>
            <div className="text-3xl font-bold text-success">
              {uptimePercentage}%
            </div>
            <p className="text-secondary dark:text-secondary-dark text-sm">
              Last 30 days
            </p>
          </div>

          <div className="card">
            <div className="flex items-center gap-3 mb-2">
              <Clock size={20} className="text-primary" />
              <h3 className="text-base font-semibold">Avg Response Time</h3>
            </div>
            <div className="text-3xl font-bold text-primary">
              {avgResponseTime}ms
            </div>
            <p className="text-secondary dark:text-secondary-dark text-sm">
              Last 24 hours
            </p>
          </div>

          <div className="card">
            <div className="flex items-center gap-3 mb-2">
              <Activity size={20} className="text-warning" />
              <h3 className="text-base font-semibold">Last Check</h3>
            </div>
            <div className="text-xl font-semibold">
              {lastTick ? new Date(lastTick.timeAdded).toLocaleTimeString() : "Never"}
            </div>
            <p className="text-secondary dark:text-secondary-dark text-sm">
              {lastTick ? `${lastTick.responseTime}ms response` : "No data available"}
            </p>
          </div>
        </div>

        {/* Recent Checks */}
        <div className="card">
          <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Activity size={20} />
            Recent Checks
          </h3>
          
          {website.WebsiteTick.length === 0 ? (
            <div className="text-center py-8 text-secondary dark:text-secondary-dark">
              No monitoring data available yet. Checks will appear here shortly.
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {website.WebsiteTick.slice(0, 10).map((tick) => (
                <div 
                  key={tick.id}
                  className="flex justify-between items-center p-3 bg-muted dark:bg-muted-dark rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      tick.status === "UP" ? "bg-success" : 
                      tick.status === "DOWN" ? "bg-error" : 
                      "bg-warning"
                    }`} />
                    <span className="font-medium">{tick.status}</span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-secondary dark:text-secondary-dark">
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