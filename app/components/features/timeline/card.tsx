"use client";

import { useMemo } from "react";
import { Calendar, Target, CheckSquare, CircleDot } from "lucide-react";

interface TimelineCardProps {
    title: string;
    dueDate: Date | string;
    type: "task" | "subtask" | "project";
    priority?: number;
    status?: string;
    projectTitle?: string;
    completed?: boolean;
}

export default function TimelineCard({
    title,
    dueDate,
    type,
    priority = 1,
    status = "pending",
    projectTitle,
    completed = false
}: TimelineCardProps) {

    // Calculate days remaining and check if overdue
    const { dueInfo, isOverdue } = useMemo(() => {
        if (!dueDate) return { dueInfo: null, isOverdue: false };

        const now = new Date();
        const end = new Date(dueDate);

        const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        if (diff < 0) return { dueInfo: "Overdue", isOverdue: true };
        if (diff === 0) return { dueInfo: "Due today", isOverdue: false };

        return { dueInfo: `${diff} day${diff === 1 ? "" : "s"} left`, isOverdue: false };
    }, [dueDate]);

    // Format due date for display
    const formattedDate = useMemo(() => {
        if (!dueDate) return null;
        const date = new Date(dueDate);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    }, [dueDate]);

    // Type badge styles
    const typeLabel = {
        task: "Task",
        subtask: "Subtask",
        project: "Project",
    }[type];

    const typeColor = {
        task: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
        subtask: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
        project: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300",
    }[type];

    // Priority badge styles
    const priorityLabel = {
        1: "Low",
        2: "Medium",
        3: "High",
    }[priority || 1];

    const priorityColor = {
        1: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
        2: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
        3: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
    }[priority || 1];

    // Status badge styles
    const statusLabel = {
        active: "Active",
        pending: "Pending",
        in_progress: "In Progress",
        completed: "Completed",
    }[status || "pending"] || status;

    const statusColor = {
        active: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
        pending: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
        in_progress: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
        completed: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
    }[status || "pending"] || "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";

    // Get icon based on type
    const getIcon = () => {
        switch (type) {
            case "project":
                return <Target className="w-5 h-5" />;
            case "task":
                return <CheckSquare className="w-5 h-5" />;
            case "subtask":
                return <CircleDot className="w-5 h-5" />;
            default:
                return <CheckSquare className="w-5 h-5" />;
        }
    };

    // Get circle color based on status
    const getCircleColor = () => {
        if (completed || status === "completed") {
            return "bg-green-500 border-green-500 text-white";
        } else if (status === "in_progress") {
            return "bg-blue-500 border-blue-500 text-white";
        } else {
            return "bg-yellow-500 border-yellow-500 text-white";
        }
    };

    return (
        <div className={`p-5 rounded-lg border-2 shadow-md bg-gray-200 dark:bg-gray-900 space-y-3 ${isOverdue
                ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                : "border-gray-400 dark:border-gray-700"
            } ${completed ? "opacity-75" : ""}`}>
            {/* Header: Title + Icon Circle */}
            <div className="flex items-start gap-3">
                <div className={`flex-none w-10 h-10 rounded-full border-2 flex items-center justify-center transition mt-0.5 ${getCircleColor()}`}>
                    {getIcon()}
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className={`text-base font-semibold text-gray-900 dark:text-gray-100 ${completed ? "line-through text-gray-400 dark:text-gray-500" : ""
                        }`}>
                        {title}
                    </h3>
                    {projectTitle && type !== "project" && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {projectTitle}
                        </p>
                    )}
                </div>
            </div>

            {/* Due Date Info */}
            {dueDate && (
                <div className="flex items-center gap-1.5 text-sm text-gray-700 dark:text-gray-300">
                    <Calendar size={16} className="text-gray-500 dark:text-gray-400" />
                    <span className="font-medium">{formattedDate}</span>
                    {dueInfo && (
                        <span className={`text-xs ${dueInfo === "Overdue"
                                ? "text-red-600 dark:text-red-400 font-semibold"
                                : "text-gray-500 dark:text-gray-400"
                            }`}>
                            ({dueInfo})
                        </span>
                    )}
                    {/* Pills: Type, Priority, Status */}
                    <div className="flex items-center gap-2 flex-wrap">
                        {/* Type Pill */}
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${typeColor}`}>
                            {typeLabel}
                        </span>

                        {/* Priority Pill (only for tasks and projects) */}
                        {type !== "subtask" && priority && (
                            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${priorityColor}`}>
                                {priorityLabel}
                            </span>
                        )}

                        {/* Status Pill */}
                        {status && (
                            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColor}`}>
                                {statusLabel}
                            </span>
                        )}
                    </div>
                </div>
            )}


        </div>
    );
}
