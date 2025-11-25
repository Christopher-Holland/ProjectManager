"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import ToggleSegment from "@/app/components/ui/ToggleSegment";
import Navbar from "@/app/components/layout/navbar";
import PageContent from "@/app/components/layout/page-content";
import ProjectsList from "@/app/components/features/projects/projects-list";
import AddModal from "@/app/components/modals/add-modal";
import { useToast } from "@/app/components/ui/toast";

export default function Dashboard() {
    const { showToast } = useToast();
    const [view, setView] = useState("projects");
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

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

    return (
        <>
            <Navbar />
            <PageContent className="p-6 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 p-4 text-3xl">Dashboard</h1>
                    <div className="flex items-center justify-between w-full mb-6">
                        <ToggleSegment onChange={setView} />

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
                            aria-label="Add project"
                        >
                            <Plus size={18} />
                            Add Project
                        </button>
                    </div>
                </div>



                <div className="mt-8">
                    {view === "projects" && (
                        <div>
                            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Projects</h2>
                            <ProjectsList key={refreshKey} />
                        </div>
                    )}
                    {view === "goals" && <div className="text-gray-900 dark:text-gray-100">Goals content</div>}
                    {view === "timeline" && <div className="text-gray-900 dark:text-gray-100">Timeline content</div>}
                    {view === "notes" && <div className="text-gray-900 dark:text-gray-100">Notes content</div>}
                </div>

                <AddModal
                    isOpen={isAddModalOpen}
                    onClose={() => setIsAddModalOpen(false)}
                    onSave={handleAddProject}
                />
            </PageContent>
        </>
    )
}
