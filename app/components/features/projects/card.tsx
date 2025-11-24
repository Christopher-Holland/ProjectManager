"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Calendar, Trash2, ChevronDown, Pencil, Eye } from "lucide-react";
import EditModal from "@/app/components/modals/edit-modal";
import TaskModal from "@/app/components/modals/tasks-modal";

interface CardProps {
    id: string;
    title: string;
    description?: string | null;
    dueDate?: Date | string | null;
    priority?: number;
    status?: string;
    release?: string | null;
    onStatusChange?: (id: string, newStatus: string) => void;
    onDelete?: (id: string) => void;
    onEdit?: (id: string) => void;
    onUpdate?: (id: string, data: {
        title: string;
        description: string;
        dueDate?: string;
        priority: number;
        status: string;
        release?: string;
    }) => Promise<void>;
}

export default function Card({
    id,
    title,
    description,
    dueDate,
    priority = 1,
    status = "active",
    release,
    onStatusChange,
    onDelete,
    onEdit,
    onUpdate,
}: CardProps) {

    // ----- Calculate days remaining -----
    const dueInfo = useMemo(() => {
        if (!dueDate) return null;

        const now = new Date();
        const end = new Date(dueDate);

        const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        if (diff < 0) return "Overdue";
        if (diff === 0) return "Due today";

        return `${diff} day${diff === 1 ? "" : "s"} left`;
    }, [dueDate]);

    // ----- Priority Badge Styles -----
    const priorityLabel = {
        1: "low",
        2: "medium",
        3: "high",
    }[priority];

    const priorityColor = {
        1: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
        2: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
        3: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
    }[priority];

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

    // ----- Local Status State -----
    const [localStatus, setLocalStatus] = useState(status);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isTasksModalOpen, setIsTasksModalOpen] = useState(false);
    const [completionPercentage, setCompletionPercentage] = useState<number | null>(null);

    // Update local status when prop changes
    useEffect(() => {
        setLocalStatus(status);
    }, [status]);

    // Fetch tasks and calculate completion percentage
    useEffect(() => {
        async function fetchTasksAndCalculatePercentage() {
            try {
                const response = await fetch(`/api/projects/${id}/tasks`);
                if (response.ok) {
                    const tasks = await response.json();

                    // Calculate overall completion
                    let totalItems = 0;
                    let completedItems = 0;

                    tasks.forEach((task: { completed: boolean; subtasks?: { completed: boolean }[] }) => {
                        totalItems += 1; // Count the task itself
                        if (task.completed) completedItems += 1;

                        if (task.subtasks) {
                            task.subtasks.forEach((subtask: { completed: boolean }) => {
                                totalItems += 1; // Count each subtask
                                if (subtask.completed) completedItems += 1;
                            });
                        }
                    });

                    const percentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
                    setCompletionPercentage(percentage);
                }
            } catch (error) {
                console.error("Error fetching tasks for percentage:", error);
                setCompletionPercentage(null);
            }
        }

        fetchTasksAndCalculatePercentage();
    }, [id, isTasksModalOpen]); // Re-fetch when modal closes to update percentage

    const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newStatus = e.target.value;
        setLocalStatus(newStatus);
        onStatusChange && onStatusChange(id, newStatus);
    };

    const handleDelete = () => {
        if (onDelete && confirm("Are you sure you want to delete this project?")) {
            onDelete(id);
        }
    };

    const handleEdit = () => {
        onEdit && onEdit(id);
        setIsEditModalOpen(true);
    };

    const handleSave = async (data: {
        title: string;
        description: string;
        dueDate?: string;
        priority: number;
        status: string;
        release?: string;
    }) => {
        if (onUpdate) {
            await onUpdate(id, data);
        }
        setIsEditModalOpen(false);
    };

    const handleCloseModal = () => {
        setIsEditModalOpen(false);
    };

    return (
        <div className="p-5 rounded-lg border border-gray-400 dark:border-gray-700 shadow-md bg-gray-200 dark:bg-gray-900 space-y-3">

            {/* ---------- Line 1: Title + Edit + Delete ---------- */}
            <div className="flex items-start justify-between">
                <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 pr-2">
                    {title}
                </h2>

                <div className="flex items-center gap-2">
                    {onEdit && (
                        <button
                            onClick={handleEdit}
                            className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                            aria-label="Edit project"
                        >
                            <Pencil size={18} />
                        </button>
                    )}
                    {onDelete && (
                        <button
                            onClick={handleDelete}
                            className="text-blue-500 hover:text-red-500 dark:text-blue-400 dark:hover:text-red-500 transition-colors"
                            aria-label="Delete project"
                        >
                            <Trash2 size={18} />
                        </button>
                    )}
                </div>
            </div>

            {/* ---------- Line 2: Description ---------- */}
            {description && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    {description}
                </p>
            )}

            {/* ---------- Line 3: Days Left ---------- */}
            {dueInfo && (
                <div className="flex items-center gap-1.5 text-sm text-gray-700 dark:text-gray-300">
                    <Calendar size={16} className="text-gray-500 dark:text-gray-400" />
                    <span>{dueInfo}</span>
                </div>
            )}

            {/* ---------- Line 4: Priority + Release + Percentage ---------- */}
            <div className="flex items-center gap-2">

                {/* Left side: Priority + Release */}
                <div className="flex items-center gap-2">
                    <span
                        className={`text-xs px-2.5 py-1 rounded-full font-medium ${priorityColor}`}
                    >
                        {priorityLabel}
                    </span>

                    {release && (
                        <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                            {release}
                        </span>
                    )}
                </div>

                {/* Right side: Completion percentage */}
                {completionPercentage !== null && (
                    <p className={`ml-auto text-sm font-semibold ${getPercentageColor(completionPercentage)}`}>
                        {completionPercentage}%
                    </p>
                )}
            </div>

            {/* ---------- Line 5: Status Dropdown + See Tasks Button ---------- */}
            <div className="flex items-center justify-between">
                <div className="relative w-fit">
                    <select
                        value={localStatus}
                        onChange={handleStatusChange}
                        className="appearance-none text-sm font-medium text-gray-700 dark:text-gray-300 
                                   bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 
                                   rounded-lg px-3 py-1.5 pr-8 cursor-pointer 
                                   hover:bg-gray-200 dark:hover:bg-gray-700 
                                   transition-colors focus:outline-none 
                                   focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="active">To Do</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                    </select>

                    <ChevronDown
                        size={16}
                        className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none 
                                   text-gray-500 dark:text-gray-400"
                    />
                </div>

                <div className="flex flex-col items-end gap-1">

                    <button
                        onClick={() => setIsTasksModalOpen(true)}
                        className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                        <Eye size={16} />
                        <span>See Tasks</span>
                    </button>
                </div>
            </div>

            {/* Edit Modal */}
            <EditModal
                isOpen={isEditModalOpen}
                onClose={handleCloseModal}
                onSave={handleSave}
                initialTitle={title}
                initialDescription={description || ""}
                initialDueDate={dueDate}
                initialPriority={priority}
                initialStatus={status}
                initialRelease={release}
            />

            {/* Tasks Modal */}
            <TaskModal
                isOpen={isTasksModalOpen}
                onClose={() => setIsTasksModalOpen(false)}
                projectId={id}
                projectTitle={`${title} - Tasks`}
            />
        </div>
    );
}