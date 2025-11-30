"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Task, Subtask } from "@/app/types";
import { Plus, X, Pencil } from "lucide-react";
import ConfirmModal from "./confirm-modal";

interface TaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: {
        title: string;
        description: string;
        taskId?: string;
        subtasks?: Array<{ id?: string; title: string; description?: string; action: 'create' | 'update' | 'delete' }>;
    }) => void | Promise<void>;
    onDelete?: (taskId: string) => void | Promise<void>;
    initialTask?: Task | null;
}

export default function TaskModal({
    isOpen,
    onClose,
    onSave,
    onDelete,
    initialTask = null,
}: TaskModalProps) {
    const isEditMode = !!initialTask;
    const [subtasks, setSubtasks] = useState<Array<{ id?: string; title: string; description?: string; action?: 'create' | 'update' | 'delete' }>>([]);
    const [editingSubtaskIndex, setEditingSubtaskIndex] = useState<number | null>(null);
    const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    // Initialize subtasks when modal opens or task changes
    useEffect(() => {
        if (isOpen) {
            if (initialTask?.subtasks) {
                setSubtasks(initialTask.subtasks.map(sub => ({
                    id: sub.id,
                    title: sub.title,
                    description: sub.description || "",
                })));
            } else {
                setSubtasks([]);
            }
            setNewSubtaskTitle("");
            setEditingSubtaskIndex(null);
        }
    }, [isOpen, initialTask]);

    const handleAddSubtask = () => {
        if (newSubtaskTitle.trim()) {
            setSubtasks([...subtasks, {
                title: newSubtaskTitle.trim(),
                description: "",
                action: 'create'
            }]);
            setNewSubtaskTitle("");
        }
    };

    const handleUpdateSubtask = (index: number, title: string, description?: string) => {
        const updated = [...subtasks];
        const existing = updated[index];
        updated[index] = {
            ...existing,
            title,
            description: description || "",
            action: existing.id ? 'update' : 'create',
        };
        setSubtasks(updated);
        setEditingSubtaskIndex(null);
    };

    const handleDeleteSubtask = (index: number) => {
        const subtask = subtasks[index];
        if (subtask.id) {
            // Mark for deletion
            setSubtasks(subtasks.map((s, i) =>
                i === index ? { ...s, action: 'delete' as const } : s
            ));
        } else {
            // Remove new subtask that wasn't saved yet
            setSubtasks(subtasks.filter((_, i) => i !== index));
        }
    };

    const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        // Include ALL subtasks (including deleted ones) so deletions can be processed
        const subtasksToSave = subtasks.map(sub => ({
            id: sub.id,
            title: sub.title,
            description: sub.description || "",
            action: sub.action || (sub.id ? 'update' : 'create') as 'create' | 'update' | 'delete',
        }));

        const saveData = {
            title: formData.get("title") as string,
            description: formData.get("description") as string,
            taskId: initialTask?.id,
            subtasks: subtasksToSave,
        };

        await onSave(saveData);
    };

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
                            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
                                {isEditMode ? "Edit Task" : "Add New Task"}
                            </h2>

                            <form
                                onSubmit={handleSave}
                                className="space-y-4"
                            >
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Task Title
                                    </label>
                                    <input
                                        type="text"
                                        name="title"
                                        defaultValue={initialTask?.title || ""}
                                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                            placeholder="Enter task title"
                                        required
                        />
                    </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Description
                                    </label>
                                    <textarea
                                        name="description"
                                        rows={4}
                                        defaultValue={initialTask?.description || ""}
                                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                            placeholder="Optional description"
                                    />
                                </div>

                                {/* Subtasks Section */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Subtasks
                                    </label>
                                    <div className="space-y-2 max-h-60 overflow-y-auto">
                                        {subtasks.map((subtask, index) => {
                                            if (subtask.action === 'delete') return null;

                                            const isEditing = editingSubtaskIndex === index;

                                            return (
                                                <div
                                                    key={subtask.id || index}
                                                    className="flex items-start gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg"
                                                >
                                                    {isEditing ? (
                                                        <input
                                                            type="text"
                                                            defaultValue={subtask.title}
                                                            onBlur={(e) => {
                                                                if (e.target.value.trim()) {
                                                                    handleUpdateSubtask(index, e.target.value.trim(), subtask.description);
                                                                } else {
                                                                    setEditingSubtaskIndex(null);
                                                                }
                                                            }}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') {
                                                                    e.preventDefault();
                                                                    const target = e.target as HTMLInputElement;
                                                                    if (target.value.trim()) {
                                                                        handleUpdateSubtask(index, target.value.trim(), subtask.description);
                                                                    }
                                                                } else if (e.key === 'Escape') {
                                                                    setEditingSubtaskIndex(null);
                                                                }
                                                            }}
                                                            autoFocus
                                                            className="flex-1 px-2 py-1 text-sm rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                                                        />
                                                    ) : (
                                                        <>
                                                            <span className="flex-1 text-sm text-gray-900 dark:text-gray-100">
                                                                {subtask.title}
                                                            </span>
                                                            <button
                                                                type="button"
                                                                onClick={() => setEditingSubtaskIndex(index)}
                                                                className="flex-shrink-0 text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                                                                aria-label="Edit subtask"
                                                            >
                                                                <Pencil size={14} />
                                                            </button>
                                                        </>
                                                    )}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteSubtask(index)}
                                                        className="flex-shrink-0 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                                                        aria-label="Delete subtask"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Add New Subtask */}
                                    <div className="flex gap-2 mt-2">
                                        <input
                                            type="text"
                                            value={newSubtaskTitle}
                                            onChange={(e) => setNewSubtaskTitle(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    handleAddSubtask();
                                                }
                                            }}
                                            placeholder="Add subtask..."
                                            className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleAddSubtask}
                                            className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                            aria-label="Add subtask"
                                        >
                                            <Plus size={16} />
                                        </button>
                    </div>
                </div>

                                <div className="flex justify-end gap-3 pt-4">
                                    {isEditMode && onDelete && initialTask?.id && (
                                        <button
                                            type="button"
                                            onClick={() => setIsDeleteModalOpen(true)}
                                            className="px-4 py-2 rounded-lg border border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                        >
                                            Delete Task
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                                    >
                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                                    >
                                        {isEditMode ? "Save Changes" : "Add Task"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>

                    {/* Confirm Delete Modal */}
                    {isEditMode && onDelete && initialTask?.id && (
                        <ConfirmModal
                            isOpen={isDeleteModalOpen}
                            onClose={() => setIsDeleteModalOpen(false)}
                            onConfirm={async () => {
                                await onDelete(initialTask.id);
                                onClose();
                            }}
                            title="Delete Task"
                            message="Are you sure you want to delete this task? This action cannot be undone."
                            confirmText="Delete Task"
                            variant="danger"
                        />
                    )}
                </>
            )}
        </AnimatePresence>
    );
}