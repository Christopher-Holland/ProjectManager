"use client";

import { useEffect, useState } from "react";
import TimelineCard from "./card";
import { useToast } from "@/app/components/ui/toast";
import type { Task } from "@/app/types";

interface TimelineItem {
    id: string;
    title: string;
    dueDate: Date | string;
    type: "task" | "subtask" | "project";
    priority?: number;
    status?: string;
    projectTitle?: string;
    completed?: boolean;
}

export default function TimelineList() {
    const { showToast } = useToast();
    const [items, setItems] = useState<TimelineItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchTimelineData() {
            try {
                // Fetch all projects
                const projectsResponse = await fetch("/api/projects");
                if (!projectsResponse.ok) {
                    throw new Error("Failed to fetch projects");
                }
                const projects = await projectsResponse.json();

                // Fetch all tasks
                const tasksResponse = await fetch("/api/tasks");
                if (!tasksResponse.ok) {
                    const errorText = await tasksResponse.text();
                    console.error("Failed to fetch tasks - Response:", tasksResponse.status, errorText);
                    throw new Error(`Failed to fetch tasks: ${tasksResponse.status} ${errorText}`);
                }
                const tasks = await tasksResponse.json();
                console.log("Fetched tasks:", tasks.length);

                // Build timeline items array
                const timelineItems: TimelineItem[] = [];

                // Helper function to check if item is overdue
                const isOverdue = (dueDate: Date | string) => {
                    const now = new Date();
                    const end = new Date(dueDate);
                    return end < now;
                };

                // Add projects with due dates (exclude completed and overdue)
                projects.forEach((project: any) => {
                    if (project.dueDate) {
                        const projectCompleted = project.status === "completed";
                        const projectOverdue = isOverdue(project.dueDate);
                        
                        // Skip if completed AND overdue
                        if (!(projectCompleted && projectOverdue)) {
                            timelineItems.push({
                                id: project.id,
                                title: project.title,
                                dueDate: project.dueDate,
                                type: "project",
                                priority: project.priority,
                                status: project.status,
                                completed: projectCompleted,
                            });
                        }
                    }
                });

                // Add tasks with due dates (exclude completed and overdue)
                tasks.forEach((task: Task & { projectTitle?: string; projectID?: string; subtasks?: Array<{ id: string; title: string; dueDate?: Date | string; completed: boolean }> }) => {
                    if (task.dueDate) {
                        const taskCompleted = task.completed || task.status === "completed";
                        const taskOverdue = isOverdue(task.dueDate);
                        
                        // Skip if completed AND overdue
                        if (!(taskCompleted && taskOverdue)) {
                            timelineItems.push({
                                id: task.id,
                                title: task.title,
                                dueDate: task.dueDate,
                                type: "task",
                                priority: task.priority,
                                status: task.status || (task.completed ? "completed" : "pending"),
                                projectTitle: task.projectTitle,
                                completed: task.completed,
                            });
                        }
                    }

                    // Add subtasks with due dates (exclude completed and overdue)
                    if (task.subtasks && Array.isArray(task.subtasks)) {
                        task.subtasks.forEach((subtask) => {
                            if (subtask.dueDate) {
                                const subtaskCompleted = subtask.completed;
                                const subtaskOverdue = isOverdue(subtask.dueDate);
                                
                                // Skip if completed AND overdue
                                if (!(subtaskCompleted && subtaskOverdue)) {
                                    timelineItems.push({
                                        id: subtask.id,
                                        title: subtask.title,
                                        dueDate: subtask.dueDate,
                                        type: "subtask",
                                        status: subtask.completed ? "completed" : "pending",
                                        projectTitle: task.projectTitle,
                                        completed: subtask.completed,
                                    });
                                }
                            }
                        });
                    }
                });

                // Sort by due date (earliest first)
                timelineItems.sort((a, b) => {
                    const dateA = new Date(a.dueDate).getTime();
                    const dateB = new Date(b.dueDate).getTime();
                    return dateA - dateB;
                });

                setItems(timelineItems);
            } catch (error) {
                console.error("Error fetching timeline data:", error);
                showToast("Failed to load timeline data", "error");
            } finally {
                setLoading(false);
            }
        }

        fetchTimelineData();
    }, [showToast]);

    if (loading) {
        return <div className="text-gray-600 dark:text-gray-400">Loading timeline...</div>;
    }

    if (items.length === 0) {
        return (
            <div className="text-gray-600 dark:text-gray-400">
                No timeline items found. Add due dates to projects and tasks to see them here.
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            {items.map((item) => (
                <TimelineCard
                    key={item.id}
                    title={item.title}
                    dueDate={item.dueDate}
                    type={item.type}
                    priority={item.priority}
                    status={item.status}
                    projectTitle={item.projectTitle}
                    completed={item.completed}
                />
            ))}
        </div>
    );
}

