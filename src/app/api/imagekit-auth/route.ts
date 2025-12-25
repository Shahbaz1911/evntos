import { NextResponse } from 'next/server';

// This file is no longer used for the new server-side upload flow.
// It can be safely deleted, but is kept here for reference during the transition.
// The new upload handler is located at /app/api/upload/route.ts.

export async function GET(request: Request) {
  return NextResponse.json(
    { message: "This endpoint is deprecated. Please use /api/upload." },
    { status: 404 }
  );
}
