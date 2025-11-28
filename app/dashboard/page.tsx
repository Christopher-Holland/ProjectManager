"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import ToggleSegment from "@/app/components/ui/ToggleSegment";
import Navbar from "@/app/components/layout/navbar";
import PageContent from "@/app/components/layout/page-content";
import ProjectsList from "@/app/components/features/goals/projects-list";
import AddModal from "@/app/components/modals/add-modal";
import { useToast } from "@/app/components/ui/toast";
import TasksList from "../components/features/tasks/tasks-list";
import TimelineList from "../components/features/timeline/timeline-list";
import NotesList from "../components/features/notes/notes-list";
import AddNoteModal from "../components/modals/addNote-modal";
import SettingsList from "../components/features/settings/settings-list";
import AddSettingModal from "../components/modals/add-setting-modal";

export default function Dashboard() {
    const { showToast } = useToast();
    const [view, setView] = useState("goals");
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isAddNoteModalOpen, setIsAddNoteModalOpen] = useState(false);
    const [isAddSettingModalOpen, setIsAddSettingModalOpen] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);
    const [highlightedProjectId, setHighlightedProjectId] = useState<string | null>(null);
    const [tasksRefreshKey, setTasksRefreshKey] = useState(0);

    const handleAddProject = async (data: {
        title: string;
        description: string;
        dueDate?: string;
        priority: number;
        status: string;
        release?: string;
    }) => {
        try {
            const response = await fetch("/api/projects", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                setIsAddModalOpen(false);
                // Trigger refresh of ProjectsList
                setRefreshKey((prev) => prev + 1);
                showToast("Project created successfully", "success");
            } else {
                const errorData = await response.json();
                console.error("Failed to create project:", errorData);
                showToast(`Failed to create project: ${errorData.error || "Unknown error"}`, "error");
            }
        } catch (error) {
            console.error("Error creating project:", error);
            showToast(`Error creating project: ${error instanceof Error ? error.message : "Unknown error"}`, "error");
        }
    };

    const handleAddNote = async (data: {
        title: string;
        content?: string;
        tags?: string;
        pinned?: boolean;
        projectID?: string;
    }) => {
        try {
            const response = await fetch("/api/notes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                setIsAddNoteModalOpen(false);
                // Trigger refresh of NotesList
                setRefreshKey((prev) => prev + 1);
                showToast("Note created successfully", "success");
            } else {
                const errorData = await response.json();
                console.error("Failed to create note:", errorData);
                showToast(`Failed to create note: ${errorData.error || "Unknown error"}`, "error");
            }
        } catch (error) {
            console.error("Error creating note:", error);
            showToast(`Error creating note: ${error instanceof Error ? error.message : "Unknown error"}`, "error");
        }
    };

    const handleAddSetting = async (data: {
        key: string;
        value: string;
        category?: string;
        description?: string;
    }) => {
        try {
            const response = await fetch("/api/settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                setIsAddSettingModalOpen(false);
                // Trigger refresh of SettingsList
                setRefreshKey((prev) => prev + 1);
                showToast("Setting created successfully", "success");
            } else {
                const errorData = await response.json();
                console.error("Failed to create setting:", errorData);
                showToast(`Failed to create setting: ${errorData.error || "Unknown error"}`, "error");
            }
        } catch (error) {
            console.error("Error creating setting:", error);
            showToast(`Error creating setting: ${error instanceof Error ? error.message : "Unknown error"}`, "error");
        }
    };

    return (
        <>
            <Navbar />
            <PageContent className="p-6 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 p-4 text-3xl">Dashboard</h1>
                    <div className="flex items-center justify-between w-full mb-6">
                        <ToggleSegment value={view} onChange={setView} />

                        {view === "goals" && (
                            <button
                                onClick={() => setIsAddModalOpen(true)}
                                className="
                                flex items-center gap-2
                                bg-gray-900 text-white
                                hover:bg-gray-700
                                dark:bg-blue-700 dark:hover:bg-blue-500
                                px-4 py-2 rounded-xl
                                shadow-sm transition-colors
                            "
                                aria-label="Add goal"
                            >
                                <Plus size={18} />
                                Add Goal
                            </button>
                        )}
                        {view === "notes" && (
                            <button
                                onClick={() => setIsAddNoteModalOpen(true)}
                                className="
                                flex items-center gap-2
                                bg-gray-900 text-white
                                hover:bg-gray-700
                                dark:bg-blue-700 dark:hover:bg-blue-500
                                px-4 py-2 rounded-xl
                                shadow-sm transition-colors"
                                aria-label="Add note"
                            >
                                <Plus size={18} />
                                Add Note
                            </button>
                        )}
                    </div>
                </div>



                <div className="mt-8">
                    {view === "goals" && (
                        <div>
                            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Goals</h2>
                            <ProjectsList 
                                key={refreshKey} 
                                highlightedProjectId={highlightedProjectId}
                                onHighlightCleared={() => setHighlightedProjectId(null)}
                                onTasksUpdated={() => setTasksRefreshKey(prev => prev + 1)}
                            />
                        </div>
                    )}
                    {view === "tasks" && (
                        <div>
                            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Tasks</h2>
                            <TasksList 
                                key={tasksRefreshKey} 
                                onNavigateToProject={(projectId) => {
                                    setHighlightedProjectId(projectId);
                                    setView("goals");
                                }}
                                refreshTrigger={tasksRefreshKey}
                            />
                        </div>
                    )}
                    {view === "timeline" && (
                        <div>
                            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Timeline</h2>
                            <TimelineList />
                        </div>
                    )}
                    {view === "notes" && (
                        <div>
                            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Notes</h2>
                            <NotesList key={refreshKey} />
                        </div>
                    )}
                    {view === "settings" && (
                        <div>
                            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Settings</h2>
                            <SettingsList refreshKey={refreshKey} />
                        </div>
                    )}
                </div>

                <AddModal
                    isOpen={isAddModalOpen}
                    onClose={() => setIsAddModalOpen(false)}
                    onSave={handleAddProject}
                />
                <AddNoteModal
                    isOpen={isAddNoteModalOpen}
                    onClose={() => setIsAddNoteModalOpen(false)}
                    onSave={handleAddNote}
                />
                <AddSettingModal
                    isOpen={isAddSettingModalOpen}
                    onClose={() => setIsAddSettingModalOpen(false)}
                    onSave={handleAddSetting}
                />
            </PageContent>
        </>
    )
}
