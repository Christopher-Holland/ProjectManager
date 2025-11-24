import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { completed, title, description } = body;

    const updateData: {
      completed?: boolean;
      title?: string;
      description?: string | null;
    } = {};

    if (completed !== undefined) updateData.completed = completed;
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description || null;

    const updatedSubtask = await prisma.subTask.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updatedSubtask);
  } catch (error) {
    console.error("Error updating subtask:", error);
    return NextResponse.json(
      { error: "Failed to update subtask" },
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

    await prisma.subTask.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting subtask:", error);
    return NextResponse.json(
      { error: "Failed to delete subtask" },
      { status: 500 }
    );
  }
}

