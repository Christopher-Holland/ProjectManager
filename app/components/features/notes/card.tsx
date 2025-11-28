"use client";

import React, { useState } from "react";
import { ChevronUp, ChevronDown, Trash2, Pencil, Pin } from "lucide-react";
import ConfirmModal from "@/app/components/modals/confirm-modal";
import EditNoteModal from "@/app/components/modals/edit-note-modal";

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

    const [isExpanded, setIsExpanded] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const handleDelete = () => {
        if (onDelete) {
            setIsDeleteModalOpen(true);
        }
    };

    const handleEdit = () => {
        setIsEditModalOpen(true);
    };

    const handleSave = async (data: {
        title: string;
        content?: string;
        tags?: string;
        pinned?: boolean;
    }) => {
        if (onUpdate) {
            await onUpdate(id, data);
        }
        setIsEditModalOpen(false);
    };

    // Format date for display
    const formatDate = (date: Date | string) => {
        try {
            const d = new Date(date);
            return d.toLocaleDateString("en-US", { 
                year: "numeric", 
                month: "short", 
                day: "numeric" 
            });
        } catch {
            return String(date);
        }
    };

    return (
        <div className="p-5 rounded-lg border border-gray-400 dark:border-gray-700 shadow-md bg-gray-200 dark:bg-gray-900 space-y-3">
            {/* Header row with pin indicator and toggle */}
            <div className="flex items-center justify-between gap-2">
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="flex items-center gap-2 flex-1 text-left text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                >
                    {pinned && (
                        <Pin size={16} className="text-yellow-500 dark:text-yellow-400 fill-current" />
                    )}
                    <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                        {title}
                    </h3>
                </button>

                <div className="flex items-center gap-2">
                    {isExpanded ? (
                        <ChevronUp size={18} className="text-gray-500 dark:text-gray-400" />
                    ) : (
                        <ChevronDown size={18} className="text-gray-500 dark:text-gray-400" />
                    )}
                </div>
            </div>

            {/* Dropdown Content */}
            {isExpanded && (
                <div className="space-y-3 pt-2 border-t border-gray-300 dark:border-gray-700">
                    {content && (
                        <div className="text-sm text-gray-800 dark:text-gray-300 whitespace-pre-wrap">
                            {content}
                        </div>
                    )}

                    {tags && (
                        <div className="flex flex-wrap gap-1.5">
                            {tags.split(",").map((tag, index) => (
                                <span
                                    key={index}
                                    className="text-xs px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                                >
                                    {tag.trim()}
                                </span>
                            ))}
                        </div>
                    )}

                    <div className="flex items-center justify-between pt-2">
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                            Updated: {formatDate(updatedAt)}
                        </p>
                        

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2">
                            {onUpdate && (
                                <button
                                    onClick={handleEdit}
                                    className="p-1.5 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 
                                               hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                                    aria-label="Edit note"
                                >
                                    <Pencil size={16} />
                                </button>
                            )}
                            {onDelete && (
                                <button
                                    onClick={handleDelete}
                                    className="p-1.5 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 
                                               hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                                    aria-label="Delete note"
                                >
                                    <Trash2 size={16} />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {onUpdate && (
                <EditNoteModal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    onSave={handleSave}
                    initialTitle={title}
                    initialContent={content}
                    initialTags={tags}
                    initialPinned={pinned}
                />
            )}

            {/* Confirm Delete Modal */}
            {onDelete && (
                <ConfirmModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                    onConfirm={() => {
                        onDelete(id);
                        setIsDeleteModalOpen(false);
                    }}
                    title="Delete Note"
                    message="Are you sure you want to delete this note? This action cannot be undone."
                    confirmText="Delete Note"
                    variant="danger"
                />
            )}
        </div>
    );
}