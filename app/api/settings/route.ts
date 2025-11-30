import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stackServerApp } from "@/stack/server";
import { createSettingSchema, validateRequest } from "@/lib/validation";
import { ErrorResponses, handleError } from "@/lib/error-handler";

export async function GET(request: NextRequest) {
  try {
    // Get user from Stack Auth - automatically reads from Next.js cookies
    const user = await stackServerApp.getUser();
    
    if (!user) {
      return ErrorResponses.unauthorized();
    }

    const settings = await prisma.setting.findMany({
      where: {
        userID: user.id,
      },
      orderBy: [
        { category: "asc" },
        { key: "asc" },
      ],
    });

    return NextResponse.json(settings);
  } catch (error) {
    return handleError(error, "Failed to fetch settings");
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get user from Stack Auth - automatically reads from Next.js cookies
    const user = await stackServerApp.getUser();
    
    if (!user) {
      return ErrorResponses.unauthorized();
    }

    const body = await request.json();
    
    // Validate request body
    const validation = validateRequest(createSettingSchema, body);
    if (!validation.success) {
      return validation.response;
    }
    
    const { key, value, category, description } = validation.data;

    // Check if setting already exists for this user
    const existing = await prisma.setting.findUnique({
      where: {
        userID_key: {
          userID: user.id,
          key: key,
        },
      },
    });

    if (existing) {
      return ErrorResponses.conflict("Setting with this key already exists");
    }

    const newSetting = await prisma.setting.create({
      data: {
        key,
        value,
        category: category || null,
        description: description || null,
        userID: user.id,
      },
    });

    return NextResponse.json(newSetting, { status: 201 });
  } catch (error) {
    return handleError(error, "Failed to create setting");
  }
}

