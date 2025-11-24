import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: taskId } = await params;
    const body = await request.json();
    const { title, description } = body;

    if (!title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    // Get the task to get the projectId if not provided
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      select: { projectID: true },
    });

    if (!task) {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      );
    }

    const newSubtask = await prisma.subTask.create({
      data: {
        title,
        description: description || null,
        taskID: taskId,
        projectID: task.projectID,
        completed: false,
      },
    });

    return NextResponse.json(newSubtask, { status: 201 });
  } catch (error) {
    console.error("Error creating subtask:", error);
    return NextResponse.json(
      { error: "Failed to create subtask" },
      { status: 500 }
    );
  }
}

