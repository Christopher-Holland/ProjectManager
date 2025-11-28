import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { stackServerApp } from "@/stack/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let updateData: {
    key?: string;
    value?: string;
    category?: string | null;
    description?: string | null;
  } = {};

  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const user = await stackServerApp.getUser(cookieStore);
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized - Please sign in" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { key, value, category, description } = body;

    // Check if setting exists and belongs to user
    const existingSetting = await prisma.setting.findUnique({
      where: { id },
      select: { userID: true, key: true },
    });

    if (!existingSetting) {
      return NextResponse.json(
        { error: "Setting not found" },
        { status: 404 }
      );
    }

    if (existingSetting.userID !== user.id) {
      return NextResponse.json(
        { error: "Unauthorized - Setting does not belong to user" },
        { status: 403 }
      );
    }

    // If key is being updated, check for conflicts
    if (key !== undefined && key !== existingSetting.key) {
      const keyExists = await prisma.setting.findUnique({
        where: {
          userID_key: {
            userID: user.id,
            key: key,
          },
        },
      });

      if (keyExists) {
        return NextResponse.json(
          { error: "Setting with this key already exists" },
          { status: 409 }
        );
      }
    }

    if (key !== undefined) updateData.key = key;
    if (value !== undefined) updateData.value = value;
    if (category !== undefined) updateData.category = category || null;
    if (description !== undefined) updateData.description = description || null;

    // Only update if there's data to update
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No data provided to update" },
        { status: 400 }
      );
    }

    const updatedSetting = await prisma.setting.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updatedSetting);
  } catch (error) {
    console.error("Error updating setting:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error("Error stack:", errorStack);
    console.error("Update data attempted:", updateData);
    return NextResponse.json(
      { error: "Failed to update setting", details: errorMessage },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const user = await stackServerApp.getUser(cookieStore);
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized - Please sign in" },
        { status: 401 }
      );
    }

    // Check if setting exists and belongs to user
    const existingSetting = await prisma.setting.findUnique({
      where: { id },
      select: { userID: true },
    });

    if (!existingSetting) {
      return NextResponse.json(
        { error: "Setting not found" },
        { status: 404 }
      );
    }

    if (existingSetting.userID !== user.id) {
      return NextResponse.json(
        { error: "Unauthorized - Setting does not belong to user" },
        { status: 403 }
      );
    }

    await prisma.setting.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting setting:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Failed to delete setting", details: errorMessage },
      { status: 500 }
    );
  }
}

