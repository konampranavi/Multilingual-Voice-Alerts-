// Enhanced Web Speech API service with robust interruption handling
import { supportedLanguages } from "./nlp-translation-service"

interface QueueItem {
  text: string
  language: string
  resolve: () => void
  reject: (error: Error) => void
  id: string
}

export class WebSpeechService {
  private synthesis: SpeechSynthesis
  private voices: SpeechSynthesisVoice[] = []
  private isInitialized = false
  private currentUtterance: SpeechSynthesisUtterance | null = null
  private speechQueue: QueueItem[] = []
  private isProcessingQueue = false
  private voiceCache: Map<string, SpeechSynthesisVoice | null> = new Map()
  private isSpeaking = false
  private languageSupport: Map<string, boolean> = new Map()
  private currentQueueId: string | null = null
  private cancelRequested = false

  constructor() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      this.synthesis = window.speechSynthesis
      this.initializeVoices()
    } else {
      console.warn("Speech synthesis not supported in this browser")
    }
  }

  private async initializeVoices(): Promise<void> {
    return new Promise((resolve) => {
      const loadVoices = () => {
        this.voices = this.synthesis.getVoices()
        this.isInitialized = true
        this.voiceCache.clear()
        this.languageSupport.clear()
        console.log("🎤 Available voices loaded:", this.voices.length)
        console.log("🌍 Voice languages:", [...new Set(this.voices.map((v) => v.lang))].sort())
        this.logAvailableLanguages()
        resolve()
      }

      this.synthesis.getVoices()

      if (this.synthesis.getVoices().length > 0) {
        loadVoices()
      } else {
        this.synthesis.addEventListener("voiceschanged", loadVoices, { once: true })
        setTimeout(() => {
          this.voices = this.synthesis.getVoices()
          this.isInitialized = true
          console.log("🕐 Voices loaded via timeout:", this.voices.length)
          this.logAvailableLanguages()
          resolve()
        }, 3000)
      }
    })
  }

  private logAvailableLanguages(): void {
    const languageGroups = {
      Western: ["en", "es", "fr", "de", "it", "pt", "nl", "sv", "da", "no"],
      Slavic: ["ru", "pl", "cs", "sk", "bg", "hr", "sr"],
      Asian: ["zh", "ja", "ko", "th", "vi"],
      Indian: ["hi", "te", "ta", "bn", "gu", "mr", "pa", "ur"],
      Arabic: ["ar"],
      Other: [],
    }

    const availableByGroup: Record<string, string[]> = {}

    Object.keys(languageGroups).forEach((group) => {
      availableByGroup[group] = []
    })

    this.voices.forEach((voice) => {
      const lang = voice.lang.substring(0, 2).toLowerCase()
      let assigned = false

      for (const [group, codes] of Object.entries(languageGroups)) {
        if (codes.includes(lang)) {
          availableByGroup[group].push(`${voice.lang} (${voice.name})`)
          assigned = true
          break
        }
      }

      if (!assigned) {
        availableByGroup.Other.push(`${voice.lang} (${voice.name})`)
      }
    })

    console.log("🗣️ Available voices by language group:")
    Object.entries(availableByGroup).forEach(([group, voices]) => {
      if (voices.length > 0) {
        console.log(`  ${group}: ${voices.length} voices`)
        voices.forEach((voice) => console.log(`    - ${voice}`))
      }
    })
  }

  private getVoiceForLanguage(language: string): SpeechSynthesisVoice | null {
    if (this.voiceCache.has(language)) {
      return this.voiceCache.get(language) || null
    }

    if (!this.voices || this.voices.length === 0) {
      console.warn("No voices available")
      return null
    }

    const langConfig = supportedLanguages[language as keyof typeof supportedLanguages]
    if (!langConfig) {
      console.log(`❌ No language config found for: ${language}`)
      return null
    }

    console.log(`🔍 Looking for voice for ${language} with code: ${langConfig.code}, voice: ${langConfig.voice}`)

    let voice: SpeechSynthesisVoice | undefined

    // Strategy 1: Exact voice match
    voice = this.voices.find((v) => v.lang === langConfig.voice)
    if (voice) {
      console.log(`✅ Found exact voice match: ${voice.name} (${voice.lang})`)
      this.voiceCache.set(language, voice)
      return voice
    }

    // Strategy 2: Language code match
    voice = this.voices.find((v) => v.lang.startsWith(langConfig.code + "-"))
    if (voice) {
      console.log(`✅ Found language code match: ${voice.name} (${voice.lang})`)
      this.voiceCache.set(language, voice)
      return voice
    }

    // Strategy 3: Enhanced special mappings
    const enhancedMappings: Record<string, { primary: string[]; fallbacks: string[] }> = {
      Hindi: {
        primary: ["hi-IN", "hi"],
        fallbacks: ["en-IN", "en-US", "en-GB"],
      },
      Telugu: {
        primary: ["te-IN", "te"],
        fallbacks: ["hi-IN", "hi", "en-IN", "en-US"],
      },
      Tamil: {
        primary: ["ta-IN", "ta"],
        fallbacks: ["hi-IN", "hi", "en-IN", "en-US"],
      },
      Bengali: {
        primary: ["bn-IN", "bn", "bn-BD"],
        fallbacks: ["hi-IN", "hi", "en-IN", "en-US"],
      },
      Russian: {
        primary: ["ru-RU", "ru"],
        fallbacks: ["en-US", "en-GB"],
      },
      Arabic: {
        primary: ["ar-SA", "ar", "ar-EG", "ar-AE"],
        fallbacks: ["en-US", "en-GB"],
      },
      Spanish: {
        primary: ["es-ES", "es", "es-MX", "es-US"],
        fallbacks: ["en-US"],
      },
      French: {
        primary: ["fr-FR", "fr", "fr-CA"],
        fallbacks: ["en-US"],
      },
      German: {
        primary: ["de-DE", "de", "de-AT"],
        fallbacks: ["en-US"],
      },
      Italian: {
        primary: ["it-IT", "it"],
        fallbacks: ["en-US"],
      },
    }

    const mapping = enhancedMappings[language]
    if (mapping) {
      // Try primary languages first
      for (const primaryLang of mapping.primary) {
        voice = this.voices.find((v) => v.lang === primaryLang)
        if (voice) {
          console.log(`✅ Found primary language match for ${language}: ${voice.name} (${voice.lang})`)
          this.voiceCache.set(language, voice)
          return voice
        }
      }

      // Try fallback languages
      for (const fallbackLang of mapping.fallbacks) {
        voice = this.voices.find((v) => v.lang === fallbackLang)
        if (voice) {
          console.log(`⚠️ Using fallback voice for ${language}: ${voice.name} (${voice.lang})`)
          this.voiceCache.set(language, voice)
          return voice
        }
      }
    }

    // Use default voice
    const defaultVoice = this.voices.find((v) => v.default) || this.voices[0]
    if (defaultVoice) {
      console.log(`⚠️ Using default voice for ${language}: ${defaultVoice.name} (${defaultVoice.lang})`)
    }

    this.voiceCache.set(language, defaultVoice || null)
    return defaultVoice || null
  }

  private generateQueueId(): string {
    return `queue_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessingQueue || this.speechQueue.length === 0) {
      return
    }

    this.isProcessingQueue = true
    this.cancelRequested = false
    const queueId = this.generateQueueId()
    this.currentQueueId = queueId

    console.log(`🎵 Processing speech queue with ${this.speechQueue.length} items (ID: ${queueId})`)

    while (this.speechQueue.length > 0 && !this.cancelRequested && this.currentQueueId === queueId) {
      const item = this.speechQueue.shift()
      if (!item) break

      try {
        console.log(`🎯 Processing: ${item.language} (Queue ID: ${queueId})`)
        await this.speakSingleWithRetry(item.text, item.language, queueId)

        if (!this.cancelRequested && this.currentQueueId === queueId) {
          item.resolve()
          console.log(`✅ Completed: ${item.language}`)
        }

        // Wait between utterances only if not cancelled
        if (!this.cancelRequested && this.currentQueueId === queueId && this.speechQueue.length > 0) {
          await this.delay(1500)
        }
      } catch (error) {
        console.error(`❌ Failed to speak ${item.language}:`, error)

        if (!this.cancelRequested) {
          // For interrupted errors, resolve instead of reject
          if (error instanceof Error && error.message.includes("interrupted")) {
            console.log(`⚠️ Resolving interrupted speech for ${item.language}`)
            item.resolve()
          } else {
            item.reject(error as Error)
          }
        }
      }
    }

    this.isProcessingQueue = false
    this.currentQueueId = null
    console.log(`✅ Finished processing speech queue (ID: ${queueId})`)
  }

  private async speakSingleWithRetry(text: string, language: string, queueId: string, maxRetries = 2): Promise<void> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await this.speakSingle(text, language, queueId)
        return // Success, exit retry loop
      } catch (error) {
        console.log(`⚠️ Attempt ${attempt}/${maxRetries} failed for ${language}:`, error)

        if (attempt === maxRetries) {
          throw error // Final attempt failed
        }

        // Wait before retry, but check for cancellation
        if (!this.cancelRequested && this.currentQueueId === queueId) {
          await this.delay(1000)
        } else {
          throw new Error("Cancelled during retry")
        }
      }
    }
  }

  private async speakSingle(text: string, language: string, queueId: string): Promise<void> {
    if (!this.synthesis) {
      throw new Error("Speech synthesis not available")
    }

    if (!this.isInitialized) {
      await this.initializeVoices()
    }

    // Check if this queue is still active
    if (this.cancelRequested || this.currentQueueId !== queueId) {
      throw new Error("Queue cancelled")
    }

    return new Promise((resolve, reject) => {
      // Ensure we're not speaking before starting
      const startSpeech = async () => {
        // Double check cancellation
        if (this.cancelRequested || this.currentQueueId !== queueId) {
          reject(new Error("Cancelled before speech start"))
          return
        }

        // Wait for any current speech to finish
        let waitCount = 0
        while ((this.synthesis.speaking || this.synthesis.pending || this.isSpeaking) && waitCount < 20) {
          console.log(`⏳ Waiting for speech to clear... (${waitCount + 1}/20)`)
          await this.delay(250)
          waitCount++

          if (this.cancelRequested || this.currentQueueId !== queueId) {
            reject(new Error("Cancelled while waiting"))
            return
          }
        }

        // Force cancel any remaining speech
        if (this.synthesis.speaking || this.synthesis.pending) {
          console.log("🛑 Force cancelling remaining speech")
          this.synthesis.cancel()
          await this.delay(500)
        }

        this.isSpeaking = true
        const utterance = new SpeechSynthesisUtterance(text)
        this.currentUtterance = utterance

        // Get voice and configure utterance
        const voice = this.getVoiceForLanguage(language)
        const langConfig = supportedLanguages[language as keyof typeof supportedLanguages]

        if (voice) {
          utterance.voice = voice
          console.log(`🎤 Using voice: ${voice.name} (${voice.lang}) for ${language}`)
        }

        if (langConfig) {
          utterance.lang = langConfig.voice
        }

        // Configure speech parameters
        utterance.rate = 0.8
        utterance.pitch = 1.0
        utterance.volume = 1.0

        let hasEnded = false
        let hasErrored = false
        let timeoutId: NodeJS.Timeout

        const cleanup = () => {
          this.currentUtterance = null
          this.isSpeaking = false
          if (timeoutId) clearTimeout(timeoutId)
        }

        utterance.onstart = () => {
          console.log(`🔊 Started speaking in ${language}: "${text.substring(0, 50)}..."`)
        }

        utterance.onend = () => {
          if (!hasEnded && !hasErrored) {
            hasEnded = true
            console.log(`✅ Finished speaking in ${language}`)
            cleanup()
            resolve()
          }
        }

        utterance.onerror = (event) => {
          if (!hasEnded && !hasErrored) {
            hasErrored = true
            console.error(`❌ Speech error for ${language}:`, event.error)
            cleanup()

            // Always resolve for interrupted errors to prevent cascade failures
            if (event.error === "interrupted" || event.error === "canceled") {
              console.log(`⚠️ Treating ${event.error} as success for ${language}`)
              resolve()
            } else {
              reject(new Error(`Speech synthesis failed for ${language}: ${event.error}`))
            }
          }
        }

        // Set timeout
        timeoutId = setTimeout(() => {
          if (!hasEnded && !hasErrored) {
            console.log(`⏰ Speech timeout for ${language}`)
            hasEnded = true
            this.synthesis.cancel()
            cleanup()
            resolve()
          }
        }, 10000)

        // Start speaking
        try {
          console.log(`🔊 Starting speech: "${text}" in ${language}`)
          this.synthesis.speak(utterance)
        } catch (error) {
          cleanup()
          reject(error as Error)
        }
      }

      startSpeech().catch(reject)
    })
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  async speak(text: string, language = "English"): Promise<void> {
    return new Promise((resolve, reject) => {
      const id = this.generateQueueId()
      this.speechQueue.push({ text, language, resolve, reject, id })
      this.processQueue()
    })
  }

  async speakMultiple(textArray: Array<{ text: string; language: string }>): Promise<void> {
    console.log(`🎵 Starting to speak ${textArray.length} items`)

    // Clear any existing queue and stop current speech
    this.stop()

    // Add all items to queue
    const promises = textArray.map(
      (item) =>
        new Promise<void>((resolve, reject) => {
          const id = this.generateQueueId()
          this.speechQueue.push({
            text: item.text,
            language: item.language,
            resolve,
            reject,
            id,
          })
        }),
    )

    // Start processing queue
    this.processQueue()

    // Wait for all to complete
    try {
      const results = await Promise.allSettled(promises)
      const failures = results.filter((result) => result.status === "rejected")

      if (failures.length > 0) {
        console.warn(`⚠️ Some languages failed: ${failures.length}/${results.length}`)
      }

      console.log(`✅ Completed speaking (${results.length - failures.length}/${results.length} successful)`)
    } catch (error) {
      console.error(`❌ Error in speakMultiple:`, error)
      throw error
    }
  }

  stop(): void {
    console.log("🛑 Stopping speech synthesis")

    this.cancelRequested = true
    this.currentQueueId = null

    if (this.synthesis) {
      this.synthesis.cancel()
    }

    this.currentUtterance = null
    this.speechQueue.length = 0
    this.isProcessingQueue = false
    this.isSpeaking = false

    console.log("🛑 Speech synthesis stopped and queue cleared")
  }

  getAvailableLanguages(): string[] {
    return Object.keys(supportedLanguages)
  }

  getAvailableVoices(): SpeechSynthesisVoice[] {
    return this.voices
  }

  async testLanguage(language: string): Promise<boolean> {
    if (!this.isInitialized) {
      await this.initializeVoices()
    }

    const voice = this.getVoiceForLanguage(language)
    const isSupported = voice !== null
    this.languageSupport.set(language, isSupported)
    return isSupported
  }

  getVoiceInfo(language: string): { voice: SpeechSynthesisVoice | null; hasVoice: boolean; fallbackUsed: boolean } {
    const voice = this.getVoiceForLanguage(language)
    const langConfig = supportedLanguages[language as keyof typeof supportedLanguages]

    let fallbackUsed = false
    if (voice && langConfig) {
      fallbackUsed = !voice.lang.startsWith(langConfig.code)
    }

    return {
      voice,
      hasVoice: voice !== null,
      fallbackUsed,
    }
  }

  getLanguageSupport(): Record<string, { supported: boolean; voice?: string; fallback?: boolean }> {
    const support: Record<string, { supported: boolean; voice?: string; fallback?: boolean }> = {}

    Object.keys(supportedLanguages).forEach((language) => {
      const info = this.getVoiceInfo(language)
      support[language] = {
        supported: info.hasVoice,
        voice: info.voice?.name,
        fallback: info.fallbackUsed,
      }
    })

    return support
  }

  isSpeaking(): boolean {
    return this.synthesis ? this.synthesis.speaking : false
  }

  pause(): void {
    if (this.synthesis && this.synthesis.speaking) {
      this.synthesis.pause()
    }
  }

  resume(): void {
    if (this.synthesis && this.synthesis.paused) {
      this.synthesis.resume()
    }
  }

  clearVoiceCache(): void {
    this.voiceCache.clear()
    this.languageSupport.clear()
  }
}

// Create and export a singleton instance
export const webSpeechService = new WebSpeechService()
