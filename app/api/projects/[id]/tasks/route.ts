import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const tasks = await prisma.task.findMany({
      where: { projectID: id },
      include: {
        subTasks: {
          select: {
            id: true,
            title: true,
            completed: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    // Transform to match TaskModal format
    const formattedTasks = tasks.map((task) => ({
      id: task.id,
      title: task.title,
      description: task.description,
      completed: task.completed,
      subtasks: task.subTasks.map((sub) => ({
        id: sub.id,
        title: sub.title,
        completed: sub.completed,
      })),
    }));

    return NextResponse.json(formattedTasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, description } = body;

    if (!title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    const newTask = await prisma.task.create({
      data: {
        title,
        description: description || null,
        projectID: id,
        status: "pending",
        priority: 1,
        completed: false,
      },
      include: {
        subTasks: {
          select: {
            id: true,
            title: true,
            completed: true,
          },
        },
      },
    });

    // Transform to match TaskModal format
    const formattedTask = {
      id: newTask.id,
      title: newTask.title,
      description: newTask.description,
      completed: newTask.completed,
      subtasks: newTask.subTasks.map((sub) => ({
        id: sub.id,
        title: sub.title,
        completed: sub.completed,
      })),
    };

    return NextResponse.json(formattedTask, { status: 201 });
  } catch (error) {
    console.error("Error creating task:", error);
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    );
  }
}

