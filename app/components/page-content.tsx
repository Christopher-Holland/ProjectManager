"use client";

import { ReactNode } from "react";

interface PageContentProps {
    children: ReactNode;
    className?: string;
}

/**
 * Wrapper component that automatically adds padding-top to account for fixed navbar.
 * Use this to wrap page content so it doesn't get hidden behind the navbar.
 */
export default function PageContent({ children, className = "" }: PageContentProps) {
    return (
        <div 
            className={className}
            style={{ paddingTop: `calc(var(--navbar-height) + 1.5rem)` }}
        >
            {children}
        </div>
    );
}

