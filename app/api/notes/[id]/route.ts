import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { stackServerApp } from "@/stack/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, content, tags, pinned } = body;

    const updateData: {
      title?: string;
      content?: string | null;
      tags?: string | null;
      pinned?: boolean;
    } = {};

    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content || null;
    if (tags !== undefined) updateData.tags = tags || null;
    if (pinned !== undefined) updateData.pinned = pinned;

    // Note: For now, allowing edits to all notes (like projects API)
    // In production, you may want to add userID verification

    const updatedNote = await prisma.note.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updatedNote);
  } catch (error) {
    console.error("Error updating note:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
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

