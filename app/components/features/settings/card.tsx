"use client";

import React, { useState, useEffect } from "react";
import { Moon, Sun, Monitor, Pencil, Save, X, Lock, Key, User, Mail } from "lucide-react";
import { useTheme } from "@/app/components/ui/theme-provider";
import { useToast } from "@/app/components/ui/toast";

interface SettingsCardProps {
    id: string;
    keyName: string;
    value: string;
    category?: string | null;
    description?: string | null;
    updatedAt: Date | string;
    type: "theme" | "profile" | "project_defaults" | "security" | "app_preferences";
    profileData?: {
        username: string;
        email: string;
        userId: string;
    };
    projectDefaults?: {
        defaultPriority: string;
        defaultStatus: string;
    };
    appPreferences?: {
        defaultStartPage: string;
        defaultSorting: string;
        defaultGrouping: string;
    };
    onUpdate?: (key: string, value: string) => void | Promise<void>;
    onDelete?: (id: string) => void;
}

export default function SettingsCard({
    id,
    keyName,
    value,
    category,
    description,
    updatedAt,
    type,
    profileData,
    projectDefaults,
    appPreferences,
    onUpdate,
}: SettingsCardProps) {
    const { theme, toggleTheme, setTheme } = useTheme();
    const { showToast } = useToast();
    const [isEditing, setIsEditing] = useState(false);
    const [editValues, setEditValues] = useState<Record<string, string>>({});

    // Reset edit values when props change (when settings are reloaded)
    React.useEffect(() => {
        if (!isEditing) {
            setEditValues({});
        }
    }, [projectDefaults, appPreferences, isEditing]);

    const handleThemeToggle = () => {
        toggleTheme();
        const newTheme = theme === "light" ? "dark" : "light";
        if (onUpdate) {
            onUpdate("theme", newTheme);
        }
    };

    const handleSave = async () => {
        if (!onUpdate) return;

        try {
            if (type === "project_defaults" && projectDefaults) {
                if (editValues.defaultPriority) {
                    await onUpdate("default_priority", editValues.defaultPriority);
                }
                if (editValues.defaultStatus) {
                    await onUpdate("default_status", editValues.defaultStatus);
                }
            } else if (type === "app_preferences" && appPreferences) {
                if (editValues.defaultStartPage) {
                    await onUpdate("default_start_page", editValues.defaultStartPage);
                }
                if (editValues.defaultSorting) {
                    await onUpdate("default_sorting", editValues.defaultSorting);
                }
                if (editValues.defaultGrouping) {
                    await onUpdate("default_grouping", editValues.defaultGrouping);
                }
            } else if (type === "profile" && profileData) {
                // Profile updates would go through Stack Auth
                if (editValues.username) {
                    await onUpdate("username", editValues.username);
                }
                showToast("Profile updates require authentication API", "info");
            } else if (type === "security") {
                // Security updates would go through Stack Auth
                showToast("Security updates require authentication API", "info");
            }
            setIsEditing(false);
            setEditValues({});
            showToast("Settings saved successfully", "success");
        } catch (error) {
            console.error("Error saving settings:", error);
            showToast("Failed to save settings", "error");
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        setEditValues({});
    };

    const renderThemeToggle = () => {
        return (
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">Theme</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
                </div>
                <button
                    onClick={handleThemeToggle}
                    className="p-3 rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    aria-label="Toggle theme"
                >
                    {theme === "light" ? (
                        <Sun className="w-5 h-5 text-yellow-500" />
                    ) : theme === "dark" ? (
                        <Moon className="w-5 h-5 text-blue-500" />
                    ) : (
                        <Monitor className="w-5 h-5 text-gray-500" />
                    )}
                </button>
            </div>
        );
    };

    const renderProfile = () => {
        if (!profileData) return null;

        return (
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Username
                        </label>
                        {isEditing ? (
                            <input
                                type="text"
                                value={editValues.username || profileData.username}
                                onChange={(e) => setEditValues({ ...editValues, username: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                            />
                        ) : (
                            <p className="text-gray-900 dark:text-gray-100">{profileData.username}</p>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Email
                        </label>
                        <p className="text-gray-900 dark:text-gray-100">{profileData.email}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Key className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            User ID
                        </label>
                        <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">{profileData.userId}</p>
                    </div>
                </div>

                {isEditing && (
                    <div className="flex gap-2 pt-2">
                        <button
                            onClick={handleSave}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Save size={16} />
                            Save Changes
                        </button>
                        <button
                            onClick={handleCancel}
                            className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                            <X size={16} />
                            Cancel
                        </button>
                    </div>
                )}

                {!isEditing && (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                        <Pencil size={16} />
                        Edit Profile
                    </button>
                )}
            </div>
        );
    };

    const renderProjectDefaults = () => {
        if (!projectDefaults) return null;

        return (
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Default Priority
                    </label>
                    {isEditing ? (
                        <select
                            value={editValues.defaultPriority || projectDefaults.defaultPriority}
                            onChange={(e) => setEditValues({ ...editValues, defaultPriority: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                        >
                            <option value="1">Low (1)</option>
                            <option value="2">Medium (2)</option>
                            <option value="3">High (3)</option>
                            <option value="4">Critical (4)</option>
                        </select>
                    ) : (
                        <p className="text-gray-900 dark:text-gray-100">
                            {projectDefaults.defaultPriority === "1" ? "Low" :
                             projectDefaults.defaultPriority === "2" ? "Medium" :
                             projectDefaults.defaultPriority === "3" ? "High" : "Critical"} ({projectDefaults.defaultPriority})
                        </p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Default Status
                    </label>
                    {isEditing ? (
                        <select
                            value={editValues.defaultStatus || projectDefaults.defaultStatus}
                            onChange={(e) => setEditValues({ ...editValues, defaultStatus: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                        >
                            <option value="todo">To Do</option>
                            <option value="in_progress">In Progress</option>
                            <option value="completed">Completed</option>
                        </select>
                    ) : (
                        <p className="text-gray-900 dark:text-gray-100 capitalize">
                            {projectDefaults.defaultStatus.replace("_", " ")}
                        </p>
                    )}
                </div>

                {isEditing && (
                    <div className="flex gap-2 pt-2">
                        <button
                            onClick={handleSave}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Save size={16} />
                            Save
                        </button>
                        <button
                            onClick={handleCancel}
                            className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                            <X size={16} />
                            Cancel
                        </button>
                    </div>
                )}

                {!isEditing && (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                        <Pencil size={16} />
                        Edit Defaults
                    </button>
                )}
            </div>
        );
    };

    const renderSecurity = () => {
        return (
            <div className="space-y-4">
                <div>
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Change Password</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        Update your password to keep your account secure
                    </p>
                    <button
                        onClick={() => showToast("Password change requires authentication API", "info")}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                        <Lock size={16} />
                        Change Password
                    </button>
                </div>

                <div>
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Account Security</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Manage your account security settings and two-factor authentication
                    </p>
                </div>
            </div>
        );
    };

    const renderAppPreferences = () => {
        if (!appPreferences) return null;

        return (
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Default Start Page
                    </label>
                    {isEditing ? (
                        <select
                            value={editValues.defaultStartPage || appPreferences.defaultStartPage}
                            onChange={(e) => setEditValues({ ...editValues, defaultStartPage: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                        >
                            <option value="goals">Goals</option>
                            <option value="tasks">Tasks</option>
                            <option value="timeline">Timeline</option>
                            <option value="notes">Notes</option>
                            <option value="settings">Settings</option>
                        </select>
                    ) : (
                        <p className="text-gray-900 dark:text-gray-100 capitalize">
                            {appPreferences.defaultStartPage.replace("_", " ")}
                        </p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Default Sorting
                    </label>
                    {isEditing ? (
                        <select
                            value={editValues.defaultSorting || appPreferences.defaultSorting}
                            onChange={(e) => setEditValues({ ...editValues, defaultSorting: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                        >
                            <option value="updated">Last Updated</option>
                            <option value="created">Date Created</option>
                            <option value="title">Title (A-Z)</option>
                            <option value="priority">Priority</option>
                            <option value="dueDate">Due Date</option>
                        </select>
                    ) : (
                        <p className="text-gray-900 dark:text-gray-100 capitalize">
                            {appPreferences.defaultSorting.replace(/([A-Z])/g, " $1").trim()}
                        </p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Default Grouping
                    </label>
                    {isEditing ? (
                        <select
                            value={editValues.defaultGrouping || appPreferences.defaultGrouping}
                            onChange={(e) => setEditValues({ ...editValues, defaultGrouping: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                        >
                            <option value="none">None</option>
                            <option value="status">By Status</option>
                            <option value="priority">By Priority</option>
                            <option value="category">By Category</option>
                            <option value="date">By Date</option>
                        </select>
                    ) : (
                        <p className="text-gray-900 dark:text-gray-100 capitalize">
                            {appPreferences.defaultGrouping === "none" ? "None" : 
                             `By ${appPreferences.defaultGrouping.charAt(0).toUpperCase() + appPreferences.defaultGrouping.slice(1)}`}
                        </p>
                    )}
                </div>

                {isEditing && (
                    <div className="flex gap-2 pt-2">
                        <button
                            onClick={handleSave}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Save size={16} />
                            Save
                        </button>
                        <button
                            onClick={handleCancel}
                            className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                            <X size={16} />
                            Cancel
                        </button>
                    </div>
                )}

                {!isEditing && (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                        <Pencil size={16} />
                        Edit Preferences
                    </button>
                )}
            </div>
        );
    };

    const renderContent = () => {
        switch (type) {
            case "theme":
                return renderThemeToggle();
            case "profile":
                return renderProfile();
            case "project_defaults":
                return renderProjectDefaults();
            case "security":
                return renderSecurity();
            case "app_preferences":
                return renderAppPreferences();
            default:
                return null;
        }
    };

    return (
        <div className="p-5 rounded-lg border border-gray-400 dark:border-gray-700 shadow-md bg-gray-200 dark:bg-gray-900">
            {renderContent()}
        </div>
    );
}
