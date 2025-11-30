import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { stackServerApp } from "@/stack/server";
import { createSettingSchema, validateRequest } from "@/lib/validation";

export async function GET() {
  try {
    // Get user from Stack Auth using cookies
    const cookieStore = await cookies();
    const user = await stackServerApp.getUser(cookieStore);
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized - Please sign in" },
        { status: 401 }
      );
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
    console.error("Error fetching settings:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Failed to fetch settings", details: errorMessage },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get user from Stack Auth using cookies
    const cookieStore = await cookies();
    const user = await stackServerApp.getUser(cookieStore);
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized - Please sign in" },
        { status: 401 }
      );
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
      return NextResponse.json(
        { error: "Setting with this key already exists" },
        { status: 409 }
      );
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
    console.error("Error creating setting:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Failed to create setting", details: errorMessage },
      { status: 500 }
    );
  }
}

