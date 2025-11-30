import { z } from "zod";
import { NextResponse } from "next/server";

/**
 * Validation utility for API routes
 * Provides schemas and helper functions for validating request data
 */

// Helper to validate date strings (ISO format or null)
const dateStringSchema = z.union([
  z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date format" }),
  z.null(),
]).optional();

// Project validation schemas
export const createProjectSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title must be less than 200 characters"),
  description: z.string().max(5000, "Description must be less than 5000 characters").nullable().optional(),
  dueDate: dateStringSchema,
  priority: z.number().int().min(1).max(3).optional().default(1),
  status: z.enum(["active", "in_progress", "completed"]).optional().default("active"),
  release: z.string().max(100).nullable().optional(),
});

export const updateProjectSchema = z.object({
  title: z.string().min(1, "Title cannot be empty").max(200, "Title must be less than 200 characters").optional(),
  description: z.string().max(5000, "Description must be less than 5000 characters").nullable().optional(),
  dueDate: dateStringSchema,
  priority: z.number().int().min(1).max(3).optional(),
  status: z.enum(["active", "in_progress", "completed"]).optional(),
  release: z.string().max(100).nullable().optional(),
});

// Task validation schemas
export const createTaskSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title must be less than 200 characters"),
  description: z.string().max(5000, "Description must be less than 5000 characters").nullable().optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1, "Title cannot be empty").max(200, "Title must be less than 200 characters").optional(),
  description: z.string().max(5000, "Description must be less than 5000 characters").nullable().optional(),
  completed: z.boolean().optional(),
  status: z.string().max(50).optional(),
  priority: z.number().int().min(1).max(3).optional(),
});

// Subtask validation schemas
export const createSubtaskSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title must be less than 200 characters"),
  description: z.string().max(5000, "Description must be less than 5000 characters").nullable().optional(),
});

export const updateSubtaskSchema = z.object({
  title: z.string().min(1, "Title cannot be empty").max(200, "Title must be less than 200 characters").optional(),
  description: z.string().max(5000, "Description must be less than 5000 characters").nullable().optional(),
  completed: z.boolean().optional(),
});

// Note validation schemas
export const createNoteSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title must be less than 200 characters"),
  content: z.string().max(10000, "Content must be less than 10000 characters").nullable().optional(),
  tags: z.string().max(500).nullable().optional(),
  pinned: z.boolean().optional().default(false),
});

export const updateNoteSchema = z.object({
  title: z.string().min(1, "Title cannot be empty").max(200, "Title must be less than 200 characters").optional(),
  content: z.string().max(10000, "Content must be less than 10000 characters").nullable().optional(),
  tags: z.string().max(500).nullable().optional(),
  pinned: z.boolean().optional(),
});

// Settings validation schemas
export const createSettingSchema = z.object({
  key: z.string().min(1, "Key is required").max(100, "Key must be less than 100 characters"),
  value: z.string().min(1, "Value is required").max(1000, "Value must be less than 1000 characters"),
  category: z.string().max(50).nullable().optional(),
  description: z.string().max(500).nullable().optional(),
});

export const updateSettingSchema = z.object({
  key: z.string().min(1, "Key cannot be empty").max(100, "Key must be less than 100 characters").optional(),
  value: z.string().min(1, "Value cannot be empty").max(1000, "Value must be less than 1000 characters").optional(),
  category: z.string().max(50).nullable().optional(),
  description: z.string().max(500).nullable().optional(),
});

// Password validation schema
export const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters long").max(100, "Password must be less than 100 characters"),
});

// ID parameter validation
export const idParamSchema = z.object({
  id: z.string().min(1, "ID is required"),
});

/**
 * Validates request body against a Zod schema
 * Returns validated data or error response
 */
export function validateRequest<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; response: NextResponse } {
  try {
    const validated = schema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }));
      
      return {
        success: false,
        response: NextResponse.json(
          {
            error: "Validation failed",
            details: errors,
          },
          { status: 400 }
        ),
      };
    }
    
    return {
      success: false,
      response: NextResponse.json(
        { error: "Invalid request data" },
        { status: 400 }
      ),
    };
  }
}

/**
 * Validates route parameters
 */
export function validateParams<T>(
  schema: z.ZodSchema<T>,
  params: unknown
): { success: true; data: T } | { success: false; response: NextResponse } {
  return validateRequest(schema, params);
}

