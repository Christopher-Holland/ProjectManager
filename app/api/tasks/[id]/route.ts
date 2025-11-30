import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { updateTaskSchema, validateRequest, idParamSchema, validateParams } from "@/lib/validation";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const paramsResult = await params;
    
    // Validate route parameters
    const paramValidation = validateParams(idParamSchema, paramsResult);
    if (!paramValidation.success) {
      return paramValidation.response;
    }
    const { id } = paramValidation.data;
    
    const body = await request.json();
    
    // Validate request body
    const validation = validateRequest(updateTaskSchema, body);
    if (!validation.success) {
      return validation.response;
    }
    
    const { completed, title, description, status, priority } = validation.data;

    const updateData: { 
      completed?: boolean;
      title?: string;
      description?: string | null;
      status?: string;
      priority?: number;
    } = {};

    if (completed !== undefined) updateData.completed = completed;
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description || null;
    if (status !== undefined) updateData.status = status;
    if (priority !== undefined) updateData.priority = priority;

    // If no fields to update, return the existing task
    if (Object.keys(updateData).length === 0) {
      const existingTask = await prisma.task.findUnique({
        where: { id },
      });

      if (!existingTask) {
        return NextResponse.json(
          { error: "Task not found" },
          { status: 404 }
        );
      }

      // Fetch project and subtasks separately
      const [project, subtasks] = await Promise.all([
        prisma.project.findUnique({
          where: { id: existingTask.projectID },
          select: {
            id: true,
            title: true,
          },
        }),
        prisma.subTask.findMany({
          where: { taskID: id },
          select: {
            id: true,
            title: true,
            description: true,
            completed: true,
            dueDate: true,
          },
        }),
      ]);

      return NextResponse.json({
        id: existingTask.id,
        title: existingTask.title,
        description: existingTask.description,
        completed: existingTask.completed,
        status: existingTask.status,
        priority: existingTask.priority,
        dueDate: existingTask.dueDate,
        projectID: existingTask.projectID,
        projectTitle: project?.title || "",
        subtasks: subtasks.map((sub) => ({
          id: sub.id,
          title: sub.title,
          description: sub.description,
          completed: sub.completed,
          dueDate: sub.dueDate,
        })),
      });
    }

    // Update task without include to avoid transaction issues
    const updatedTask = await prisma.task.update({
      where: { id },
      data: updateData,
    });

    // Fetch project and subtasks separately to avoid transaction issues
    const [project, subtasks] = await Promise.all([
      prisma.project.findUnique({
        where: { id: updatedTask.projectID },
        select: {
          id: true,
          title: true,
        },
      }),
      prisma.subTask.findMany({
        where: { taskID: id },
        select: {
          id: true,
          title: true,
          description: true,
          completed: true,
          dueDate: true,
        },
      }),
    ]);

    // Transform to match TaskModal format
    const formattedTask = {
      id: updatedTask.id,
      title: updatedTask.title,
      description: updatedTask.description,
      completed: updatedTask.completed,
      status: updatedTask.status,
      priority: updatedTask.priority,
      dueDate: updatedTask.dueDate,
      projectID: updatedTask.projectID,
      projectTitle: project?.title || "",
      subtasks: subtasks.map((sub) => ({
        id: sub.id,
        title: sub.title,
        description: sub.description,
        completed: sub.completed,
        dueDate: sub.dueDate,
      })),
    };

    return NextResponse.json(formattedTask);
  } catch (error: any) {
    console.error("Error updating task:", error);
    
    // Handle Prisma not found error
    if (error?.code === 'P2025') {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      );
    }
    
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json(
      { error: "Failed to update task", message: errorMessage },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const paramsResult = await params;
    
    // Validate route parameters
    const paramValidation = validateParams(idParamSchema, paramsResult);
    if (!paramValidation.success) {
      return paramValidation.response;
    }
    const { id } = paramValidation.data;

    // Delete the task (subtasks will be deleted automatically due to cascade)
    await prisma.task.delete({
      where: { id },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error("Error deleting task:", error);
    
    // Handle Prisma not found error
    if (error?.code === 'P2025') {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      );
    }
    
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json(
      { error: "Failed to delete task", message: errorMessage },
      { status: 500 }
    );
  }
}

