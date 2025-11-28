import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { stackServerApp } from "@/stack/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let updateData: {
    title?: string;
    content?: string | null;
    tags?: string | null;
    pinned?: boolean;
  } = {};

  try {
    const { id } = await params;
    const body = await request.json();
    const { title, content, tags, pinned } = body;

    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content || null;
    if (tags !== undefined) updateData.tags = tags || null;
    if (pinned !== undefined) updateData.pinned = pinned;

    // Note: For now, allowing edits to all notes (like projects API)
    // In production, you may want to add userID verification

    // Check if note exists first
    const existingNote = await prisma.note.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existingNote) {
      return NextResponse.json(
        { error: "Note not found" },
        { status: 404 }
      );
    }

    // Only update if there's data to update
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No data provided to update" },
        { status: 400 }
      );
    }

    const updatedNote = await prisma.note.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updatedNote);
  } catch (error) {
    console.error("Error updating note:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error("Error stack:", errorStack);
    console.error("Update data attempted:", updateData);
    return NextResponse.json(
      { error: "Failed to update note", details: errorMessage },
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

    // Note: For now, allowing deletes to all notes (like projects API)
    // In production, you may want to add userID verification

    await prisma.note.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting note:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Failed to delete note", details: errorMessage },
      { status: 500 }
    );
  }
}

