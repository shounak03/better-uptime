"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { authAPI } from "../../lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";

const registerSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setApiError(null);

    try {
      await authAPI.register(data.name, data.email, data.password);
      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (error: any) {
      setApiError(error.response?.data?.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{ 
        minHeight: "100vh", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center",
        padding: "1rem"
      }}>
        <div className="card" style={{ width: "100%", maxWidth: "400px", textAlign: "center" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>✅</div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "0.5rem" }}>
            Account Created Successfully!
          </h2>
          <p style={{ color: "rgb(var(--secondary))", marginBottom: "1rem" }}>
            Redirecting you to login...
          </p>
        </div>
      </div>
    );
  }

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
            Sign Up
          </h1>
          <p style={{ color: "rgb(var(--secondary))" }}>
            Create your Better Uptime account
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label htmlFor="name" className="form-label">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              className="form-input"
              {...register("name")}
              placeholder="Enter your full name"
            />
            {errors.name && (
              <p className="form-error">{errors.name.message}</p>
            )}
          </div>

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

          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              className="form-input"
              {...register("confirmPassword")}
              placeholder="Confirm your password"
            />
            {errors.confirmPassword && (
              <p className="form-error">{errors.confirmPassword.message}</p>
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
            {isLoading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <div style={{ textAlign: "center" }}>
          <p style={{ color: "rgb(var(--secondary))" }}>
            Already have an account?{" "}
            <Link href="/login" style={{ color: "rgb(var(--primary))", fontWeight: "500" }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
} 