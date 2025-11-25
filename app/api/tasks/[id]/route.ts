import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log(`PATCH /api/tasks/${id} - Received request`);
    const body = await request.json();
    console.log(`PATCH /api/tasks/${id} - Request body:`, body);
    const { completed, title, description } = body;

    const updateData: { 
      completed?: boolean;
      title?: string;
      description?: string | null;
    } = {};

    if (completed !== undefined) updateData.completed = completed;
    if (title !== undefined && title !== null) {
      if (typeof title === 'string' && title.trim() === '') {
        return NextResponse.json(
          { error: "Title cannot be empty" },
          { status: 400 }
        );
      }
      updateData.title = title;
    }
    if (description !== undefined) updateData.description = description || null;

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

      // Fetch subtasks separately
      const subtasks = await prisma.subTask.findMany({
        where: { taskID: id },
        select: {
          id: true,
          title: true,
          description: true,
          completed: true,
        },
      });

      return NextResponse.json({
        id: existingTask.id,
        title: existingTask.title,
        description: existingTask.description,
        completed: existingTask.completed,
        subtasks: subtasks.map((sub) => ({
          id: sub.id,
          title: sub.title,
          description: sub.description,
          completed: sub.completed,
        })),
      });
    }

    console.log(`PATCH /api/tasks/${id} - Updating with data:`, updateData);
    
    // Update task without include to avoid transaction issues
    const updatedTask = await prisma.task.update({
      where: { id },
      data: updateData,
    });

    console.log(`PATCH /api/tasks/${id} - Task updated successfully`);

    // Fetch subtasks separately to avoid transaction issues
    const subtasks = await prisma.subTask.findMany({
      where: { taskID: id },
      select: {
        id: true,
        title: true,
        description: true,
        completed: true,
      },
    });

    // Transform to match TaskModal format
    const formattedTask = {
      id: updatedTask.id,
      title: updatedTask.title,
      description: updatedTask.description,
      completed: updatedTask.completed,
      subtasks: subtasks.map((sub) => ({
        id: sub.id,
        title: sub.title,
        description: sub.description,
        completed: sub.completed,
      })),
    };

    console.log(`PATCH /api/tasks/${id} - Returning formatted task:`, formattedTask);
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
    const { id } = await params;
    console.log(`DELETE /api/tasks/${id} - Deleting task`);

    // Delete the task (subtasks will be deleted automatically due to cascade)
    await prisma.task.delete({
      where: { id },
    });

    console.log(`DELETE /api/tasks/${id} - Task deleted successfully`);
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

