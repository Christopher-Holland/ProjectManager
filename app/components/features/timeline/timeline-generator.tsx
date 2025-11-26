interface Task {
    id: string;
    title: string;
    subtasks: Array<{ id: string; title: string }>;
}

interface ScheduleUnit {
    type: "task" | "subtask";
    weight: number;
    taskIndex: number;
    subIndex?: number;
    date: Date;
}

export function generateWeightedSchedule(
    tasks: Task[],
    dueDate: string,
    taskWeight = 3,
    subtaskWeight = 1
): ScheduleUnit[] {
    const start = new Date();
    const end = new Date(dueDate);

    // Ensure we have valid dates
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        throw new Error("Invalid date provided");
    }

    const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    
    // Handle edge cases
    if (totalDays <= 0) {
        // If due date is in the past or today, assign all tasks to today
        return tasks.map((task, tIndex) => ({
            type: "task" as const,
            weight: taskWeight,
            taskIndex: tIndex,
            date: new Date(start),
        }));
    }

    // Build weighted list
    const units: Omit<ScheduleUnit, "date">[] = [];

    tasks.forEach((task, tIndex) => {
        units.push({ type: "task", weight: taskWeight, taskIndex: tIndex });

        if (task.subtasks && Array.isArray(task.subtasks)) {
            task.subtasks.forEach((_, sIndex: number) => {
                units.push({ type: "subtask", weight: subtaskWeight, taskIndex: tIndex, subIndex: sIndex });
            });
        }
    });

    if (units.length === 0) {
        return [];
    }

    const totalWeight = units.reduce((sum, u) => sum + u.weight, 0);
    const daysPerWeight = totalDays / totalWeight;

    let cumulativeWeight = 0;

    return units.map(unit => {
        cumulativeWeight += unit.weight;

        const date = new Date(start);
        date.setDate(start.getDate() + Math.round(cumulativeWeight * daysPerWeight));
        
        // Ensure date doesn't exceed the end date
        if (date > end) {
            date.setTime(end.getTime());
        }

        return { ...unit, date };
    });
}