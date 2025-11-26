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
    const { status, title, description, priority, dueDate, release } = body;

    const updateData: { 
      status?: string; 
      title?: string; 
      description?: string | null;
      priority?: number;
      dueDate?: Date | null;
    } = {};
    
    if (status !== undefined) updateData.status = status;
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description || null;
    if (priority !== undefined) updateData.priority = priority;
    
    const wasDueDateUpdated = dueDate !== undefined;
    if (wasDueDateUpdated) {
      updateData.dueDate = dueDate ? new Date(dueDate) : null;
    }
    // Note: release field is not in the database schema, so it's not updated here

    const updatedProject = await prisma.project.update({
      where: { id },
      data: updateData,
    });

    // If due date was set or updated, generate timeline for all tasks
    if (wasDueDateUpdated && updatedProject.dueDate) {
      try {
        // Fetch all tasks and their subtasks for this project
        const tasks = await prisma.task.findMany({
          where: { projectID: id },
          orderBy: { createdAt: "asc" },
          include: {
            subTasks: {
              orderBy: { createdAt: "asc" },
            },
          },
        });

        if (tasks.length > 0) {
          // Format tasks for the timeline generator
          const formattedTasks = tasks.map((task) => ({
            id: task.id,
            title: task.title,
            subtasks: task.subTasks.map((sub) => ({
              id: sub.id,
              title: sub.title,
            })),
          }));

          // Generate the weighted schedule
          const schedule = generateWeightedSchedule(
            formattedTasks,
            updatedProject.dueDate.toISOString()
          );

          // Update tasks and subtasks with their assigned due dates
          const updatePromises: Promise<any>[] = [];
          
          schedule.forEach((item) => {
            if (item.type === "task") {
              const task = tasks[item.taskIndex];
              if (task) {
                updatePromises.push(
                  prisma.task.update({
                    where: { id: task.id },
                    data: { dueDate: item.date },
                  })
                );
              }
            } else if (item.type === "subtask" && item.subIndex !== undefined) {
              const task = tasks[item.taskIndex];
              const subtask = task?.subTasks[item.subIndex];
              if (subtask) {
                updatePromises.push(
                  prisma.subTask.update({
                    where: { id: subtask.id },
                    data: { dueDate: item.date },
                  })
                );
              }
            }
          });

          await Promise.all(updatePromises);
          console.log(`Generated timeline for ${updatePromises.length} items (tasks and subtasks)`);
        }
      } catch (timelineError) {
        // Log error but don't fail the project update
        console.error("Error generating timeline:", timelineError);
      }
    }

    return NextResponse.json(updatedProject);
  } catch (error) {
    console.error("Error updating project:", error);
    return NextResponse.json(
      { error: "Failed to update project" },
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

    await prisma.project.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting project:", error);
    return NextResponse.json(
      { error: "Failed to delete project" },
      { status: 500 }
    );
  }
}

