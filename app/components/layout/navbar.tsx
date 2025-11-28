'use client';

import { BarChart3, Link } from "lucide-react";
import ThemeToggle from "@/app/components/ui/theme-toggle";
import { stackClientApp } from "@/stack/client";

export const NAVBAR_HEIGHT = 72; // 4.5rem in pixels - matches CSS variable

export default function Navbar({ currentPath = "/dashboard" }: { currentPath?: string }) {
    return (
        <nav 
            className="fixed top-0 left-0 w-full z-50 bg-gradient-to-br from-gray-200 to-gray-400 dark:from-gray-900 dark:to-gray-800 shadow-md flex items-center px-6 py-2"
            style={{ height: 'var(--navbar-height)' }}
        >

            {/* Absolutely centered title */}
            <div className="absolute left-1/2 -translate-x-1/2 text-2xl font-semibold text-gray-900 dark:text-gray-100">
                Project Manager
            </div>

            {/* Right side */}
            <div className="ml-auto flex items-center gap-2 pr-4">
                <button
                    onClick={() => {
                        stackClientApp.signOut();
                    }}
                    className="border border-gray-600 dark:border-gray-300 rounded px-4 py-1 shadow-md text-gray-800 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
                >
                    Logout
                </button>
            </div>
        </nav>
    );
}