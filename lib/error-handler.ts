import { NextResponse } from "next/server";

/**
 * Standardized error response format
 */
export interface ErrorResponse {
  error: string;
  message?: string;
  code?: string;
  details?: unknown;
}

/**
 * Standard HTTP status codes
 */
export const HttpStatus = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  GONE: 410,
  INTERNAL_SERVER_ERROR: 500,
} as const;

/**
 * Prisma error codes mapping
 */
const PRISMA_ERROR_CODES = {
  P2002: { status: 409, message: "A record with this value already exists" },
  P2003: { status: 404, message: "Related record not found" },
  P2025: { status: 404, message: "Record not found" },
} as const;

/**
 * Creates a standardized error response
 */
export function createErrorResponse(
  error: string,
  status: number = HttpStatus.INTERNAL_SERVER_ERROR,
  options?: {
    message?: string;
    code?: string;
    details?: unknown;
  }
): NextResponse<ErrorResponse> {
  const isDevelopment = process.env.NODE_ENV === "development";
  
  const response: ErrorResponse = {
    error,
    ...(options?.message ? { message: options.message } : {}),
    ...(options?.code ? { code: options.code } : {}),
    // Only include details in development to avoid leaking sensitive info
    ...(isDevelopment && options?.details ? { details: options.details } : {}),
  };

  return NextResponse.json(response, { status });
}

/**
 * Handles unknown errors and converts them to standardized responses
 */
export function handleError(error: unknown, defaultMessage: string = "An error occurred"): NextResponse<ErrorResponse> {
  // Log error for debugging
  console.error("Error:", error);

  // Handle Prisma errors
  if (error && typeof error === "object" && "code" in error) {
    const prismaError = error as { code: string; meta?: unknown };
    const errorInfo = PRISMA_ERROR_CODES[prismaError.code as keyof typeof PRISMA_ERROR_CODES];
    
    if (errorInfo) {
      return createErrorResponse(
        errorInfo.message,
        errorInfo.status,
        {
          code: prismaError.code,
          details: process.env.NODE_ENV === "development" ? prismaError.meta : undefined,
        }
      );
    }
  }

  // Handle Error instances
  if (error instanceof Error) {
    return createErrorResponse(
      defaultMessage,
      HttpStatus.INTERNAL_SERVER_ERROR,
      {
        message: error.message,
        details: process.env.NODE_ENV === "development" ? error.stack : undefined,
      }
    );
  }

  // Handle string errors
  if (typeof error === "string") {
    return createErrorResponse(
      defaultMessage,
      HttpStatus.INTERNAL_SERVER_ERROR,
      {
        message: error,
      }
    );
  }

  // Fallback for unknown error types
  return createErrorResponse(
    defaultMessage,
    HttpStatus.INTERNAL_SERVER_ERROR,
    {
      details: process.env.NODE_ENV === "development" ? String(error) : undefined,
    }
  );
}

/**
 * Common error responses
 */
export const ErrorResponses = {
  unauthorized: () => createErrorResponse(
    "Unauthorized - Please sign in",
    HttpStatus.UNAUTHORIZED
  ),

  forbidden: (message?: string) => createErrorResponse(
    message || "Forbidden - You don't have permission to access this resource",
    HttpStatus.FORBIDDEN
  ),

  notFound: (resource: string = "Resource") => createErrorResponse(
    `${resource} not found`,
    HttpStatus.NOT_FOUND
  ),

  conflict: (message: string) => createErrorResponse(
    message,
    HttpStatus.CONFLICT
  ),

  badRequest: (message: string, details?: unknown) => createErrorResponse(
    message,
    HttpStatus.BAD_REQUEST,
    { details }
  ),

  internalServerError: (message: string = "An internal server error occurred", error?: unknown) => {
    return handleError(error || new Error(message), message);
  },
};

/**
 * Wraps an async route handler with error handling
 * Usage: export const GET = withErrorHandling(async (request) => { ... })
 */
export function withErrorHandling<T extends (...args: any[]) => Promise<NextResponse>>(
  handler: T
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await handler(...args);
    } catch (error) {
      return handleError(error, "An unexpected error occurred");
    }
  }) as T;
}

