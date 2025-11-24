"use client";

import React, { useEffect, useState } from "react";
import type { Task, Subtask } from "@/app/types";

interface TaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    projectId: string;
    projectTitle?: string;
}

export default function TaskModal({
    isOpen,
    onClose,
    projectId,
    projectTitle = "Tasks",
}: TaskModalProps) {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch tasks when modal opens
    useEffect(() => {
        if (!isOpen || !projectId) return;

        async function fetchTasks() {
            try {
                setLoading(true);
                setError(null);
                const response = await fetch(`/api/projects/${projectId}/tasks`);
                if (response.ok) {
                    const data = await response.json();
                    setTasks(data);
                } else {
                    setError("Failed to load tasks");
                }
            } catch (err) {
                console.error("Error fetching tasks:", err);
                setError("Failed to load tasks");
            } finally {
                setLoading(false);
            }
        }

        fetchTasks();
    }, [isOpen, projectId]);

    const handleToggleTask = async (taskId: string, completed: boolean) => {
        try {
            const response = await fetch(`/api/tasks/${taskId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ completed }),
            });

            if (response.ok) {
                setTasks((prev) =>
                    prev.map((task) =>
                        task.id === taskId ? { ...task, completed } : task
                    )
                );
            }
        } catch (error) {
            console.error("Error updating task:", error);
        }
    };

    const handleToggleSubtask = async (taskId: string, subtaskId: string, completed: boolean) => {
        try {
            const response = await fetch(`/api/subtasks/${subtaskId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ completed }),
            });

            if (response.ok) {
                setTasks((prev) =>
                    prev.map((task) =>
                        task.id === taskId
                            ? {
                                ...task,
                                subtasks: task.subtasks?.map((sub) =>
                                    sub.id === subtaskId ? { ...sub, completed } : sub
                                ),
                            }
                            : task
                    )
                );
            }
        } catch (error) {
            console.error("Error updating subtask:", error);
        }
    };

    // Calculate overall completion percentage
    const calculateCompletionPercentage = () => {
        if (tasks.length === 0) return 0;
        
        let totalItems = 0;
        let completedItems = 0;
        
        tasks.forEach((task) => {
            totalItems += 1; // Count the task itself
            if (task.completed) completedItems += 1;
            
            if (task.subtasks) {
                task.subtasks.forEach((subtask) => {
                    totalItems += 1; // Count each subtask
                    if (subtask.completed) completedItems += 1;
                });
            }
        });
        
        return totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
    };

    const completionPercentage = calculateCompletionPercentage();

    // Get color class for completion percentage
    const getPercentageColor = (percentage: number) => {
        if (percentage < 50) {
            return "text-red-600 dark:text-red-400"; // Low completion - red
        } else if (percentage < 80) {
            return "text-blue-600 dark:text-blue-400"; // Medium completion - blue
        } else {
            return "text-green-600 dark:text-green-400"; // High completion - green
        }
    };

    // close on escape
    useEffect(() => {
        if (!isOpen) return;
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        // Backdrop
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-label={projectTitle}
        >
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal panel */}
            <div className="relative z-10 w-full max-w-2xl mx-auto bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden">
                <header className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {projectTitle}
                    </h3>
                    <p className={`text-sm font-semibold ${getPercentageColor(completionPercentage)}`}>
                        {completionPercentage}%
                    </p>
                </header>

                <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">
                    {loading ? (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Loading tasks...
                        </p>
                    ) : error ? (
                        <p className="text-sm text-red-600 dark:text-red-400">
                            {error}
                        </p>
                    ) : tasks.length === 0 ? (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            No tasks.
                        </p>
                    ) : (
                        <ul className="space-y-4">
                            {tasks.map((task) => (
                                <li
                                    key={task.id}
                                    className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4"
                                >
                                    <div className="flex items-start gap-3">
                                        {/* Circular checkbox for task */}
                                        <button
                                            onClick={() =>
                                                handleToggleTask(task.id, !task.completed)
                                            }
                                            aria-pressed={task.completed}
                                            aria-label={`Mark ${task.title} ${task.completed ? "incomplete" : "complete"}`}
                                            className={`flex-none w-6 h-6 rounded-full border-2 flex items-center justify-center transition ${task.completed
                                                ? "bg-blue-600 border-blue-600"
                                                : "bg-white border-gray-300 dark:bg-gray-900 dark:border-gray-700"
                                                }`}
                                        >
                                            {/* check icon (simple) */}
                                            {task.completed && (
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="white"
                                                    strokeWidth="3"
                                                    className="w-3 h-3"
                                                    aria-hidden
                                                >
                                                    <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            )}
                                        </button>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p
                                                        className={`font-medium text-sm truncate ${task.completed
                                                            ? "line-through text-gray-400 dark:text-gray-500"
                                                            : "text-gray-900 dark:text-gray-100"
                                                            }`}
                                                    >
                                                        {task.title}
                                                    </p>
                                                    {task.description && (
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                            {task.description}
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="ml-4 text-xs text-gray-500 dark:text-gray-400">
                                                    {/* optional: show completion % */}
                                                    {(() => {
                                                        const total = (task.subtasks?.length ?? 0) + 1;
                                                        const done =
                                                            (task.completed ? 1 : 0) +
                                                            (task.subtasks?.filter((s) => s.completed).length ?? 0);
                                                        const percent = Math.round((done / total) * 100);
                                                        return `${percent}%`;
                                                    })()}
                                                </div>
                                            </div>

                                            {/* subtasks */}
                                            {task.subtasks && task.subtasks.length > 0 && (
                                                <ul className="mt-3 space-y-2">
                                                    {task.subtasks.map((sub) => (
                                                        <li key={sub.id} className="flex items-start gap-3">
                                                            <button
                                                                onClick={() =>
                                                                    handleToggleSubtask(task.id, sub.id, !sub.completed)
                                                                }
                                                                aria-pressed={sub.completed}
                                                                aria-label={`Mark ${sub.title} ${sub.completed ? "incomplete" : "complete"}`}
                                                                className={`flex-none w-5 h-5 rounded-full border-2 flex items-center justify-center transition mt-0.5 ${sub.completed
                                                                    ? "bg-blue-600 border-blue-600"
                                                                    : "bg-white border-gray-300 dark:bg-gray-900 dark:border-gray-700"
                                                                    }`}
                                                            >
                                                                {sub.completed && (
                                                                    <svg
                                                                        xmlns="http://www.w3.org/2000/svg"
                                                                        viewBox="0 0 24 24"
                                                                        fill="none"
                                                                        stroke="white"
                                                                        strokeWidth="3"
                                                                        className="w-3 h-3"
                                                                        aria-hidden
                                                                    >
                                                                        <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                                                                    </svg>
                                                                )}
                                                            </button>

                                                            <div className="flex-1">
                                                                <p
                                                                    className={`text-sm truncate ${sub.completed
                                                                        ? "line-through text-gray-400 dark:text-gray-500"
                                                                        : "text-gray-700 dark:text-gray-200"
                                                                        }`}
                                                                >
                                                                    {sub.title}
                                                                </p>
                                                            </div>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <footer className="px-6 py-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-end gap-3">

                    <button
                        onClick={onClose}
                        aria-label="Close"
                        className="flex items-center gap-2
                            bg-gray-900 text-white
                            hover:bg-gray-700
                            dark:bg-blue-700 dark:hover:bg-blue-500
                            px-4 py-2 rounded-xl
                            shadow-sm transition-colors"
                    >
                        Close
                    </button>

                    <button
                        onClick={onClose}
                        className="flex items-center gap-2
                            bg-gray-900 text-white
                            hover:bg-gray-700
                            dark:bg-blue-700 dark:hover:bg-blue-500
                            px-4 py-2 rounded-xl
                            shadow-sm transition-colors"
                    >
                        Done
                    </button>
                </footer>
            </div>
        </div>
    );
}