import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateWeightedSchedule } from "@/app/components/features/timeline/timeline-generator";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { completed, title, description } = body;

    const updateData: {
      completed?: boolean;
      title?: string;
      description?: string | null;
    } = {};

    if (completed !== undefined) updateData.completed = completed;
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description || null;

    const updatedSubtask = await prisma.subTask.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updatedSubtask);
  } catch (error) {
    console.error("Error updating subtask:", error);
    return NextResponse.json(
      { error: "Failed to update subtask" },
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

    // Get subtask info before deletion to get projectID
    const subtask = await prisma.subTask.findUnique({
      where: { id },
      select: { projectID: true },
    });

    await prisma.subTask.delete({
      where: { id },
    });

    // Regenerate timeline since subtask count changed
    if (subtask?.projectID) {
      try {
        const project = await prisma.project.findUnique({
          where: { id: subtask.projectID },
          select: { dueDate: true },
        });

        if (project?.dueDate) {
          // Fetch all tasks and their subtasks for this project
          const allTasks = await prisma.task.findMany({
            where: { projectID: subtask.projectID },
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
            console.log(`Regenerated timeline after subtask deletion`);
          }
        }
      } catch (timelineError) {
        // Log error but don't fail the subtask deletion
        console.error("Error generating timeline:", timelineError);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting subtask:", error);
    return NextResponse.json(
      { error: "Failed to delete subtask" },
      { status: 500 }
    );
  }
}

