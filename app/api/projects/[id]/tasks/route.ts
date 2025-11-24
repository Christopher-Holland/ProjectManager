import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const tasks = await prisma.task.findMany({
      where: { projectID: id },
      orderBy: {
        createdAt: "asc",
      },
    });

    // Fetch subtasks separately for all tasks to avoid transaction issues
    const taskIds = tasks.map(t => t.id);
    const allSubtasks = taskIds.length > 0 ? await prisma.subTask.findMany({
      where: { taskID: { in: taskIds } },
      select: {
        id: true,
        title: true,
        description: true,
        completed: true,
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

    // Transform to match TaskModal format
    const formattedTasks = tasks.map((task) => ({
      id: task.id,
      title: task.title,
      description: task.description,
      completed: task.completed,
      subtasks: (subtasksByTaskId[task.id] || []).map((sub) => ({
        id: sub.id,
        title: sub.title,
        description: sub.description,
        completed: sub.completed,
      })),
    }));

    return NextResponse.json(formattedTasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, description } = body;

    if (!title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    console.log(`POST /api/projects/${id}/tasks - Creating task with title:`, title);
    
    // Create task without include to avoid transaction issues
    const newTask = await prisma.task.create({
      data: {
        title,
        description: description || null,
        projectID: id,
        status: "pending",
        priority: 1,
        completed: false,
      },
    });

    console.log(`POST /api/projects/${id}/tasks - Task created with ID:`, newTask.id);

    // Fetch subtasks separately (will be empty for new tasks, but keeps format consistent)
    const subtasks = await prisma.subTask.findMany({
      where: { taskID: newTask.id },
      select: {
        id: true,
        title: true,
        description: true,
        completed: true,
      },
    });

    // Transform to match TaskModal format
    const formattedTask = {
      id: newTask.id,
      title: newTask.title,
      description: newTask.description,
      completed: newTask.completed,
      subtasks: subtasks.map((sub) => ({
        id: sub.id,
        title: sub.title,
        description: sub.description,
        completed: sub.completed,
      })),
    };

    console.log(`POST /api/projects/${id}/tasks - Returning formatted task:`, formattedTask);
    return NextResponse.json(formattedTask, { status: 201 });
  } catch (error: any) {
    console.error("Error creating task:", error);
    
    // Handle Prisma foreign key constraint errors
    if (error?.code === 'P2003') {
      return NextResponse.json(
        { error: "Project not found", message: "The specified project does not exist" },
        { status: 404 }
      );
    }
    
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json(
      { error: "Failed to create task", message: errorMessage },
      { status: 500 }
    );
  }
}

