import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateWeightedSchedule } from "@/app/components/features/timeline/timeline-generator";
import { idParamSchema, validateParams, createSubtaskSchema, validateRequest } from "@/lib/validation";
import { ErrorResponses, handleError } from "@/lib/error-handler";

export async function POST(
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
    const { id: taskId } = paramValidation.data;
    
    const body = await request.json();
    
    // Validate request body
    const validation = validateRequest(createSubtaskSchema, body);
    if (!validation.success) {
      return validation.response;
    }
    
    const { title, description } = validation.data;

    // Get the task to get the projectId if not provided
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      select: { projectID: true },
    });

    if (!task) {
      return ErrorResponses.notFound("Task");
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
      // Log error but don't fail the subtask creation
      console.error("Error generating timeline:", timelineError);
    }

    return NextResponse.json(newSubtask, { status: 201 });
  } catch (error) {
    return handleError(error, "Failed to create subtask");
  }
}

