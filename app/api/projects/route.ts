import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stackServerApp } from "@/stack/server";
import { createProjectSchema, validateRequest } from "@/lib/validation";
import { ErrorResponses, handleError } from "@/lib/error-handler";

export async function GET(request: NextRequest) {
  try {
    // Get user from Stack Auth - automatically reads from Next.js cookies
    const user = await stackServerApp.getUser();
    
    if (!user) {
      return ErrorResponses.unauthorized();
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
    return handleError(error, "Failed to fetch projects");
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
    return handleError(error, "Failed to create project");
  }
}

