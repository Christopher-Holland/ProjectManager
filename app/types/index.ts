// Shared types across the application

export type Subtask = {
    id: string;
    title: string;
    completed: boolean;
    description?: string | null;
    dueDate?: Date | string | null;
};

export type Task = {
    id: string;
    title: string;
    description?: string | null;
    completed: boolean;
    subtasks?: Subtask[];
    status?: string;
    priority?: number;
    dueDate?: Date | string | null;
};

export type Project = {
    id: string;
    title: string;
    description: string | null;
    status: string;
    priority: number;
    dueDate: Date | null;
    userID: string;
    release?: string | null;
};

