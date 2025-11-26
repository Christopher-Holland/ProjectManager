import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateWeightedSchedule } from "@/app/components/features/timeline/timeline-generator";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: taskId } = await params;
    const body = await request.json();
    const { title, description } = body;

    if (!title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    // Get the task to get the projectId if not provided
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      select: { projectID: true },
    });

    if (!task) {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      );
    }

    const newSubtask = await prisma.subTask.create({
      data: {
        title,
        description: description || null,
        taskID: taskId,
        projectID: task.projectID,
        completed: false,
      },
    });

    // Regenerate timeline since subtask count changed
    try {
      const project = await prisma.project.findUnique({
        where: { id: task.projectID },
        select: { dueDate: true },
      });

      if (project?.dueDate) {
        // Fetch all tasks and their subtasks for this project
        const allTasks = await prisma.task.findMany({
          where: { projectID: task.projectID },
          orderBy: { createdAt: "asc" },
          include: {
            subTasks: {
              orderBy: { createdAt: "asc" },
            },
          },
        });

        if (allTasks.length > 0) {
          // Format tasks for the timeline generator
          const formattedTasks = allTasks.map((t) => ({
            id: t.id,
            title: t.title,
            subtasks: t.subTasks.map((sub) => ({
              id: sub.id,
              title: sub.title,
            })),
          }));

          // Generate the weighted schedule
          const schedule = generateWeightedSchedule(
            formattedTasks,
            project.dueDate.toISOString()
          );

          // Update all tasks with their assigned due dates
          const updatePromises = schedule
            .filter((item) => item.type === "task")
            .map((item) => {
              const t = allTasks[item.taskIndex];
              if (t) {
                return prisma.task.update({
                  where: { id: t.id },
                  data: { dueDate: item.date },
                });
              }
              return null;
            })
            .filter((promise) => promise !== null);

          await Promise.all(updatePromises);
          console.log(`Regenerated timeline after subtask creation`);
        }
      }
    } catch (timelineError) {
      // Log error but don't fail the subtask creation
      console.error("Error generating timeline:", timelineError);
    }

    return NextResponse.json(newSubtask, { status: 201 });
  } catch (error) {
    console.error("Error creating subtask:", error);
    return NextResponse.json(
      { error: "Failed to create subtask" },
      { status: 500 }
    );
  }
}

