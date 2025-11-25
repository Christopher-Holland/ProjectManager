"use client";

import React, { useState, useMemo } from "react";
import { Calendar, Trash2, Pencil, FolderOpen, ExternalLink, ChevronDown, ChevronUp } from "lucide-react";
import EditTaskModal from "@/app/components/modals/editTask-modal";
import ConfirmModal from "@/app/components/modals/confirm-modal";
import type { Task } from "@/app/types";

interface TasksCardProps {
    id: string;
    title: string;
    description?: string | null;
    dueDate?: Date | string | null;
    priority?: number;
    status?: string;
    projectTitle?: string;
    projectID?: string;
    completed?: boolean;
    subtasks?: Array<{ id: string; title: string; completed: boolean }>;
    onTaskToggle?: (id: string, completed: boolean) => void;
    onSubtaskToggle?: (taskId: string, subtaskId: string, completed: boolean) => void;
    onDelete?: (id: string) => void;
    onEdit?: (id: string) => void;
    onUpdate?: (id: string, data: {
        title: string;
        description: string;
        dueDate?: string;
        priority: number;
        status: string;
    }) => Promise<void>;
    onNavigateToProject?: (projectId: string) => void;
}

export default function TasksCard({
    id,
    title,
    description,
    dueDate,
    priority = 1,
    status = "pending",
    projectTitle,
    projectID,
    completed = false,
    subtasks = [],
    onTaskToggle,
    onSubtaskToggle,
    onDelete,
    onEdit,
    onUpdate,
    onNavigateToProject,
}: TasksCardProps) {

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

    // ----- Local State -----
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isSubtasksExpanded, setIsSubtasksExpanded] = useState(false);

    // Calculate completion percentage from subtasks
    const completionPercentage = useMemo(() => {
        if (subtasks.length === 0) {
            return completed ? 100 : 0;
        }
        const completedCount = subtasks.filter((st) => st.completed).length;
        return Math.round((completedCount / subtasks.length) * 100);
    }, [subtasks, completed]);

    // Get color class for completion percentage
    const getPercentageColor = (percentage: number) => {
        if (percentage < 50) {
            return "text-red-600 dark:text-red-400";
        } else if (percentage < 80) {
            return "text-blue-600 dark:text-blue-400";
        } else {
            return "text-green-600 dark:text-green-400";
        }
    };

    const handleTaskToggle = () => {
        if (onTaskToggle) {
            onTaskToggle(id, !completed);
        }
    };

    const handleSubtaskToggle = (subtaskId: string, currentCompleted: boolean) => {
        if (onSubtaskToggle) {
            onSubtaskToggle(id, subtaskId, !currentCompleted);
        }
    };

    const handleDelete = () => {
        if (onDelete) {
            setIsDeleteModalOpen(true);
        }
    };

    const handleEdit = () => {
        onEdit && onEdit(id);
        setIsEditModalOpen(true);
    };

    const handleSave = async (data: {
        title: string;
        description: string;
        taskId?: string;
        subtasks?: Array<{ id?: string; title: string; description?: string; action: 'create' | 'update' | 'delete' }>;
    }) => {
        if (onUpdate) {
            // Convert to task update format
            await onUpdate(id, {
                title: data.title,
                description: data.description,
                priority: priority,
                status: status,
            });
        }
        setIsEditModalOpen(false);
        // Note: Subtask updates are handled by the EditTaskModal's onSave callback
        // which should trigger a refresh in the parent component
    };

    const handleCloseModal = () => {
        setIsEditModalOpen(false);
    };

    return (
        <div className="p-5 rounded-lg border border-gray-400 dark:border-gray-700 shadow-md bg-gray-200 dark:bg-gray-900 space-y-3">

            {/* ---------- Line 1: Task Checkbox + Title + Edit + Delete ---------- */}
            <div className="flex items-start gap-3">
                {/* Circular checkbox for task */}
                <button
                    onClick={handleTaskToggle}
                    aria-pressed={completed}
                    aria-label={`Mark ${title} ${completed ? "incomplete" : "complete"}`}
                    className={`flex-none w-6 h-6 rounded-full border-2 flex items-center justify-center transition mt-0.5 ${
                        completed
                            ? "bg-blue-600 border-blue-600"
                            : "bg-white border-gray-300 dark:bg-gray-800 dark:border-gray-700"
                    }`}
                >
                    {completed && (
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
                    <div className="flex items-start justify-between">
                        <h2 className={`text-base font-semibold text-gray-900 dark:text-gray-100 pr-2 ${
                            completed ? "line-through text-gray-400 dark:text-gray-500" : ""
                        }`}>
                            {title}
                        </h2>

                        <div className="flex items-center gap-2 flex-shrink-0">
                            {onEdit && (
                                <button
                                    onClick={handleEdit}
                                    className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                                    aria-label="Edit task"
                                >
                                    <Pencil size={18} />
                                </button>
                            )}
                            {onDelete && (
                                <button
                                    onClick={handleDelete}
                                    className="text-blue-500 hover:text-red-500 dark:text-blue-400 dark:hover:text-red-500 transition-colors"
                                    aria-label="Delete task"
                                >
                                    <Trash2 size={18} />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ---------- Line 2: Description ---------- */}
            {description && (
                <p className={`text-sm text-gray-600 dark:text-gray-400 ${
                    completed ? "line-through" : ""
                }`}>
                    {description}
                </p>
            )}

            {/* ---------- Line 3: Priority + Project + Due Date ---------- */}
            <div className="flex items-center justify-between gap-2 flex-wrap">
                {/* Left side: Priority + Project */}
                <div className="flex items-center gap-2 flex-wrap">
                    <span
                        className={`text-xs px-2.5 py-1 rounded-full font-medium ${priorityColor}`}
                    >
                        {priorityLabel}
                    </span>

                    {projectTitle && (
                        <div className="flex items-center gap-1">
                            {onNavigateToProject && projectID ? (
                                <button
                                    onClick={() => onNavigateToProject(projectID)}
                                    className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                                    aria-label={`Go to ${projectTitle} project`}
                                >
                                    <FolderOpen size={12} />
                                    <span>{projectTitle}</span>
                                    <ExternalLink size={10} />
                                </button>
                            ) : (
                                <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                                    <FolderOpen size={12} />
                                    <span>{projectTitle}</span>
                                </div>
                            )}
                        </div>
                    )}

                    {dueInfo && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-700 dark:text-gray-300">
                            <Calendar size={12} className="text-gray-500 dark:text-gray-400" />
                            <span>{dueInfo}</span>
                        </div>
                    )}
                </div>

                {/* Right side: Completion percentage */}
                {subtasks.length > 0 && (
                    <div className={`text-xs font-semibold ${getPercentageColor(completionPercentage)}`}>
                        {completionPercentage}%
                    </div>
                )}
            </div>

            {/* ---------- Line 4: Subtasks Dropdown ---------- */}
            {subtasks.length > 0 && (
                <div className="border-t border-gray-300 dark:border-gray-700 pt-3">
                    <button
                        onClick={() => setIsSubtasksExpanded(!isSubtasksExpanded)}
                        className="flex items-center justify-between w-full text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                    >
                        <span>
                            Subtasks ({subtasks.filter((st) => st.completed).length}/{subtasks.length})
                        </span>
                        {isSubtasksExpanded ? (
                            <ChevronUp size={16} />
                        ) : (
                            <ChevronDown size={16} />
                        )}
                    </button>

                    {isSubtasksExpanded && (
                        <ul className="mt-3 space-y-2">
                            {subtasks.map((subtask) => (
                                <li key={subtask.id} className="flex items-start gap-3">
                                    <button
                                        onClick={() => handleSubtaskToggle(subtask.id, subtask.completed)}
                                        aria-pressed={subtask.completed}
                                        aria-label={`Mark ${subtask.title} ${subtask.completed ? "incomplete" : "complete"}`}
                                        className={`flex-none w-5 h-5 rounded-full border-2 flex items-center justify-center transition mt-0.5 ${
                                            subtask.completed
                                                ? "bg-blue-600 border-blue-600"
                                                : "bg-white border-gray-300 dark:bg-gray-800 dark:border-gray-700"
                                        }`}
                                    >
                                        {subtask.completed && (
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
                                            className={`text-sm ${
                                                subtask.completed
                                                    ? "line-through text-gray-400 dark:text-gray-500"
                                                    : "text-gray-700 dark:text-gray-200"
                                            }`}
                                        >
                                            {subtask.title}
                                        </p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}

            {/* Edit Task Modal */}
            <EditTaskModal
                isOpen={isEditModalOpen}
                onClose={handleCloseModal}
                onSave={handleSave}
                initialTask={{
                    id,
                    title,
                    description: description || null,
                    completed,
                    subtasks: subtasks.map((st) => ({
                        id: st.id,
                        title: st.title,
                        completed: st.completed,
                        description: null,
                    })),
                } as Task}
            />

            {/* Confirm Delete Modal */}
            {onDelete && (
                <ConfirmModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                    onConfirm={() => onDelete(id)}
                    title="Delete Task"
                    message="Are you sure you want to delete this task? This action cannot be undone."
                    confirmText="Delete Task"
                    variant="danger"
                />
            )}
        </div>
    );
}
