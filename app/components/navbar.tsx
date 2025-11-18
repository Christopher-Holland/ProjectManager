'use client';

import { BarChart3, Link } from "lucide-react";
import ThemeToggle from "./theme-toggle";

export default function Navbar({ currentPath = "/dashboard",
}: {
    currentPath: string;
}) {
    const navigation = [
        { name: "Dashboard", href: "/dashboard", icon: BarChart3 },
        
    ];
    return (
        <nav className="fixed top-0 left-0 w-full z-50 bg-gradient-to-br from-gray-200 to-gray-400 dark:from-gray-900 dark:to-gray-800 shadow-md flex justify-between items-center px-6 py-2 h-18">
            <div className="flex gap-4 items-center justify-start text-xl font-semibold text-gray-900 dark:text-gray-100">
                Navbar
            </div>
            <div className="flex items-center gap-2 pr-4">
                <ThemeToggle />
            </div>
        </nav>
    )
}