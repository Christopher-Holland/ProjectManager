"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface AddSettingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: {
        key: string;
        value: string;
        category?: string;
        description?: string;
    }) => void | Promise<void>;
}

export default function AddSettingModal({
    isOpen,
    onClose,
    onSave,
}: AddSettingModalProps) {
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
                                    Add Setting
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
                                        key: formData.get("key") as string,
                                        value: formData.get("value") as string,
                                        category: formData.get("category") as string || undefined,
                                        description: formData.get("description") as string || undefined,
                                    });
                                }}
                                className="space-y-4"
                            >
                                {/* Key */}
                                <div>
                                    <label
                                        htmlFor="key"
                                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                                    >
                                        Key *
                                    </label>
                                    <input
                                        type="text"
                                        id="key"
                                        name="key"
                                        required
                                        placeholder="e.g., theme, notifications_enabled"
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg 
                                                   bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                                                   focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                {/* Value */}
                                <div>
                                    <label
                                        htmlFor="value"
                                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                                    >
                                        Value *
                                    </label>
                                    <input
                                        type="text"
                                        id="value"
                                        name="value"
                                        required
                                        placeholder="e.g., dark, true, 100"
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg 
                                                   bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                                                   focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                {/* Category */}
                                <div>
                                    <label
                                        htmlFor="category"
                                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                                    >
                                        Category
                                    </label>
                                    <input
                                        type="text"
                                        id="category"
                                        name="category"
                                        placeholder="e.g., appearance, notifications, general"
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg 
                                                   bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                                                   focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                {/* Description */}
                                <div>
                                    <label
                                        htmlFor="description"
                                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                                    >
                                        Description
                                    </label>
                                    <textarea
                                        id="description"
                                        name="description"
                                        rows={3}
                                        placeholder="Optional description of this setting"
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg 
                                                   bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                                                   focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                    />
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
                                        Add Setting
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

