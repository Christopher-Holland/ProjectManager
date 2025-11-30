import { NextRequest, NextResponse } from "next/server";
import { stackServerApp } from "@/stack/server";
import { updatePasswordSchema, validateRequest } from "@/lib/validation";
import { ErrorResponses, handleError, createErrorResponse, HttpStatus } from "@/lib/error-handler";

export async function PATCH(request: NextRequest) {
  try {
    const user = await stackServerApp.getUser();
    
    if (!user) {
      return ErrorResponses.unauthorized();
    }

    const body = await request.json();
    
    // Validate request body
    const validation = validateRequest(updatePasswordSchema, body);
    if (!validation.success) {
      return validation.response;
    }
    
    const { currentPassword, newPassword } = validation.data;

    // Stack Auth password updates use their REST API
    // We need to call Stack Auth's API directly with the API key
    const stackApiKey = process.env.STACK_SECRET_SERVER_KEY;
    if (!stackApiKey) {
      return createErrorResponse(
        "Stack Auth API key not configured",
        HttpStatus.INTERNAL_SERVER_ERROR,
        { message: "Please set STACK_SECRET_SERVER_KEY in your .env file." }
      );
    }

    try {
      // Call Stack Auth's REST API to update password
      const response = await fetch(`https://api.stack-auth.com/api/v1/users/${user.id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${stackApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password: newPassword,
          oldPassword: currentPassword,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        return createErrorResponse(
          errorData.error || 'Failed to update password',
          response.status
        );
      }

      return NextResponse.json({
        success: true,
        message: "Password updated successfully",
      });
    } catch (updateError) {
      return handleError(updateError, "Failed to update password");
    }
  } catch (error) {
    return handleError(error, "Failed to update password");
  }
}

