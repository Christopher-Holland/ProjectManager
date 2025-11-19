"use client";

import { useState } from "react";
import ToggleSegment from "../components/ToggleSegment";
import Navbar from "../components/navbar";
import PageContent from "../components/page-content";

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
                    {view === "tasks" && <div>Tasks content</div>}
                    {view === "goals" && <div>Goals content</div>}
                    {view === "timeline" && <div>Timeline content</div>}
                </div>
                <div class="grid grid-cols-3 gap-4">
                    <div class="bg-blue-200 p-4">Column 1</div>
                    <div class="bg-green-200 p-4">Column 2</div>
                    <div class="bg-red-200 p-4">Column 3</div>
                    <div class="bg-yellow-200 p-4">Column 4</div>
                    <div class="bg-purple-200 p-4">Column 5</div>
                    <div class="bg-orange-200 p-4">Column 6</div>
                </div>
            </PageContent>
        </>
    )
}
