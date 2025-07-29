"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "../../lib/auth";
import { authAPI } from "../../lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setApiError(null);

    try {
      const response = await authAPI.login(data.email, data.password);
      login(response.token);
      router.push("/dashboard");
    } catch (error: any) {
      setApiError(error.response?.data?.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: "100vh", 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center",
      padding: "1rem"
    }}>
      <div className="card" style={{ width: "100%", maxWidth: "400px" }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h1 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "0.5rem" }}>
            Sign In
          </h1>
          <p style={{ color: "rgb(var(--secondary))" }}>
            Welcome back to Better Uptime
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="form-input"
              {...register("email")}
              placeholder="Enter your email"
            />
            {errors.email && (
              <p className="form-error">{errors.email.message}</p>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="form-input"
              {...register("password")}
              placeholder="Enter your password"
            />
            {errors.password && (
              <p className="form-error">{errors.password.message}</p>
            )}
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
            {isLoading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div style={{ textAlign: "center" }}>
          <p style={{ color: "rgb(var(--secondary))" }}>
            Don't have an account?{" "}
            <Link href="/register" style={{ color: "rgb(var(--primary))", fontWeight: "500" }}>
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
} 