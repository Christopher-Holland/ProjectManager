"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle } from "lucide-react";

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void | Promise<void>;
    title?: string;
    message?: string;
    confirmText?: string;
    cancelText?: string;
    variant?: "danger" | "warning" | "info";
}

export default function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title = "Confirm Delete",
    message = "Are you sure you want to delete this item? This action cannot be undone.",
    confirmText = "Delete",
    cancelText = "Cancel",
    variant = "danger",
}: ConfirmModalProps) {
    const handleConfirm = async () => {
        await onConfirm();
        onClose();
    };

    const getVariantStyles = () => {
        switch (variant) {
            case "danger":
                return {
                    icon: "text-red-600 dark:text-red-400",
                    confirmButton: "bg-red-600 hover:bg-red-700 text-white",
                    border: "border-red-200 dark:border-red-800",
                };
            case "warning":
                return {
                    icon: "text-yellow-600 dark:text-yellow-400",
                    confirmButton: "bg-yellow-600 hover:bg-yellow-700 text-white",
                    border: "border-yellow-200 dark:border-yellow-800",
                };
            case "info":
            default:
                return {
                    icon: "text-blue-600 dark:text-blue-400",
                    confirmButton: "bg-blue-600 hover:bg-blue-700 text-white",
                    border: "border-blue-200 dark:border-blue-800",
                };
        }
    };

    const styles = getVariantStyles();

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
                        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 w-full max-w-md">
                            <div className="flex items-start gap-4">
                                <div className={`flex-shrink-0 ${styles.icon}`}>
                                    <AlertTriangle size={24} />
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">
                                        {title}
                                    </h2>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                                        {message}
                                    </p>
                                    <div className="flex justify-end gap-3">
                                        <button
                                            type="button"
                                            onClick={onClose}
                                            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                        >
                                            {cancelText}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleConfirm}
                                            className={`px-4 py-2 rounded-lg transition-colors ${styles.confirmButton}`}
                                        >
                                            {confirmText}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

