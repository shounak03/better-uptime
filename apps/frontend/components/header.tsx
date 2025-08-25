

import { Monitor } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";
import Logout from "./logout";
import { cookies } from "next/headers";

export default async function Header() {

    const cookieStore = await cookies();
    const token = cookieStore.get("token");

    
    return (
        <header className="border-b border-blue-100 bg-sky-100 backdrop-blur-sm sticky top-0 z-50">
            <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
                <Link href="/">
                <div className="flex items-center space-x-2 cursor-pointer">
                    <div className="w-8 h-8 bg-blue-800 rounded-lg flex items-center justify-center">
                        <Monitor className="w-5 h-5 text-white" />
                    </div>
                    <h1 className="text-xl font-bold text-gray-900">LogWatch AI</h1>
                </div>
                </Link>
                <nav className="hidden md:flex items-center space-x-6">
                    <a href="#features" className="text-gray-600 hover:text-sky-600 transition-colors">Features</a>
                    <a href="#pricing" className="text-gray-600 hover:text-sky-600 transition-colors">Pricing</a>
                    <a href="#contact" className="text-gray-600 hover:text-sky-600 transition-colors">Contact</a>
                </nav>
                {token ? (
                    <div className="flex items-center space-x-2">
                        <Link href="/dashboard">
                            <Button className="bg-blue-800 hover:bg-blue-900 text-white">
                                Dashboard
                            </Button>
                        </Link>
                        <Logout />
                    </div>
                ) : (
                    <Link href="/auth/login">
                        <Button className="bg-blue-800 hover:bg-blue-900 text-white">
                            login/signup
                        </Button>
                    </Link>
                )}
            </div>
        </header>
    );
}