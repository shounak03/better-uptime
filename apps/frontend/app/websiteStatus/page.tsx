"use client"
import { backendUrl } from "@/config";
import { useEffect, useState } from "react";
import Link from "next/link";

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
        <Link href={`/websiteStatus/${website.id}`}>
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

    useEffect(() => {
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

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
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

                {/* Add Website Button */}
                <div className="mb-8">
                    <Link href="/addWebsites" className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add New Website
                    </Link>
                </div>

                {/* Websites Grid */}
                {websites.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-gray-400 text-6xl mb-4">🌐</div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No websites added yet</h3>
                        <p className="text-gray-600 mb-6">Start monitoring your websites by adding them to your dashboard</p>
                        <Link href="/addWebsites" className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Add Your First Website
                        </Link>
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