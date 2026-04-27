import { NextResponse } from 'next/server';

// This would normally clear conversation history from a database/Redis
// For now, we'll just return success
export async function POST() {
  // In the current implementation, conversation history is in-memory
  // A production app would clear from persistent storage here
  return NextResponse.json({ success: true });
}
