import { type NextRequest, NextResponse } from "next/server"
import { generateSpeech, getRecommendedVoiceForLanguage, getModelForLanguage } from "@/lib/elevenlabs-service"

export async function POST(request: NextRequest) {
  try {
    const { text, language } = await request.json()

    if (!text || !language) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    // Check if we have the API key
    if (!process.env.ELEVENLABS_API_KEY) {
      console.error("ElevenLabs API key not configured")
      return NextResponse.json({ error: "ElevenLabs API key not configured" }, { status: 500 })
    }

    // Get the recommended voice for this language
    const voiceId = getRecommendedVoiceForLanguage(language)

    // Get the appropriate model for this language
    const modelId = getModelForLanguage(language)

    console.log(`Using voice ID ${voiceId} and model ID ${modelId} for language ${language}`)

    // Generate speech using ElevenLabs API
    const audioBuffer = await generateSpeech(text, voiceId, modelId)

    if (!audioBuffer) {
      return NextResponse.json({ error: "Failed to generate speech" }, { status: 500 })
    }

    // Return the audio as a binary response
    return new NextResponse(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": audioBuffer.byteLength.toString(),
      },
    })
  } catch (error) {
    console.error("Error in text-to-speech API:", error)
    return NextResponse.json({ error: "Failed to process text-to-speech request" }, { status: 500 })
  }
}
