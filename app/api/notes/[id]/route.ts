import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { stackServerApp } from "@/stack/server";
import { updateNoteSchema, validateRequest, idParamSchema, validateParams } from "@/lib/validation";

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
    const validation = validateRequest(updateNoteSchema, body);
    if (!validation.success) {
      return validation.response;
    }
    
    const { title, content, tags, pinned } = validation.data;
    
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
    const paramsResult = await params;
    
    // Validate route parameters
    const paramValidation = validateParams(idParamSchema, paramsResult);
    if (!paramValidation.success) {
      return paramValidation.response;
    }
    const { id } = paramValidation.data;

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

