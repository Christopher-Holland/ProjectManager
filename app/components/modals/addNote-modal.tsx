"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface AddNoteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: {
        title: string;
        content?: string;
        tags?: string;
        pinned?: boolean;
    }) => void | Promise<void>;
    initialTitle?: string;
    initialContent?: string | null;
    initialTags?: string | null;
    initialPinned?: boolean;
}

export default function AddNoteModal({
    isOpen,
    onClose,
    onSave,
    initialTitle = "",
    initialContent = "",
    initialTags = "",
    initialPinned = false,
}: AddNoteModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <motion.div
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                    >
                        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                                    Add Note
                                </h2>
                                <button
                                    onClick={onClose}
                                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                                    aria-label="Close modal"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <form
                                onSubmit={async (e) => {
                                    e.preventDefault();
                                    const formData = new FormData(e.currentTarget);
                                    await onSave({
                                        title: formData.get("title") as string,
                                        content: formData.get("content") as string || undefined,
                                        tags: formData.get("tags") as string || undefined,
                                        pinned: formData.get("pinned") === "on",
                                    });
                                }}
                                className="space-y-4"
                            >
                                {/* Title */}
                                <div>
                                    <label
                                        htmlFor="title"
                                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                                    >
                                        Title *
                                    </label>
                                    <input
                                        type="text"
                                        id="title"
                                        name="title"
                                        defaultValue={initialTitle}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg 
                                                   bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                                                   focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                {/* Content */}
                                <div>
                                    <label
                                        htmlFor="content"
                                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                                    >
                                        Content
                                    </label>
                                    <textarea
                                        id="content"
                                        name="content"
                                        defaultValue={initialContent || ""}
                                        rows={6}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg 
                                                   bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                                                   focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                    />
                                </div>

                                {/* Tags */}
                                <div>
                                    <label
                                        htmlFor="tags"
                                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                                    >
                                        Tags (comma-separated)
                                    </label>
                                    <input
                                        type="text"
                                        id="tags"
                                        name="tags"
                                        defaultValue={initialTags || ""}
                                        placeholder="tag1, tag2, tag3"
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg 
                                                   bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                                                   focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                {/* Pinned */}
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="pinned"
                                        name="pinned"
                                        defaultChecked={initialPinned}
                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded 
                                                   focus:ring-blue-500 dark:focus:ring-blue-600 
                                                   dark:ring-offset-gray-800 focus:ring-2 
                                                   dark:bg-gray-700 dark:border-gray-600"
                                    />
                                    <label
                                        htmlFor="pinned"
                                        className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300"
                                    >
                                        Pin this note
                                    </label>
                                </div>

                                {/* Buttons */}
                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 
                                                   rounded-lg text-gray-700 dark:text-gray-300 
                                                   hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg 
                                                   hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 
                                                   transition-colors"
                                    >
                                        Add Note
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

