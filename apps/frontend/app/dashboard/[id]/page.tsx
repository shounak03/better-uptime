"use client"
import { backendUrl } from "@/config";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { StatusBadge } from "@/components/statusBadge";
import { AIAnalysisCard } from "@/components/AIanalysis";
import { StatusChart } from "@/components/statusChart";

interface WebsiteTick {
    status: string;
    responseTime: number | null;
    timeAdded: string;
    httpStatusCode?: number;
    errorType?: string;
    errorMessage?: string;
    aiAnalysis?: AIAnalysis;
}

interface AIAnalysis {
    id: string;
    failureType: string;
    severity: string;
    summary: string;
    recommendations: string;
    confidence: number;
    analyzedAt: string;
    model: string;
}

interface Website {
    id: string;
    name: string;
    url: string;
    timeAdded: string;
    WebsiteTick: WebsiteTick[];
}



export default function WebsiteStatusPage() {
    const { id } = useParams();
    const [website, setWebsite] = useState<Website | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetch(`${backendUrl}/api/v1/status/${id}`, {
            credentials: "include",
        })
            .then(res => {
                if (!res.ok) {
                    throw new Error('Failed to fetch website details');
                }
                return res.json();
            })
            .then(data => {
                setWebsite(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setError(err.message);
                setLoading(false);
            });
            console.log(website);
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
                <div className="container mx-auto px-4 py-8">
                    <div className="animate-pulse space-y-6">
                        <div className="h-8 bg-gray-300 rounded w-1/4"></div>
                        <div className="bg-gray-200 h-64 rounded-xl"></div>
                        <div className="bg-gray-200 h-96 rounded-xl"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !website) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-red-500 text-xl mb-2">⚠️</div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Website Not Found</h2>
                    <p className="text-gray-600 mb-4">{error || 'The requested website could not be found.'}</p>
                    <Link href="/websiteStatus" className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                        ← Back to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    const latestTick = website.WebsiteTick[0];
    const isOnline = latestTick?.status?.toLowerCase() === 'up';
    const avgResponseTime = website.WebsiteTick
        .filter(tick => tick.responseTime)
        .reduce((acc, tick, _, arr) => acc + (tick.responseTime! / arr.length), 0);

    
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
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013 3v1" />
                            </svg>
                            Logout
                        </button>
                    </div>
                </div>
            </header> */}

            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <Link 
                        href="/dashboard" 
                        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4 transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to Dashboard
                    </Link>
                    
                    <div className="flex items-center gap-4 mb-4">
                        <div className={`w-4 h-4 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
                        <h1 className="text-3xl font-bold text-gray-900">{website.name}</h1>
                    </div>
                    
                    <div className="flex items-center gap-4 text-gray-600">
                        <a 
                            href={website.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="hover:text-blue-600 transition-colors"
                        >
                            {website.url} ↗
                        </a>
                        <span>•</span>
                        <span>Added {new Date(website.timeAdded).toLocaleDateString()}</span>
                    </div>
                </div>

                {/* Status Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <div className="text-sm font-medium text-gray-500 mb-2">Current Status</div>
                        {latestTick ? (
                            <StatusBadge status={latestTick.status} />
                        ) : (
                            <div className="text-gray-400">No data</div>
                        )}
                    </div>
                    
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <div className="text-sm font-medium text-gray-500 mb-2">Latest Response Time</div>
                        <div className="text-2xl font-bold text-gray-900">
                            {latestTick?.responseTime ? `${latestTick.responseTime}ms` : 'N/A'}
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <div className="text-sm font-medium text-gray-500 mb-2">Average Response Time</div>
                        <div className="text-2xl font-bold text-gray-900">
                            {avgResponseTime ? `${Math.round(avgResponseTime)}ms` : 'N/A'}
                        </div>
                    </div>
                </div>

                {/* Last Check Info */}
                {latestTick && (
                    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Latest Check</h3>
                        <div className="text-gray-600">
                            Last checked on {new Date(latestTick.timeAdded).toLocaleString()}
                        </div>
                    </div>
                )}

                {/* AI Analysis Section */}
                {website.WebsiteTick.length > 0 && website.WebsiteTick[0].aiAnalysis && (
                    <div className="mb-8">
                        <AIAnalysisCard analysis={website.WebsiteTick[0].aiAnalysis} />
                    </div>
                )}

                {/* Status Chart */}
                <StatusChart ticks={website.WebsiteTick} />
            </div>
        </div>
    );
}