import type { Voice } from "@/types/voice"

// ElevenLabs API base URL
const API_URL = "https://api.elevenlabs.io/v1"

// Valid ElevenLabs model IDs
// Using the correct format with underscores instead of hyphens
const MODELS = {
  MULTILINGUAL: "eleven_multilingual_v1", // Corrected format with underscores
  MONOLINGUAL: "eleven_monolingual_v1", // Corrected format with underscores
  TURBO: "eleven_turbo_v2", // Corrected format with underscores
}

// Default voice ID - Rachel (verified to work)
const DEFAULT_VOICE_ID = "21m00Tcm4TlvDq8ikWAM"

// Get available voices from ElevenLabs
export async function getVoices(): Promise<Voice[]> {
  try {
    const response = await fetch(`${API_URL}/voices`, {
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": process.env.ELEVENLABS_API_KEY || "",
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Failed to fetch voices: ${response.status}. Response: ${errorText}`)
      throw new Error(`Failed to fetch voices: ${response.status}`)
    }

    const data = await response.json()
    return data.voices || []
  } catch (error) {
    console.error("Error fetching voices:", error)
    return []
  }
}

// Get available models from ElevenLabs
export async function getModels(): Promise<any[]> {
  try {
    const response = await fetch(`${API_URL}/models`, {
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": process.env.ELEVENLABS_API_KEY || "",
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Failed to fetch models: ${response.status}. Response: ${errorText}`)
      throw new Error(`Failed to fetch models: ${response.status}`)
    }

    const data = await response.json()
    console.log("Available models:", data)
    return data || []
  } catch (error) {
    console.error("Error fetching models:", error)
    return []
  }
}

// Get the appropriate model for a language
export function getModelForLanguage(language: string): string {
  // For all languages, use the multilingual model
  // This is the safest option until we confirm exact model IDs
  return MODELS.MULTILINGUAL
}

// Generate speech using ElevenLabs API
export async function generateSpeech(
  text: string,
  voiceId = DEFAULT_VOICE_ID, // Default voice ID (Rachel)
  modelId = MODELS.MULTILINGUAL, // Default to multilingual model
): Promise<ArrayBuffer | null> {
  if (!text || text.trim() === "") {
    console.error("Empty text provided to generateSpeech")
    return null
  }

  // Validate input
  if (text.length > 5000) {
    console.warn("Text exceeds recommended length (5000 chars):", text.length)
    // Truncate text to avoid API errors
    text = text.substring(0, 4990) + "..."
  }

  try {
    console.log(`Generating speech for text: "${text.substring(0, 100)}${text.length > 100 ? "..." : ""}"`)
    console.log(`Using voice ID: ${voiceId}, model ID: ${modelId}`)

    // Prepare request body according to ElevenLabs API docs
    const requestBody = JSON.stringify({
      text,
      model_id: modelId,
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.5,
      },
    })

    // Log the API key presence (not the actual key)
    console.log(`API Key present: ${Boolean(process.env.ELEVENLABS_API_KEY)}`)

    const response = await fetch(`${API_URL}/text-to-speech/${voiceId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": process.env.ELEVENLABS_API_KEY || "",
      },
      body: requestBody,
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`ElevenLabs API error: ${response.status}. Response: ${errorText}`)

      // If we get a voice not found error, try with the default voice
      if (errorText.includes("voice_not_found") && voiceId !== DEFAULT_VOICE_ID) {
        console.log(`Voice ID ${voiceId} not found. Falling back to default voice ${DEFAULT_VOICE_ID}...`)

        // Try again with the default voice
        return generateSpeech(text, DEFAULT_VOICE_ID, modelId)
      }

      // If we get an invalid model error, try with a fallback approach
      if (errorText.includes("invalid_uid") && errorText.includes("model_id")) {
        console.log("Attempting fallback without specifying model_id...")

        // Try again without specifying the model_id
        const fallbackRequestBody = JSON.stringify({
          text,
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5,
          },
        })

        const fallbackResponse = await fetch(`${API_URL}/text-to-speech/${voiceId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "xi-api-key": process.env.ELEVENLABS_API_KEY || "",
          },
          body: fallbackRequestBody,
        })

        if (!fallbackResponse.ok) {
          const fallbackErrorText = await fallbackResponse.text()
          console.error(`Fallback also failed: ${fallbackResponse.status}. Response: ${fallbackErrorText}`)
          throw new Error(`Failed to generate speech: ${fallbackResponse.status}`)
        }

        return await fallbackResponse.arrayBuffer()
      }

      throw new Error(`Failed to generate speech: ${response.status}`)
    }

    return await response.arrayBuffer()
  } catch (error) {
    console.error("Error generating speech:", error)
    throw error
  }
}

// Get recommended voice for a specific language
export function getRecommendedVoiceForLanguage(language: string): string {
  // Replace these voice IDs with the ones you discovered from the API
  const voiceMap: Record<string, string> = {
    English: "21m00Tcm4TlvDq8ikWAM", // Rachel - verified
    Spanish: "EXAVITQu4vr4xnSDxMaL", // Replace with a valid Spanish voice ID you found
    French: "jsCqWAovK2LkecY7zXl4", // Replace with a valid French voice ID you found
    German: "AZnzlk1XvdvUeBnXmlld", // Replace with a valid German voice ID you found
    Italian: "MF3mGyEYCl7XYWbV9V6O", // Replace with a valid Italian voice ID you found
    Hindi: "pNInz6obpgDQGcFmaJgB", // Adam - using as a fallback for Hindi
    // Add more languages as needed
  }

  return voiceMap[language] || DEFAULT_VOICE_ID // Default to Rachel if no match
}

// Convert ArrayBuffer to base64 string for audio playback
export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = ""
  const bytes = new Uint8Array(buffer)
  const len = bytes.byteLength

  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i])
  }

  return window.btoa(binary)
}
