import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { stackServerApp } from "@/stack/server";

export async function GET() {
  try {
    // Note: For now, returning all notes like the projects API does
    // In production, you may want to filter by userID
    const notes = await prisma.note.findMany({
      orderBy: {
        updatedAt: "desc",
      },
    });

    // Sort pinned notes to the top manually
    const sortedNotes = notes.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return 0;
    });

    return NextResponse.json(sortedNotes);
  } catch (error) {
    console.error("Error fetching notes:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error("Error details:", errorMessage);
    console.error("Error stack:", errorStack);
    return NextResponse.json(
      { error: "Failed to fetch notes", details: errorMessage },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get user from Stack Auth using cookies
    const cookieStore = await cookies();
    const user = await stackServerApp.getUser(cookieStore);
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized - Please sign in" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, content, tags, pinned } = body;

    if (!title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

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
    console.error("Error creating note:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Failed to create note", details: errorMessage },
      { status: 500 }
    );
  }
}

