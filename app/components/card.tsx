"use client";

import { useState, useMemo } from "react";
import { Calendar, Trash2, ChevronDown, Pencil } from "lucide-react";

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

    // ----- Local Status State -----
    const [localStatus, setLocalStatus] = useState(status);

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
        if (onEdit) {
            onEdit(id);
        }
    };

    return (
        <div className="p-5 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm bg-white dark:bg-gray-900 space-y-3">

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

            {/* ---------- Line 4: Priority + Release ---------- */}
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

            {/* ---------- Line 5: Status Dropdown ---------- */}
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
        </div>
    );
}