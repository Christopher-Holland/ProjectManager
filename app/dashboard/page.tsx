"use client";

import { useState } from "react";
import ToggleSegment from "../components/ToggleSegment";
import Navbar from "../components/navbar";
import PageContent from "../components/page-content";
import ProjectsList from "../components/projects-list";

export default function Dashboard() {
    const [view, setView] = useState("tasks");
    return (
        <>
            <Navbar />
            <PageContent className="p-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 p-4 text-3xl">Dashboard</h1>
                </div>
                <ToggleSegment onChange={setView} />


                <div className="mt-8">
                    {view === "tasks" && (
                        <div>
                            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Projects</h2>
                            <ProjectsList />
                        </div>
                    )}
                    {view === "goals" && <div className="text-gray-900 dark:text-gray-100">Goals content</div>}
                    {view === "timeline" && <div className="text-gray-900 dark:text-gray-100">Timeline content</div>}
                </div>
            </PageContent>
        </>
    )
}
