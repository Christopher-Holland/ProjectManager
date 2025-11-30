import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stackServerApp } from "@/stack/server";
import { createNoteSchema, validateRequest } from "@/lib/validation";
import { ErrorResponses, handleError } from "@/lib/error-handler";

export async function GET(request: NextRequest) {
  try {
    // Get user from Stack Auth - automatically reads from Next.js cookies
    const user = await stackServerApp.getUser();
    
    if (!user) {
      return ErrorResponses.unauthorized();
    }

    const notes = await prisma.note.findMany({
      where: {
        userID: user.id,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    // Sort pinned notes to the top manually
    const sortedNotes = notes.sort((a: typeof notes[0], b: typeof notes[0]) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return 0;
    });

    return NextResponse.json(sortedNotes);
  } catch (error) {
    return handleError(error, "Failed to fetch notes");
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get user from Stack Auth - automatically reads from Next.js cookies
    const user = await stackServerApp.getUser();
    
    if (!user) {
      return ErrorResponses.unauthorized();
    }

    const body = await request.json();
    
    // Validate request body
    const validation = validateRequest(createNoteSchema, body);
    if (!validation.success) {
      return validation.response;
    }
    
    const { title, content, tags, pinned } = validation.data;

    const newNote = await prisma.note.create({
      data: {
        title,
        content: content || null,
        tags: tags || null,
        pinned: pinned || false,
        userID: user.id,
      },
    });

    return NextResponse.json(newNote, { status: 201 });
  } catch (error) {
    return handleError(error, "Failed to create note");
  }
}

