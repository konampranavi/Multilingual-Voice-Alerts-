import { NextResponse } from "next/server"
import { getModels } from "@/lib/elevenlabs-service"

export async function GET() {
  try {
    // Fetch available models from ElevenLabs
    const models = await getModels()

    // Return the models as JSON
    return NextResponse.json({ models })
  } catch (error) {
    console.error("Error fetching ElevenLabs models:", error)
    return NextResponse.json({ error: "Failed to fetch ElevenLabs models" }, { status: 500 })
  }
}
