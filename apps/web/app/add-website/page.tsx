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
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center",
            minHeight: "60vh"
          }}>
            <div className="card" style={{ width: "100%", maxWidth: "400px", textAlign: "center" }}>
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>✅</div>
              <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "0.5rem" }}>
                Website Added Successfully!
              </h2>
              <p style={{ color: "rgb(var(--secondary))", marginBottom: "1rem" }}>
                We'll start monitoring your website shortly. Redirecting to dashboard...
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

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
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center",
          minHeight: "60vh"
        }}>
          <div className="card" style={{ width: "100%", maxWidth: "500px" }}>
            <div style={{ textAlign: "center", marginBottom: "2rem" }}>
              <div style={{ 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center", 
                marginBottom: "1rem" 
              }}>
                <div style={{ 
                  backgroundColor: "rgb(var(--primary) / 0.1)", 
                  padding: "1rem", 
                  borderRadius: "50%" 
                }}>
                  <Plus size={24} color="rgb(var(--primary))" />
                </div>
              </div>
              <h1 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "0.5rem" }}>
                Add New Website
              </h1>
              <p style={{ color: "rgb(var(--secondary))" }}>
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
                <div style={{ 
                  fontSize: "0.875rem", 
                  color: "rgb(var(--secondary))", 
                  marginTop: "0.25rem" 
                }}>
                  Make sure to include the protocol (http:// or https://)
                </div>
              </div>

              {apiError && (
                <div className="form-error" style={{ marginBottom: "1rem" }}>
                  {apiError}
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary"
                disabled={isLoading}
                style={{ width: "100%", marginBottom: "1rem" }}
              >
                {isLoading ? "Adding Website..." : "Add Website"}
              </button>
            </form>

            <div style={{ 
              backgroundColor: "rgb(var(--muted))", 
              padding: "1rem", 
              borderRadius: "0.5rem",
              fontSize: "0.875rem"
            }}>
              <div style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: "0.5rem", 
                marginBottom: "0.5rem" 
              }}>
                <Globe size={16} color="rgb(var(--primary))" />
                <strong>What happens next?</strong>
              </div>
              <ul style={{ 
                paddingLeft: "1.5rem", 
                color: "rgb(var(--secondary))",
                lineHeight: "1.5"
              }}>
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