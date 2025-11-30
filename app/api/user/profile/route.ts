// This API route is no longer needed as we're using Stack Auth's client-side API
// Keeping it for reference but it won't be called
// Profile updates are now handled directly in the SettingsCard component using useUser().update()

import { NextRequest, NextResponse } from "next/server";

export async function PATCH(request: NextRequest) {
  return NextResponse.json(
    { error: "This endpoint is deprecated. Use client-side user.update() instead." },
    { status: 410 }
  );
}

