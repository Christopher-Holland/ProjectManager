import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateWeightedSchedule } from "@/app/components/features/timeline/timeline-generator";
import { updateSubtaskSchema, validateRequest, idParamSchema, validateParams } from "@/lib/validation";
import { handleError } from "@/lib/error-handler";

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
    const validation = validateRequest(updateSubtaskSchema, body);
    if (!validation.success) {
      return validation.response;
    }
    
    const { completed, title, description } = validation.data;

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
    return handleError(error, "Failed to update subtask");
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

            // Update all tasks and subtasks with their assigned due dates
            const updatePromises: Promise<any>[] = [];
            
            schedule.forEach((item) => {
              if (item.type === "task") {
                const task = allTasks[item.taskIndex];
                if (task) {
                  updatePromises.push(
                    prisma.task.update({
                      where: { id: task.id },
                      data: { dueDate: item.date },
                    })
                  );
                }
              } else if (item.type === "subtask" && item.subIndex !== undefined) {
                const task = allTasks[item.taskIndex];
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
          }
        }
      } catch (timelineError) {
        // Log error but don't fail the subtask deletion
        console.error("Error generating timeline:", timelineError);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleError(error, "Failed to delete subtask");
  }
}

