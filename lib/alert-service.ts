import {
  generateSpeech,
  getRecommendedVoiceForLanguage,
  arrayBufferToBase64,
  getModelForLanguage,
} from "./elevenlabs-service"
import { translateTextWithNLP } from "./nlp-translation-service"
import { webSpeechService } from "./web-speech-service"
import { sensorManager, SensorType } from "./sensor-service"
import type { AlertAudio } from "@/types/voice"

interface Alert {
  id: string
  message: string
  timestamp: string
  languages: string[]
  audioFiles?: Record<string, string>
  audioUrls?: AlertAudio[]
  sensorType?: SensorType
}

// In-memory storage for demo purposes
// In a real app, this would be stored in a database
const alertHistory: Alert[] = [
  {
    id: "alert_1",
    message: "High temperature alert: 38.5°C. Please take precautions against heat.",
    timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    languages: ["English", "Spanish"],
    sensorType: SensorType.TEMPERATURE,
  },
  {
    id: "alert_2",
    message: "Environmental monitoring: Temperature 22.3°C, Humidity 45.7%, Wind 12.4 km/h. All readings normal.",
    timestamp: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    languages: ["English", "French", "German"],
  },
]

// Enhanced createAlert function with NLP translation and Web Speech API
export const createAlert = async (message: string, languages: string[], sensorType?: SensorType): Promise<Alert> => {
  const alertId = `alert_${Date.now()}`
  const timestamp = new Date().toISOString()

  // Create the alert object
  const alert: Alert = {
    id: alertId,
    message,
    timestamp,
    languages,
    audioFiles: {},
    audioUrls: [],
    sensorType,
  }

  try {
    // Prepare translations and audio for each language
    const translationPromises = languages.map(async (language) => {
      try {
        // Use NLP-based translation
        const translatedText = await translateTextWithNLP(message, language)
        console.log(`NLP Translation for ${language}: "${translatedText}"`)

        // Store the audio file reference
        if (alert.audioFiles) {
          alert.audioFiles[language] = `${alertId}_${language.toLowerCase()}.mp3`
        }

        // Try ElevenLabs first (if API key is available)
        if (process.env.ELEVENLABS_API_KEY) {
          try {
            console.log(`Generating ElevenLabs speech for ${language}`)
            const voiceId = getRecommendedVoiceForLanguage(language)
            const modelId = getModelForLanguage(language)
            const audioBuffer = await generateSpeech(translatedText, voiceId, modelId)

            if (audioBuffer && alert.audioUrls) {
              const base64Audio = arrayBufferToBase64(audioBuffer)
              const audioUrl = `data:audio/mpeg;base64,${base64Audio}`
              alert.audioUrls.push({ language, audioUrl })
              console.log(`ElevenLabs audio generated for ${language}`)
              return { language, translatedText, audioType: "elevenlabs" }
            }
          } catch (error) {
            console.error(`ElevenLabs failed for ${language}:`, error)
          }
        }

        // Always use Web Speech API with the translated text
        console.log(`Using Web Speech API for ${language} with translated text`)
        if (alert.audioUrls) {
          alert.audioUrls.push({
            language,
            audioUrl: `webspeech:${translatedText}`, // Special URL format for Web Speech API
          })
        }

        return { language, translatedText, audioType: "webspeech" }
      } catch (error) {
        console.error(`Failed to process language ${language}:`, error)
        return { language, translatedText: message, audioType: "webspeech" }
      }
    })

    // Wait for all translations to complete
    const translationResults = await Promise.all(translationPromises)

    // Save the alert to history
    alertHistory.unshift(alert)

    return alert
  } catch (error) {
    console.error("Failed to create alert:", error)
    throw new Error("Failed to create alert")
  }
}

// Enhanced function to play alert audio using Web Speech API
export const playAlertAudio = async (audioUrls: AlertAudio[]): Promise<void> => {
  try {
    const speechItems = audioUrls
      .map((audio) => {
        if (audio.audioUrl.startsWith("webspeech:")) {
          // Extract text from Web Speech API URL
          const text = audio.audioUrl.replace("webspeech:", "")
          return { text, language: audio.language }
        }
        return null
      })
      .filter(Boolean) as Array<{ text: string; language: string }>

    if (speechItems.length > 0) {
      console.log("Playing audio using Web Speech API...")
      await webSpeechService.speakMultiple(speechItems)
    }
  } catch (error) {
    console.error("Failed to play alert audio:", error)
    throw error
  }
}

// Get alert history
export const getAlertHistory = async (): Promise<Alert[]> => {
  return alertHistory
}

// Get a specific alert by ID
export const getAlertById = async (alertId: string): Promise<Alert | null> => {
  const alert = alertHistory.find((a) => a.id === alertId)
  return alert || null
}

// Set up sensor alert handling with immediate audio playback
export const initializeSensorAlerts = (userLanguages: string[] = ["English"]) => {
  // Listen for sensor alerts
  sensorManager.on("alert", async (alertData) => {
    try {
      console.log(`Sensor alert: ${alertData.message}`)

      // Create an alert with the sensor data
      const alert = await createAlert(alertData.message, userLanguages, alertData.type)

      // Immediately play the audio
      if (alert.audioUrls && alert.audioUrls.length > 0) {
        await playAlertAudio(alert.audioUrls)
      }
    } catch (error) {
      console.error("Failed to process sensor alert:", error)
    }
  })

  return () => {
    // Return a cleanup function
    sensorManager.removeAllListeners("alert")
  }
}

// Start sensor simulation
export const startSensorSimulation = () => {
  sensorManager.startSimulation()
  return () => sensorManager.stopSimulation()
}
