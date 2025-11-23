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

