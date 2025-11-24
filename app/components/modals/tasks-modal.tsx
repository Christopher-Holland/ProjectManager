"use client";

import React, { useEffect, useState } from "react";
import type { Task, Subtask } from "@/app/types";
import { Plus, SquarePen } from "lucide-react";
import AddTaskModal from "./editTask-modal";

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
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);

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

    const handleSaveTask = async (data: { 
        title: string; 
        description: string; 
        taskId?: string;
        subtasks?: Array<{ id?: string; title: string; description?: string; action: 'create' | 'update' | 'delete' }>;
    }) => {
        try {
            console.log("handleSaveTask called with data:", data);
            let savedTaskId: string;

            if (data.taskId) {
                // Validate taskId
                if (!data.taskId || data.taskId.trim() === '') {
                    console.error("Invalid taskId:", data.taskId);
                    alert("Failed to update task: Invalid task ID");
                    return;
                }
                
                // Update existing task
                const updatePayload = {
                    title: data.title,
                    description: data.description,
                };
                console.log(`Updating task ${data.taskId} with payload:`, updatePayload);
                
                const url = `/api/tasks/${data.taskId}`;
                console.log(`Making PATCH request to: ${url}`);
                
                const response = await fetch(url, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(updatePayload),
                });
                
                console.log("Update task response status:", response.status, response.statusText);
                console.log("Update task response headers:", Object.fromEntries(response.headers.entries()));

                if (response.ok) {
                    const updatedTask = await response.json();
                    savedTaskId = updatedTask.id;
                    setTasks((prev) =>
                        prev.map((task) =>
                            task.id === data.taskId ? updatedTask : task
                        )
                    );
                } else {
                    let errorMessage = "Unknown error";
                    let errorDetails: any = null;
                    try {
                        const responseText = await response.text();
                        console.error("Failed to update task - Response text:", responseText);
                        try {
                            errorDetails = JSON.parse(responseText);
                            errorMessage = errorDetails.error || errorDetails.message || `HTTP ${response.status}: ${response.statusText}`;
                            console.error("Failed to update task - Parsed error:", errorDetails);
                        } catch (parseError) {
                            errorMessage = responseText || `HTTP ${response.status}: ${response.statusText}`;
                            console.error("Failed to update task - Non-JSON response:", responseText);
                        }
                    } catch (e) {
                        errorMessage = `HTTP ${response.status}: ${response.statusText}`;
                        console.error("Failed to update task - Error reading response:", e);
                    }
                    alert(`Failed to update task: ${errorMessage}`);
                    return;
                }
            } else {
                // Create new task
                const response = await fetch(`/api/projects/${projectId}/tasks`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        title: data.title,
                        description: data.description,
                    }),
                });

                if (response.ok) {
                    const newTask = await response.json();
                    savedTaskId = newTask.id;
                    setTasks((prev) => [...prev, newTask]);
                } else {
                    let errorMessage = "Unknown error";
                    try {
                        const errorData = await response.json();
                        errorMessage = errorData.error || errorData.message || `HTTP ${response.status}: ${response.statusText}`;
                        console.error("Failed to create task:", errorData);
                    } catch (e) {
                        errorMessage = `HTTP ${response.status}: ${response.statusText}`;
                        console.error("Failed to create task - non-JSON error:", response.status, response.statusText);
                    }
                    alert(`Failed to create task: ${errorMessage}`);
                    return;
                }
            }

            // Handle subtasks
            if (data.subtasks && data.subtasks.length > 0) {
                const subtaskPromises = data.subtasks.map(async (subtask) => {
                    if (subtask.action === 'delete' && subtask.id) {
                        // Delete subtask
                        try {
                            await fetch(`/api/subtasks/${subtask.id}`, {
                                method: "DELETE",
                            });
                        } catch (error) {
                            console.error("Error deleting subtask:", error);
                        }
                    } else if (subtask.action === 'create' || !subtask.id) {
                        // Create new subtask
                        try {
                            const response = await fetch(`/api/tasks/${savedTaskId}/subtasks`, {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                    title: subtask.title,
                                    description: subtask.description,
                                }),
                            });
                            if (!response.ok) {
                                console.error("Failed to create subtask");
                            }
                        } catch (error) {
                            console.error("Error creating subtask:", error);
                        }
                    } else if (subtask.action === 'update' && subtask.id) {
                        // Update existing subtask
                        try {
                            const response = await fetch(`/api/subtasks/${subtask.id}`, {
                                method: "PATCH",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                    title: subtask.title,
                                    description: subtask.description,
                                }),
                            });
                            if (!response.ok) {
                                console.error("Failed to update subtask");
                            }
                        } catch (error) {
                            console.error("Error updating subtask:", error);
                        }
                    }
                });

                await Promise.all(subtaskPromises);
            }

            // Refresh tasks to get updated subtasks
            const refreshResponse = await fetch(`/api/projects/${projectId}/tasks`);
            if (refreshResponse.ok) {
                const refreshedTasks = await refreshResponse.json();
                setTasks(refreshedTasks);
            }

            setIsTaskModalOpen(false);
            setEditingTask(null);
        } catch (error) {
            console.error("Error saving task:", error);
            alert(`Error saving task: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
    };

    const handleEditTask = (task: Task) => {
        setEditingTask(task);
        setIsTaskModalOpen(true);
    };

    const handleAddTask = () => {
        setEditingTask(null);
        setIsTaskModalOpen(true);
    };

    const handleCloseTaskModal = () => {
        setIsTaskModalOpen(false);
        setEditingTask(null);
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
                                                <div className="flex-1">
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

                                                <div className="flex items-center gap-3 ml-4">
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">
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
                                                    <button
                                                        onClick={() => handleEditTask(task)}
                                                        className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                                                        aria-label="Edit task"
                                                    >
                                                        <SquarePen size={16} />
                                                    </button>
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

                <footer className="px-6 py-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-3">
                    <button
                        onClick={handleAddTask}
                        className="flex items-center gap-2
                            bg-gray-900 text-white
                            hover:bg-gray-700
                            dark:bg-blue-700 dark:hover:bg-blue-500
                            px-4 py-2 rounded-xl
                            shadow-sm transition-colors"
                    >
                        <Plus size={16} />
                        <span>Add Task</span>
                    </button>

                    <div className="flex items-center gap-2">
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
                    </div>
                </footer>

                {/* Add/Edit Task Modal */}
                <AddTaskModal
                    isOpen={isTaskModalOpen}
                    onClose={handleCloseTaskModal}
                    onSave={handleSaveTask}
                    initialTask={editingTask}
                />
            </div>
        </div>
    );
}