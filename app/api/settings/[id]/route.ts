import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { stackServerApp } from "@/stack/server";
import { updateSettingSchema, validateRequest, idParamSchema, validateParams } from "@/lib/validation";
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
    
    const cookieStore = await cookies();
    const user = await stackServerApp.getUser(cookieStore);
    
    if (!user) {
      return ErrorResponses.unauthorized();
    }

    const body = await request.json();
    
    // Validate request body
    const validation = validateRequest(updateSettingSchema, body);
    if (!validation.success) {
      return validation.response;
    }
    
    const { key, value, category, description } = validation.data;
    
    const updateData: {
      key?: string;
      value?: string;
      category?: string | null;
      description?: string | null;
    } = {};

    // Check if setting exists and belongs to user
    const existingSetting = await prisma.setting.findUnique({
      where: { id },
      select: { userID: true, key: true },
    });

    if (!existingSetting) {
      return ErrorResponses.notFound("Setting");
    }

    if (existingSetting.userID !== user.id) {
      return ErrorResponses.forbidden("Setting does not belong to user");
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
        return ErrorResponses.conflict("Setting with this key already exists");
      }
    }

    if (key !== undefined) updateData.key = key;
    if (value !== undefined) updateData.value = value;
    if (category !== undefined) updateData.category = category || null;
    if (description !== undefined) updateData.description = description || null;

    // Only update if there's data to update
    if (Object.keys(updateData).length === 0) {
      return ErrorResponses.badRequest("No data provided to update");
    }

    const updatedSetting = await prisma.setting.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updatedSetting);
  } catch (error) {
    return handleError(error, "Failed to update setting");
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
    const cookieStore = await cookies();
    const user = await stackServerApp.getUser(cookieStore);
    
    if (!user) {
      return ErrorResponses.unauthorized();
    }

    // Check if setting exists and belongs to user
    const existingSetting = await prisma.setting.findUnique({
      where: { id },
      select: { userID: true },
    });

    if (!existingSetting) {
      return ErrorResponses.notFound("Setting");
    }

    if (existingSetting.userID !== user.id) {
      return ErrorResponses.forbidden("Setting does not belong to user");
    }

    await prisma.setting.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleError(error, "Failed to delete setting");
  }
}

