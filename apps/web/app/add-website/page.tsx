"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "../../lib/auth";
import { websiteAPI } from "../../lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Globe, Plus } from "lucide-react";

const addWebsiteSchema = z.object({
  name: z.string().min(1, "Website name is required"),
  url: z.string().url("Please enter a valid URL"),
});

type AddWebsiteFormData = z.infer<typeof addWebsiteSchema>;

export default function AddWebsitePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AddWebsiteFormData>({
    resolver: zodResolver(addWebsiteSchema),
  });

  const onSubmit = async (data: AddWebsiteFormData) => {
    setIsLoading(true);
    setApiError(null);

    try {
      await websiteAPI.addWebsite(data.name, data.url);
      setSuccess(true);
      reset();
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } catch (error: any) {
      setApiError(error.response?.data?.message || "Failed to add website");
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    router.push("/login");
    return null;
  }

  if (success) {
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
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="card w-full max-w-md text-center">
              <div className="text-5xl mb-4">✅</div>
              <h2 className="text-2xl font-bold mb-2">
                Website Added Successfully!
              </h2>
              <p className="text-secondary dark:text-secondary-dark mb-4">
                We'll start monitoring your website shortly. Redirecting to dashboard...
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

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
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="card w-full max-w-lg">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center mb-4">
                <div className="bg-primary/10 p-4 rounded-full">
                  <Plus size={24} className="text-primary" />
                </div>
              </div>
              <h1 className="text-3xl font-bold mb-2">
                Add New Website
              </h1>
              <p className="text-secondary dark:text-secondary-dark">
                Start monitoring a new website for uptime and performance
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="form-group">
                <label htmlFor="name" className="form-label">
                  Website Name
                </label>
                <input
                  id="name"
                  type="text"
                  className="form-input"
                  {...register("name")}
                  placeholder="e.g., My Blog, Company Website"
                />
                {errors.name && (
                  <p className="form-error">{errors.name.message}</p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="url" className="form-label">
                  Website URL
                </label>
                <input
                  id="url"
                  type="url"
                  className="form-input"
                  {...register("url")}
                  placeholder="https://example.com"
                />
                {errors.url && (
                  <p className="form-error">{errors.url.message}</p>
                )}
                <div className="text-sm text-secondary dark:text-secondary-dark mt-1">
                  Make sure to include the protocol (http:// or https://)
                </div>
              </div>

              {apiError && (
                <div className="form-error mb-4">
                  {apiError}
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary w-full mb-4"
                disabled={isLoading}
              >
                {isLoading ? "Adding Website..." : "Add Website"}
              </button>
            </form>

            <div className="bg-muted dark:bg-muted-dark p-4 rounded-lg text-sm">
              <div className="flex items-center gap-2 mb-2">
                <Globe size={16} className="text-primary" />
                <strong>What happens next?</strong>
              </div>
              <ul className="pl-6 text-secondary dark:text-secondary-dark leading-relaxed list-disc">
                <li>We'll start checking your website every minute</li>
                <li>You'll get notifications if we detect any downtime</li>
                <li>View detailed uptime statistics and response times</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 