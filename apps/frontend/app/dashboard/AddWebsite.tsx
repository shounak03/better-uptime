"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { addWebsiteSchema } from "@/zodSchema";
import { z } from "zod";
import { toast } from "sonner";
import { backendUrl } from "@/config";

type AddWebsiteInput = z.infer<typeof addWebsiteSchema>;

interface AddWebsiteProps {
    onWebsiteAdded?: () => void;
}

export default function AddWebsite({ onWebsiteAdded }: AddWebsiteProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { register, handleSubmit, formState: { errors }, reset } = useForm<AddWebsiteInput>({
        resolver: zodResolver(addWebsiteSchema),
    });

    const onSubmit = async (data: AddWebsiteInput) => {
        setIsSubmitting(true);
        try {
            const response = await fetch(`${backendUrl}/api/v1/addWebsite`, {
                method: "POST",
                body: JSON.stringify(data),
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
            });
            const responseData = await response.json();
            
            if (response.ok) {
                toast.success("Website added successfully");
                reset(); // Clear the form
                setIsOpen(false); // Close the modal
                onWebsiteAdded?.(); // Refresh the website list
            } else {
                toast.error(responseData.message || "Failed to add website");
            }
        } catch (error) {
            toast.error("Failed to add website");
            console.log(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setIsOpen(false);
        reset(); // Clear form when closing
    };

    return (
        <>
            {/* Add Website Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm hover:shadow-md transform hover:scale-[1.02]"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add New Website
            </button>

            {/* Modal Overlay */}
            {isOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <div className="flex items-center gap-3">
                                <div className="inline-flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
                                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">Add New Website</h2>
                                    <p className="text-sm text-gray-500">Start monitoring your website's uptime</p>
                                </div>
                            </div>
                            <button
                                onClick={handleClose}
                                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Modal Body */}
                        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                    Website Name *
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g., My Portfolio"
                                    {...register("name")}
                                    className="w-full text-black px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 outline-none"
                                />
                                {errors.name && (
                                    <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                                )}
                            </div>
                            
                            <div>
                                <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
                                    Website URL *
                                </label>
                                <input
                                    type="url"
                                    placeholder="https://example.com"
                                    {...register("url")}
                                    className="w-full text-black px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 outline-none"
                                />
                                {errors.url && (
                                    <p className="mt-1 text-sm text-red-600">{errors.url.message}</p>
                                )}
                                <p className="mt-1 text-xs text-gray-500">
                                    Make sure to include the protocol (https://)
                                </p>
                            </div>

                            {/* What happens next info */}
                            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                <h3 className="text-sm font-medium text-blue-900 mb-2">What happens next?</h3>
                                <ul className="text-sm text-blue-700 space-y-1">
                                    <li>• We'll start monitoring your website every 5 minutes</li>
                                    <li>• You'll get alerts if your site goes down</li>
                                    <li>• View uptime statistics and response times</li>
                                </ul>
                            </div>

                            {/* Modal Footer */}
                            <div className="flex items-center gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    className="flex-1 px-4 py-3 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Adding...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                            </svg>
                                            Add Website
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
