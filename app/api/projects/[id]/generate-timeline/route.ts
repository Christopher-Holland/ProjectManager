import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateWeightedSchedule } from "@/app/components/features/timeline/timeline-generator";
import { idParamSchema, validateParams } from "@/lib/validation";
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
    const { id: projectId } = paramValidation.data;

    // Get the project with its due date
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { dueDate: true },
    });

    if (!project) {
      return ErrorResponses.notFound("Project");
    }

    if (!project.dueDate) {
      return ErrorResponses.badRequest("Project does not have a due date set");
    }

    // Fetch all tasks and their subtasks for this project
    const tasks = await prisma.task.findMany({
      where: { projectID: projectId },
      orderBy: { createdAt: "asc" },
      include: {
        subTasks: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (tasks.length === 0) {
      return NextResponse.json(
        { message: "No tasks found for this project" },
        { status: 200 }
      );
    }

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
      project.dueDate.toISOString()
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

    return NextResponse.json({
      message: "Timeline generated successfully",
      tasksUpdated: updatePromises.length,
    });
  } catch (error) {
    return handleError(error, "Failed to generate timeline");
  }
}

