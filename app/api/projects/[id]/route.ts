import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateWeightedSchedule } from "@/app/components/features/timeline/timeline-generator";
import { updateProjectSchema, validateRequest, idParamSchema, validateParams } from "@/lib/validation";
import { ErrorResponses, handleError } from "@/lib/error-handler";

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
    const validation = validateRequest(updateProjectSchema, body);
    if (!validation.success) {
      return validation.response;
    }
    
    const { status, title, description, priority, dueDate } = validation.data;

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
          const formattedTasks = tasks.map((task: typeof tasks[0]) => ({
            id: task.id,
            title: task.title,
            subtasks: task.subTasks.map((sub: typeof task.subTasks[0]) => ({
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
        }
      } catch (timelineError) {
        // Log error but don't fail the project update
        console.error("Error generating timeline:", timelineError);
      }
    }

    return NextResponse.json(updatedProject);
  } catch (error) {
    return handleError(error, "Failed to update project");
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

    await prisma.project.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleError(error, "Failed to delete project");
  }
}

