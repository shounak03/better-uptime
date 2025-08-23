"use client";
import { backendUrl } from "@/config";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { addWebsiteSchema } from "@/zodSchema";
import { z } from "zod";

type AddWebsiteInput = z.infer<typeof addWebsiteSchema>;

export default function AddWebsites() {
    const { register, handleSubmit, formState: { errors } } = useForm<AddWebsiteInput>({
        resolver: zodResolver(addWebsiteSchema),
    });

    const onSubmit = async (data: AddWebsiteInput) => {
        const response = await fetch(`${backendUrl}/api/v1/addWebsite`, {
            method: "POST",
            body: JSON.stringify(data),
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include", 
        });
        const responseData = await response.json();
        console.log(responseData);
        
        if (response.ok) {
            // Reset form on success
            window.location.reload();
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex justify-between items-center">
                        <h1 className="text-2xl font-bold text-gray-900">Website Monitor</h1>
                        <button className="text-gray-600 hover:text-gray-900 font-medium">
                            Logout
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                            <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Add New Website</h2>
                        <p className="text-gray-600">Start monitoring your website's uptime and performance</p>
                    </div>
                    
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                Website Name
                            </label>
                            <input
                                type="text"
                                placeholder="e.g., My Portfolio"
                                {...register("name")}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200 outline-none"
                            />
                            {errors.name && (
                                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                            )}
                        </div>
                        
                        <div>
                            <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
                                Website URL
                            </label>
                            <input
                                type="url"
                                placeholder="https://example.com"
                                {...register("url")}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200 outline-none"
                            />
                            {errors.url && (
                                <p className="mt-1 text-sm text-red-600">{errors.url.message}</p>
                            )}
                            <p className="mt-1 text-xs text-gray-500">
                                Make sure to include the protocol (http:// or https://)
                            </p>
                        </div>
                        
                        <button
                            type="submit"
                            className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition duration-200 transform hover:scale-[1.02] flex items-center justify-center"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Add Website to Monitor
                        </button>
                    </form>
                    
                    <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                        <h3 className="text-sm font-medium text-gray-900 mb-2">What happens next?</h3>
                        <ul className="text-sm text-gray-600 space-y-1">
                            <li>• We'll start monitoring your website every 5 minutes</li>
                            <li>• You'll get alerts if your site goes down</li>
                            <li>• View uptime statistics and response times</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}