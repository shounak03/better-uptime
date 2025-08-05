"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../lib/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Globe } from "lucide-react";
import Navigation from "../../components/Navigation";

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
  const { user, isLoading } = useAuth();
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-muted dark:bg-muted-dark">
      <Navigation />

      {/* Main Content */}
      <main className="container pt-8 pb-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold mb-2">
              Your Websites
            </h2>
            <p className="text-secondary dark:text-secondary-dark">
              Monitor your website uptime and performance
            </p>
          </div>
          
          <Link href="/add-website" className="btn btn-primary flex items-center gap-2">
            <Plus size={16} />
            Add Website
          </Link>
        </div>

        {/* Website List */}
        {isLoadingWebsites ? (
          <div className="card text-center py-12">
            <div>Loading your websites...</div>
          </div>
        ) : websites.length === 0 ? (
          <div className="card text-center py-12">
            <Globe size={48} className="mx-auto mb-4 text-secondary dark:text-secondary-dark" />
            <h3 className="text-xl font-semibold mb-2">
              No websites yet
            </h3>
            <p className="text-secondary dark:text-secondary-dark mb-8">
              Start monitoring your first website by adding it below.
            </p>
            <Link href="/add-website" className="btn btn-primary">
              Add Your First Website
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {websites.map((website) => {
              const lastTick = website.WebsiteTick?.[0];
              const status = lastTick?.status || "UNKNOWN";
              
              return (
                <Link 
                  key={website.id} 
                  href={`/website/${website.id}`}
                  className="no-underline text-inherit"
                >
                  <div className="card transition-all cursor-pointer hover:shadow-md">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold mb-1">
                          {website.name}
                        </h3>
                        <p className="text-secondary dark:text-secondary-dark text-sm">
                          {website.url}
                        </p>
                      </div>
                      
                      <div className={`status-indicator status-${status.toLowerCase()}`}>
                        <div className={`w-2 h-2 rounded-full ${
                          status === "UP" ? "bg-success" : 
                          status === "DOWN" ? "bg-error" : 
                          "bg-warning"
                        }`} />
                        {status}
                      </div>
                    </div>
                    
                    {lastTick && (
                      <div className="flex justify-between text-sm text-secondary dark:text-secondary-dark">
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