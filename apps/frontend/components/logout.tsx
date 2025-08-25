"use client";
import { backendUrl } from "@/config";
import { Button } from "./ui/button";
import { toast } from "sonner";

export default function Logout() {

    const handleLogout = async () => {
        try {
            console.log("Starting logout process...");
            const response = await fetch(`${backendUrl}/api/v1/logout`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
            });
            
            console.log("Logout response:", response.status, response.statusText);
            
            if (response.ok) {
                console.log("Logout successful, redirecting...");
                toast.success("Logged out successfully");
                // Redirect to landing page after logout
                window.location.href = "/";
            } else {
                console.error("Logout failed with status:", response.status);
                const errorData = await response.json().catch(() => ({}));
                console.error("Error details:", errorData);
                toast.error("Logout failed");
            }
        } catch (error) {
            console.error("Logout network error:", error);
        }
    };
    return (
        <div>
            <Button
                            onClick={handleLogout}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            Logout
                        </Button>
        </div>
    );
}