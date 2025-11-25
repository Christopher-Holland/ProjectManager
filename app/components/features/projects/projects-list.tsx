"use client";

import { useEffect, useState, useRef } from "react";
import type { Project } from "@/app/types";
import Card from "./card";

interface ProjectsListProps {
  highlightedProjectId?: string | null;
  onHighlightCleared?: () => void;
  onTasksUpdated?: () => void;
}

export default function ProjectsList({ highlightedProjectId, onHighlightCleared, onTasksUpdated }: ProjectsListProps = {}) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const highlightedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchProjects() {
      try {
        const response = await fetch("/api/projects");
        if (response.ok) {
          const data = await response.json();
          setProjects(data);
        }
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchProjects();
  }, []);

  // Scroll to highlighted project when it changes
  useEffect(() => {
    if (highlightedProjectId && highlightedRef.current) {
      highlightedRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
      // Clear highlight after scrolling
      setTimeout(() => {
        onHighlightCleared?.();
      }, 2000);
    }
  }, [highlightedProjectId, onHighlightCleared]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setProjects((prev) =>
          prev.map((p) => (p.id === id ? { ...p, status: newStatus } : p))
        );
      }
    } catch (error) {
      console.error("Error updating project status:", error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setProjects((prev) => prev.filter((p) => p.id !== id));
      }
    } catch (error) {
      console.error("Error deleting project:", error);
    }
  };

  const handleEdit = (id: string) => {
    // Edit is handled by the Card component itself
    // This is called when edit button is clicked but the modal state is managed in Card
  };

  const handleUpdate = async (id: string, data: { 
    title: string; 
    description: string;
    dueDate?: string;
    priority: number;
    status: string;
    release?: string;
  }) => {
    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const updatedProject = await response.json();
        setProjects((prev) =>
          prev.map((p) => (p.id === id ? { 
            ...p, 
            title: updatedProject.title, 
            description: updatedProject.description,
            dueDate: updatedProject.dueDate ? new Date(updatedProject.dueDate) : null,
            priority: updatedProject.priority,
            status: updatedProject.status,
          } : p))
        );
      }
    } catch (error) {
      console.error("Error updating project:", error);
    }
  };

  if (loading) {
    return <div className="text-gray-600 dark:text-gray-400">Loading projects...</div>;
  }

  // Group projects by status
  const toDoProjects = projects.filter((p) => p.status === "active");
  const inProgressProjects = projects.filter((p) => p.status === "in_progress");
  const completedProjects = projects.filter((p) => p.status === "completed");

  const renderColumn = (title: string, projectList: Project[]) => (
    <div className="flex flex-col">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
        {title}
      </h3>
      <div className="flex flex-col gap-4">
        {projectList.length === 0 ? (
          <div className="text-sm text-gray-500 dark:text-gray-400 italic">
            No projects
          </div>
        ) : (
          projectList.map((project) => (
            <div
              key={project.id}
              ref={project.id === highlightedProjectId ? highlightedRef : null}
              className={project.id === highlightedProjectId ? "ring-2 ring-blue-500 rounded-lg transition-all duration-1000" : ""}
            >
            <Card
                id={project.id}
                title={project.title}
                description={project.description}
                dueDate={project.dueDate}
                priority={project.priority}
                status={project.status}
                onStatusChange={handleStatusChange}
                onDelete={handleDelete}
                onEdit={handleEdit}
                onUpdate={handleUpdate}
                onTasksUpdated={onTasksUpdated}
            />
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {renderColumn("To Do", toDoProjects)}
      {renderColumn("In Progress", inProgressProjects)}
      {renderColumn("Completed", completedProjects)}
    </div>
  );
}

