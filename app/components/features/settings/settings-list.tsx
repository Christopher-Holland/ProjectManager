"use client";

import React, { useEffect, useState } from "react";
import { useUser } from "@stackframe/stack";
import SettingsCard from "./card";
import { useTheme } from "@/app/components/ui/theme-provider";

interface Setting {
    id: string;
    key: string;
    value: string;
    category?: string | null;
    description?: string | null;
    updatedAt: Date | string;
}

interface SettingsListProps {
    refreshKey?: number;
}

export default function SettingsList({ refreshKey }: SettingsListProps = {}) {
    const user = useUser({ or: "redirect" });
    const { theme, setTheme } = useTheme();
    const [settings, setSettings] = useState<Setting[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchSettings() {
            try {
                const response = await fetch("/api/settings");
                if (response.ok) {
                    const data = await response.json();
                    setSettings(data);
                    
                    // Apply theme from database if it exists
                    const themeSetting = data.find((s: Setting) => s.key === "theme");
                    if (themeSetting && (themeSetting.value === "light" || themeSetting.value === "dark")) {
                        setTheme(themeSetting.value as "light" | "dark");
                    }
                } else if (response.status !== 401) {
                    // Only log non-auth errors
                    const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
                    console.error("Failed to fetch settings:", response.status, errorData);
                }
            } catch (error) {
                console.error("Error fetching settings:", error);
            } finally {
                setLoading(false);
            }
        }

        if (user) {
            fetchSettings();
        }
    }, [user, refreshKey, setTheme]);

    const getSettingValue = (key: string, defaultValue: string = ""): string => {
        const setting = settings.find(s => s.key === key);
        return setting?.value || defaultValue;
    };

    const updateSetting = async (key: string, value: string, category?: string, description?: string) => {
        try {
            const existing = settings.find(s => s.key === key);
            
            if (existing) {
                // Update existing setting
                const response = await fetch(`/api/settings/${existing.id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ key, value, category, description }),
                });

                if (response.ok) {
                    const updated = await response.json();
                    setSettings(prev => prev.map(s => s.id === existing.id ? updated : s));
                    // Re-fetch settings to ensure we have the latest from the database
                    const refreshResponse = await fetch("/api/settings");
                    if (refreshResponse.ok) {
                        const refreshed = await refreshResponse.json();
                        setSettings(refreshed);
                    }
                    return true;
                } else {
                    const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
                    console.error("Failed to update setting:", errorData);
                    return false;
                }
            } else {
                // Create new setting
                const response = await fetch("/api/settings", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ key, value, category, description }),
                });

                if (response.ok) {
                    const newSetting = await response.json();
                    setSettings(prev => [...prev, newSetting]);
                    // Re-fetch settings to ensure we have the latest from the database
                    const refreshResponse = await fetch("/api/settings");
                    if (refreshResponse.ok) {
                        const refreshed = await refreshResponse.json();
                        setSettings(refreshed);
                    }
                    return true;
                } else {
                    const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
                    console.error("Failed to create setting:", errorData);
                    return false;
                }
            }
        } catch (error) {
            console.error("Error updating setting:", error);
            return false;
        }
    };

    const handleThemeChange = (newTheme: string) => {
        if (newTheme === "light" || newTheme === "dark") {
            setTheme(newTheme as "light" | "dark");
            updateSetting("theme", newTheme, "appearance", "Application theme preference");
        }
    };

    // Profile Settings
    const profileSettings = React.useMemo(() => ({
        username: (user as any)?.displayName || (user as any)?.primaryEmail || "User",
        email: (user as any)?.primaryEmail || "Not set",
        userId: (user as any)?.id || "Unknown",
    }), [user]);

    // Project Defaults - use useMemo to ensure values update when settings change
    const projectDefaults = React.useMemo(() => ({
        defaultPriority: getSettingValue("default_priority", "1"),
        defaultStatus: getSettingValue("default_status", "todo"),
    }), [settings]);

    // App Preferences - use useMemo to ensure values update when settings change
    const appPreferences = React.useMemo(() => ({
        defaultStartPage: getSettingValue("default_start_page", "goals"),
        defaultSorting: getSettingValue("default_sorting", "updated"),
        defaultGrouping: getSettingValue("default_grouping", "none"),
    }), [settings]);

    if (loading) {
        return <div className="text-gray-600 dark:text-gray-400">Loading settings...</div>;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Appearance Settings */}
            <div className="flex flex-col">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Appearance</h3>
                <SettingsCard
                    id="theme"
                    keyName="theme"
                    value={getSettingValue("theme", theme)}
                    category="appearance"
                    description="Choose your preferred theme"
                    updatedAt={new Date()}
                    type="theme"
                    onUpdate={handleThemeChange}
                />
            </div>

            {/* Profile Settings */}
            <div className="flex flex-col">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Profile</h3>
                <SettingsCard
                    id="profile"
                    keyName="profile"
                    value={JSON.stringify(profileSettings)}
                    category="profile"
                    description="Your account information"
                    updatedAt={new Date()}
                    type="profile"
                    profileData={profileSettings}
                    onUpdate={async (key, value) => {
                        // Profile updates handled in SettingsCard component
                    }}
                />
            </div>

            {/* Project Defaults */}
            <div className="flex flex-col">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Project Defaults</h3>
                <SettingsCard
                    id="project_defaults"
                    keyName="project_defaults"
                    value={JSON.stringify(projectDefaults)}
                    category="projects"
                    description="Default settings for new projects"
                    updatedAt={new Date()}
                    type="project_defaults"
                    projectDefaults={projectDefaults}
                    onUpdate={async (key, value) => {
                        await updateSetting(key, value, "projects");
                    }}
                />
            </div>

            {/* Security Settings */}
            <div className="flex flex-col">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Security</h3>
                <SettingsCard
                    id="security"
                    keyName="security"
                    value=""
                    category="security"
                    description="Manage your account security"
                    updatedAt={new Date()}
                    type="security"
                    onUpdate={async (key, value) => {
                        // Security updates handled in SettingsCard component
                    }}
                />
            </div>

            {/* App Preferences */}
            <div className="flex flex-col md:col-span-2">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">App Preferences</h3>
                <SettingsCard
                    id="app_preferences"
                    keyName="app_preferences"
                    value={JSON.stringify(appPreferences)}
                    category="app"
                    description="Customize your app experience"
                    updatedAt={new Date()}
                    type="app_preferences"
                    appPreferences={appPreferences}
                    onUpdate={async (key, value) => {
                        await updateSetting(key, value, "app");
                    }}
                />
            </div>
        </div>
    );
}
