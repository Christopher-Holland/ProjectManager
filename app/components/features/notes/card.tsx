"use client";

import React from "react";

interface NoteCardProps {
    id: string;
    title: string;
    content?: string | null;
    tags?: string | null;
    pinned: boolean;
    createdAt: Date | string;
    updatedAt: Date | string;
    onDelete?: (id: string) => void;
    onUpdate?: (id: string, data: {
        title: string;
        content?: string;
        tags?: string;
        pinned?: boolean;
    }) => void;
}

export default function NoteCard({
    id,
    title,
    content,
    tags,
    pinned,
    createdAt,
    updatedAt,
    onDelete,
    onUpdate,
}: NoteCardProps) {
    return (
        <div className="p-5 rounded-lg border border-gray-400 dark:border-gray-700 shadow-md bg-gray-200 dark:bg-gray-900 space-y-3">
            {/* Add your card content here */}
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                {title}
            </h3>
        </div>
    );
}

