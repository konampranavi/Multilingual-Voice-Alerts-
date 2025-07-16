import { NextResponse } from "next/server"
import { getVoices } from "@/lib/elevenlabs-service"

export async function GET() {
  try {
    // Fetch available voices from ElevenLabs
    const voices = await getVoices()

    // Return the voices as JSON
    return NextResponse.json({ voices })
  } catch (error) {
    console.error("Error fetching ElevenLabs voices:", error)
    return NextResponse.json({ error: "Failed to fetch ElevenLabs voices" }, { status: 500 })
  }
}
