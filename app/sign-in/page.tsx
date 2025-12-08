"use client";

import { SignIn } from "@stackframe/stack";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useUser } from "@stackframe/stack";

export default function SignInPage() {
    const router = useRouter();
    const user = useUser({ or: "return-null" });

    // If user is signed in, redirect to dashboard
    useEffect(() => {
        if (user) {
            router.replace("/dashboard");
        }
    }, [user, router]);

    // If user exists, show loading while redirecting
    if (user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800">
                <div className="text-gray-600 dark:text-gray-400">Redirecting to dashboard...</div>
            </div>
        );
    }

    // Add classes to OAuth buttons after component mounts
    useEffect(() => {
        const addButtonClasses = () => {
            const buttons = document.querySelectorAll('.stack-signin-wrapper button');
            buttons.forEach((button) => {
                const buttonText = button.textContent?.toLowerCase() || '';
                if (buttonText.includes('google')) {
                    button.classList.add('stack-oauth-google');
                } else if (buttonText.includes('github')) {
                    button.classList.add('stack-oauth-github');
                }
            });
        };

        // Run after a short delay to ensure Stack Auth has rendered
        const timer = setTimeout(addButtonClasses, 100);
        // Also run on any DOM changes
        const observer = new MutationObserver(addButtonClasses);
        observer.observe(document.body, { childList: true, subtree: true });

        return () => {
            clearTimeout(timer);
            observer.disconnect();
        };
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800">
            <div className="max-w-md w-full space-y-8 stack-signin-wrapper">
                <SignIn />
            </div>
        </div>
    );
}
