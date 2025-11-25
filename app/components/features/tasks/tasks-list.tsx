"use client";

import { useEffect, useState } from "react";
import type { Task } from "@/app/types";
import Card from "./card";
import { useToast } from "@/app/components/ui/toast";

interface TasksListProps {
  onNavigateToProject?: (projectId: string) => void;
  refreshTrigger?: number;
}

export default function TasksList({ onNavigateToProject, refreshTrigger }: TasksListProps = {}) {
  const { showToast } = useToast();
  const [tasks, setTasks] = useState<(Task & { projectID: string; projectTitle: string; projectStatus: string })[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    try {
      console.log("Fetching tasks from /api/tasks...");
      const response = await fetch("/api/tasks");
      if (response.ok) {
        const data = await response.json();
        console.log(`Received ${data.length} tasks from API`);
        console.log("Tasks data:", data);
        
        // Log unique project IDs
        const uniqueProjectIds = [...new Set(data.map((t: any) => t.projectID))];
        console.log(`Tasks from ${uniqueProjectIds.length} unique projects:`, uniqueProjectIds);
        
        setTasks(data);
      } else {
        const errorText = await response.text();
        console.error("Failed to load tasks - response:", response.status, errorText);
        showToast("Failed to load tasks", "error");
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
      showToast("Error loading tasks", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [showToast, refreshTrigger]);

  const handleTaskToggle = async (id: string, completed: boolean) => {
    try {
      const newStatus = completed ? "completed" : "pending";
      const response = await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed, status: newStatus }),
      });

      if (response.ok) {
        // Refresh tasks to get latest data including project status
        await fetchTasks();
        showToast(`Task marked ${completed ? "complete" : "incomplete"}`, "success");
      } else {
        showToast("Failed to update task", "error");
      }
    } catch (error) {
      console.error("Error updating task:", error);
      showToast("Error updating task", "error");
    }
  };

  const handleSubtaskToggle = async (taskId: string, subtaskId: string, completed: boolean) => {
    try {
      const response = await fetch(`/api/subtasks/${subtaskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed }),
      });

      if (response.ok) {
        // Refresh tasks to get latest data
        await fetchTasks();
        showToast(`Subtask marked ${completed ? "complete" : "incomplete"}`, "success");
      } else {
        showToast("Failed to update subtask", "error");
      }
    } catch (error) {
      console.error("Error updating subtask:", error);
      showToast("Error updating subtask", "error");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setTasks((prev) => prev.filter((t) => t.id !== id));
        showToast("Task deleted successfully", "success");
      } else {
        showToast("Failed to delete task", "error");
      }
    } catch (error) {
      console.error("Error deleting task:", error);
      showToast("Error deleting task", "error");
    }
  };

  const handleEdit = (id: string) => {
    // Edit is handled by the Card component itself
  };

  const handleUpdate = async (id: string, data: { 
    title: string; 
    description: string;
    dueDate?: string;
    priority: number;
    status: string;
  }) => {
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        // Refresh the entire tasks list to get updated data including subtasks
        const refreshResponse = await fetch("/api/tasks");
        if (refreshResponse.ok) {
          const refreshedTasks = await refreshResponse.json();
          setTasks(refreshedTasks);
          showToast("Task updated successfully", "success");
        } else {
          // Fallback: update local state if refresh fails
          const updatedTask = await response.json();
          setTasks((prev) =>
            prev.map((t) => (t.id === id ? { 
              ...t, 
              title: updatedTask.title, 
              description: updatedTask.description,
              dueDate: updatedTask.dueDate ? new Date(updatedTask.dueDate) : null,
              priority: updatedTask.priority,
              status: updatedTask.status,
            } : t))
          );
          showToast("Task updated successfully", "success");
        }
      } else {
        showToast("Failed to update task", "error");
      }
    } catch (error) {
      console.error("Error updating task:", error);
      showToast("Error updating task", "error");
    }
  };

  if (loading) {
    return <div className="text-gray-600 dark:text-gray-400">Loading tasks...</div>;
  }

  // Group tasks by project status (active, in_progress, completed)
  const todoTasks = tasks.filter((t) => t.projectStatus === "active");
  const inProgressTasks = tasks.filter((t) => t.projectStatus === "in_progress");
  const completedTasks = tasks.filter((t) => t.projectStatus === "completed");

  const renderColumn = (title: string, taskList: typeof tasks) => (
    <div className="flex flex-col">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
        {title}
      </h3>
      <div className="flex flex-col gap-4">
        {taskList.length === 0 ? (
          <div className="text-sm text-gray-500 dark:text-gray-400 italic">
            No tasks
          </div>
        ) : (
          taskList.map((task) => (
            <Card
              key={task.id}
              id={task.id}
              title={task.title}
              description={task.description}
              dueDate={task.dueDate}
              priority={task.priority}
              status={task.status || (task.completed ? "completed" : "pending")}
              completed={task.completed}
              projectTitle={task.projectTitle}
              projectID={task.projectID}
              subtasks={task.subtasks}
              onTaskToggle={handleTaskToggle}
              onSubtaskToggle={handleSubtaskToggle}
              onDelete={handleDelete}
              onEdit={handleEdit}
              onUpdate={handleUpdate}
              onNavigateToProject={onNavigateToProject}
            />
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {renderColumn("To Do Projects", todoTasks)}
      {renderColumn("In Progress Projects", inProgressTasks)}
      {renderColumn("Completed Projects", completedTasks)}
    </div>
  );
}

