import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { stackServerApp } from "@/stack/server";
import { ErrorResponses, handleError } from "@/lib/error-handler";

export async function GET(request: NextRequest) {
  try {
    // Get user from Stack Auth using cookies
    const cookieStore = await cookies();
    const user = await stackServerApp.getUser(cookieStore);
    
    if (!user) {
      return ErrorResponses.unauthorized();
    }

    // Get only projects for the logged-in user
    const allProjects = await prisma.project.findMany({
      where: {
        userID: user.id,
      },
      select: {
        id: true,
        title: true,
        userID: true,
        status: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Create project map for all projects (including status)
    const projectMap = new Map(allProjects.map((p) => [p.id, { title: p.title, status: p.status }]));
    const allProjectIds = allProjects.map((p) => p.id);

    // If no projects, return empty array
    if (allProjectIds.length === 0) {
      return NextResponse.json([]);
    }

    // Fetch ALL tasks from ALL projects (matching projects endpoint behavior)
    const tasks = await prisma.task.findMany({
      where: {
        projectID: {
          in: allProjectIds,
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });


    // Get all task IDs to fetch subtasks
    const taskIds = tasks.map((t) => t.id);

    // Fetch all subtasks separately
    const allSubtasks = taskIds.length > 0 ? await prisma.subTask.findMany({
      where: {
        taskID: {
          in: taskIds,
        },
      },
      select: {
        id: true,
        title: true,
        description: true,
        completed: true,
        dueDate: true,
        taskID: true,
      },
    }) : [];

    // Group subtasks by taskID
    const subtasksByTaskId = allSubtasks.reduce((acc, sub) => {
      if (!acc[sub.taskID!]) {
        acc[sub.taskID!] = [];
      }
      acc[sub.taskID!].push(sub);
      return acc;
    }, {} as Record<string, typeof allSubtasks>);

    // Transform to match Task type format
    const formattedTasks = tasks.map((task) => {
      const projectInfo = projectMap.get(task.projectID) || { title: "Unknown Project", status: "active" };
      return {
        id: task.id,
        title: task.title,
        description: task.description,
        completed: task.completed,
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate,
        projectID: task.projectID,
        projectTitle: projectInfo.title,
        projectStatus: projectInfo.status,
      subtasks: (subtasksByTaskId[task.id] || []).map((sub) => ({
        id: sub.id,
        title: sub.title,
        description: sub.description,
        completed: sub.completed,
        dueDate: sub.dueDate,
      })),
      };
    });

    return NextResponse.json(formattedTasks);
  } catch (error) {
    return handleError(error, "Failed to fetch tasks");
  }
}

