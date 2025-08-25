"use client"
import { backendUrl } from "@/config";
import { useEffect, useState } from "react";
import Link from "next/link";
import AddWebsite from "./AddWebsite";

interface WebsiteTick {
    status: string;
    responseTime: number | null;
    timeAdded: string;
}

interface Website {
    id: string;
    name: string;
    url: string;
    timeAdded: string;
    WebsiteTick: WebsiteTick[];
}

function StatusIndicator({ status, responseTime }: { status: string, responseTime: number | null }) {
    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'up': return 'text-green-600 bg-green-50';
            case 'down': return 'text-red-600 bg-red-50';
            default: return 'text-yellow-600 bg-yellow-50';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status.toLowerCase()) {
            case 'up': return '✓';
            case 'down': return '✗';
            default: return '?';
        }
    };

    return (
        <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
            <span className="text-sm">{getStatusIcon(status)}</span>
            <span>{status.toUpperCase()}</span>
            {responseTime && (
                <span className="text-gray-500">
                    • {responseTime}ms
                </span>
            )}
        </div>
    );
}

function StatusDot({ status }: { status: string }) {
    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'up': return 'bg-green-500';
            case 'down': return 'bg-red-500';
            default: return 'bg-yellow-500';
        }
    };

    return (
        <div 
            className={`w-2 h-2 rounded-full ${getStatusColor(status)}`}
            title={`Status: ${status.toUpperCase()}`}
        />
    );
}

function WebsiteCard({ website }: { website: Website }) {
    const latestStatus = website.WebsiteTick[0];
    const isOnline = latestStatus?.status?.toLowerCase() === 'up';
    const last5Ticks = website.WebsiteTick.slice(0, 5);

    return (
        <Link href={`/dashboard/${website.id}`}>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 cursor-pointer group">
                <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                            <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
                            <h3 className="font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                                {website.name}
                            </h3>
                        </div>
                        <p className="text-sm text-gray-500 truncate mb-3">
                            {website.url}
                        </p>
                        
                        {latestStatus && (
                            <div className="flex items-center gap-2 mb-3">
                                <StatusIndicator 
                                    status={latestStatus.status} 
                                    responseTime={latestStatus.responseTime} 
                                />
                                <span className="text-xs text-gray-400">
                                    {new Date(latestStatus.timeAdded).toLocaleString()}
                                </span>
                            </div>
                        )}

                        {/* Last 5 Status Indicators */}
                        {last5Ticks.length > 0 && (
                            <div className="mb-3">
                                <div className="text-xs text-gray-500 mb-2">Last 5 checks:</div>
                                <div className="flex items-center gap-1">
                                    {last5Ticks.map((tick, index) => (
                                        <StatusDot key={index} status={tick.status} />
                                    ))}
                                    {last5Ticks.length < 5 && (
                                        <span className="text-xs text-gray-400 ml-2">
                                            ({last5Ticks.length} checks available)
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}
                        
                        <div className="text-xs text-gray-500">
                            Added {new Date(website.timeAdded).toLocaleDateString()}
                        </div>
                    </div>
                    
                    <div className="ml-4">
                        <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </div>
                </div>
            </div>
        </Link>
    );
}

export default function WebsiteStatus() {
    const [websites, setWebsites] = useState<Website[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchWebsites = () => {
        setLoading(true);
        fetch(`${backendUrl}/api/v1/fetchWebsiteStatus`, {
            credentials: "include",
        })
            .then(res => {
                if (!res.ok) {
                    throw new Error('Failed to fetch websites');
                }
                return res.json();
            })
            .then(data => {
                setWebsites(data);
                setLoading(false);
            })
            .catch(err => {
                console.log(err);
                setError(err.message);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchWebsites();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
                <div className="container mx-auto px-4 py-8">
                    <div className="animate-pulse space-y-6">
                        <div className="h-8 bg-gray-300 rounded w-1/4"></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className="bg-gray-200 h-32 rounded-xl"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-red-500 text-xl mb-2">⚠️</div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Websites</h2>
                    <p className="text-gray-600">{error}</p>
                </div>
            </div>
        );
    }

    const handleLogout = async () => {
        try {
            console.log("Dashboard logout - Starting logout process...");
            const response = await fetch(`${backendUrl}/api/v1/logout`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
            });
            
            console.log("Dashboard logout response:", response.status, response.statusText);
            
            if (response.ok) {
                console.log("Dashboard logout successful, redirecting...");
                // Redirect to landing page after logout
                window.location.href = "/";
            } else {
                console.error("Dashboard logout failed with status:", response.status);
                const errorData = await response.json().catch(() => ({}));
                console.error("Dashboard logout error details:", errorData);
            }
        } catch (error) {
            console.error("Dashboard logout network error:", error);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            {/* Navigation Header */}
            {/* <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h1 className="text-xl font-bold text-gray-900">LogWatch AI</h1>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 hover:text-gray-900 transition-colors duration-200"
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Logout
                        </button>
                    </div>
                </div>
            </header> */}

            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Website Status Dashboard</h1>
                    <p className="text-gray-600">Monitor the uptime and performance of your websites</p>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                        <div className="text-2xl font-bold text-gray-900">{websites.length}</div>
                        <div className="text-sm text-gray-500">Total Websites</div>
                    </div>
                    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                        <div className="text-2xl font-bold text-green-600">
                            {websites.filter(w => w.WebsiteTick[0]?.status?.toLowerCase() === 'up').length}
                        </div>
                        <div className="text-sm text-gray-500">Online</div>
                    </div>
                    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                        <div className="text-2xl font-bold text-red-600">
                            {websites.filter(w => w.WebsiteTick[0]?.status?.toLowerCase() === 'down').length}
                        </div>
                        <div className="text-sm text-gray-500">Offline</div>
                    </div>
                </div>

                {/* Add Website Component */}
                <div className="mb-8">
                    <AddWebsite onWebsiteAdded={fetchWebsites} />
                </div>

                {/* Websites Grid */}
                {websites.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-gray-400 text-6xl mb-4">🌐</div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No websites added yet</h3>
                        <p className="text-gray-600 mb-6">Start monitoring your websites by adding them to your dashboard</p>
                        <AddWebsite onWebsiteAdded={fetchWebsites} />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {websites.map((website) => (
                            <WebsiteCard key={website.id} website={website} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}