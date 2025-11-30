import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { stackServerApp } from "@/stack/server";

export async function PATCH(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const user = await stackServerApp.getUser(cookieStore);
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized - Please sign in" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Current password and new password are required" },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "New password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    // Stack Auth password updates use their REST API
    // We need to call Stack Auth's API directly with the API key
    const stackApiKey = process.env.STACK_SECRET_SERVER_KEY;
    if (!stackApiKey) {
      return NextResponse.json(
        { error: "Stack Auth API key not configured. Please set STACK_SECRET_SERVER_KEY in your .env file." },
        { status: 500 }
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
        return NextResponse.json(
          { error: errorData.error || 'Failed to update password' },
          { status: response.status }
        );
      }

      return NextResponse.json({
        success: true,
        message: "Password updated successfully",
      });
    } catch (updateError) {
      console.error("Password update error:", updateError);
      const errorMessage = updateError instanceof Error ? updateError.message : 'Unknown error';
      return NextResponse.json(
        { error: `Failed to update password: ${errorMessage}` },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error updating password:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Failed to update password", details: errorMessage },
      { status: 500 }
    );
  }
}

