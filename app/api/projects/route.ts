import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { stackServerApp } from "@/stack/server";
import { createProjectSchema, validateRequest } from "@/lib/validation";

export async function GET() {
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

    const projects = await prisma.project.findMany({
      where: {
        userID: user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(projects);
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
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
    
    // Validate request body
    const validation = validateRequest(createProjectSchema, body);
    if (!validation.success) {
      return validation.response;
    }
    
    const { title, description, dueDate, priority, status } = validation.data;

    const newProject = await prisma.project.create({
      data: {
        title,
        description: description || null,
        dueDate: dueDate ? new Date(dueDate) : null,
        priority: priority || 1,
        status: status || "active",
        userID: user.id,
      },
    });

    return NextResponse.json(newProject, { status: 201 });
  } catch (error) {
    console.error("Error creating project:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error("Error stack:", errorStack);
    return NextResponse.json(
      { error: "Failed to create project", details: errorMessage },
      { status: 500 }
    );
  }
}

