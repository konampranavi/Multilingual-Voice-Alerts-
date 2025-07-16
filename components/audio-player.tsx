"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  PlayIcon,
  PauseIcon,
  SkipForwardIcon,
  SkipBackIcon,
  LoaderIcon,
  AlertCircleIcon,
  VolumeXIcon,
} from "lucide-react"
import type { AlertAudio } from "@/types/voice"
import { webSpeechService } from "@/lib/web-speech-service"

interface AudioPlayerProps {
  audioFiles: AlertAudio[]
  onComplete?: () => void
  autoPlay?: boolean
}

export function AudioPlayer({ audioFiles, onComplete, autoPlay = false }: AudioPlayerProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [playbackComplete, setPlaybackComplete] = useState(false)
  const [currentLanguage, setCurrentLanguage] = useState<string>("")
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const hasAutoPlayedRef = useRef(false)
  const isPlayingRef = useRef(false)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Auto-play when component mounts if autoPlay is true
  useEffect(() => {
    if (autoPlay && !hasAutoPlayedRef.current && audioFiles.length > 0) {
      hasAutoPlayedRef.current = true
      console.log("🎵 Auto-playing audio files...")
      setTimeout(() => {
        playAllAudio()
      }, 500)
    }
  }, [autoPlay, audioFiles])

  // Reset when audioFiles change
  useEffect(() => {
    setCurrentIndex(0)
    setProgress(0)
    setIsPlaying(false)
    setError(null)
    setPlaybackComplete(false)
    setCurrentLanguage("")
    hasAutoPlayedRef.current = false
    isPlayingRef.current = false

    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current)
      progressIntervalRef.current = null
    }

    // Abort any ongoing playback
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    // Stop any ongoing speech
    webSpeechService.stop()
  }, [audioFiles])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      webSpeechService.stop()
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  const playAllAudio = async () => {
    if (audioFiles.length === 0 || isPlayingRef.current) return

    // Create new abort controller for this playback session
    abortControllerRef.current = new AbortController()
    const signal = abortControllerRef.current.signal

    setIsPlaying(true)
    setIsLoading(true)
    setError(null)
    setProgress(0)
    setCurrentIndex(0)
    setPlaybackComplete(false)
    isPlayingRef.current = true

    try {
      console.log("🎤 Starting to play all audio files...")

      // Prepare all speech items
      const speechItems = audioFiles.map((audio) => {
        let text = ""

        if (audio.audioUrl.startsWith("webspeech:")) {
          text = audio.audioUrl.replace("webspeech:", "")
        } else {
          // Fallback text
          text = `Alert message in ${audio.language}`
        }

        return { text, language: audio.language }
      })

      console.log("📝 Speech items prepared:", speechItems)

      setIsLoading(false)

      // Play each language sequentially
      for (let i = 0; i < speechItems.length; i++) {
        // Check if playback was aborted
        if (signal.aborted || !isPlayingRef.current) {
          console.log("🛑 Playback aborted by user")
          break
        }

        setCurrentIndex(i)
        setCurrentLanguage(speechItems[i].language)

        // Update progress for current item
        const progressPerItem = 100 / speechItems.length
        const baseProgress = i * progressPerItem

        console.log(`🎯 Playing ${i + 1}/${speechItems.length}: ${speechItems[i].language}`)

        try {
          // Start progress animation for this item
          let itemProgress = 0
          const progressInterval = setInterval(() => {
            if (isPlayingRef.current && !signal.aborted) {
              itemProgress += 2
              const currentProgress = baseProgress + (itemProgress / 100) * progressPerItem
              setProgress(Math.min(currentProgress, (i + 1) * progressPerItem))
            }
          }, 100)

          // Store interval reference for cleanup
          progressIntervalRef.current = progressInterval

          await webSpeechService.speak(speechItems[i].text, speechItems[i].language)

          clearInterval(progressInterval)
          setProgress((i + 1) * progressPerItem)

          console.log(`✅ Completed ${speechItems[i].language}`)

          // Small delay between languages if not the last one
          if (i < speechItems.length - 1 && isPlayingRef.current && !signal.aborted) {
            await new Promise((resolve) => {
              const timeout = setTimeout(resolve, 800)
              signal.addEventListener("abort", () => clearTimeout(timeout))
            })
          }
        } catch (error) {
          console.error(`❌ Failed to play ${speechItems[i].language}:`, error)
          // Continue with next language instead of stopping completely
          if (!signal.aborted) {
            console.log(`⏭️ Continuing to next language after error in ${speechItems[i].language}`)
          }
        }
      }

      // Complete playback
      if (isPlayingRef.current && !signal.aborted) {
        setProgress(100)
        setPlaybackComplete(true)
        setCurrentLanguage("Completed")

        setTimeout(() => {
          if (isPlayingRef.current && !signal.aborted) {
            setIsPlaying(false)
            isPlayingRef.current = false
            if (onComplete) {
              console.log("🎉 Playback completed, calling onComplete")
              onComplete()
            }
          }
        }, 1000)
      }
    } catch (error) {
      if (!signal.aborted) {
        console.error("❌ Error during audio playback:", error)
        setError("Failed to play audio. Please try again.")
        setIsPlaying(false)
        setIsLoading(false)
        isPlayingRef.current = false
      }
    }
  }

  const playSingleAudio = async (index: number) => {
    const audioFile = audioFiles[index]
    if (!audioFile) return

    setIsLoading(true)
    setError(null)
    setCurrentIndex(index)
    setCurrentLanguage(audioFile.language)

    try {
      let textToSpeak = ""

      if (audioFile.audioUrl.startsWith("webspeech:")) {
        textToSpeak = audioFile.audioUrl.replace("webspeech:", "")
      } else {
        textToSpeak = `Alert message in ${audioFile.language}`
      }

      console.log(`🎤 Speaking single audio in ${audioFile.language}: "${textToSpeak}"`)

      setIsLoading(false)
      await webSpeechService.speak(textToSpeak, audioFile.language)

      setProgress(100)
      setTimeout(() => {
        setProgress(0)
        setCurrentLanguage("")
      }, 1000)
    } catch (error) {
      console.error("❌ Single audio playback error:", error)
      setError("Failed to play speech. Please check your browser's speech synthesis support.")
    } finally {
      setIsLoading(false)
    }
  }

  const togglePlayPause = async () => {
    if (isLoading) return

    if (isPlaying) {
      // Stop playback
      console.log("🛑 Stopping playback")

      // Abort current playback session
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      webSpeechService.stop()
      setIsPlaying(false)
      setProgress(0)
      setCurrentLanguage("")
      isPlayingRef.current = false

      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
        progressIntervalRef.current = null
      }
    } else {
      // Start playback
      console.log("▶️ Starting playback")
      await playAllAudio()
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      webSpeechService.stop()
      playSingleAudio(currentIndex - 1)
    }
  }

  const handleNext = () => {
    if (currentIndex < audioFiles.length - 1) {
      webSpeechService.stop()
      playSingleAudio(currentIndex + 1)
    }
  }

  // Check if we have valid audio files
  const hasValidAudioFiles = audioFiles.length > 0

  if (!hasValidAudioFiles) {
    return (
      <Card className="p-4">
        <div className="flex flex-col items-center justify-center gap-2 py-4">
          <AlertCircleIcon className="h-8 w-8 text-yellow-500" />
          <div className="text-center">
            <p className="font-medium">No audio available</p>
            <p className="text-sm text-muted-foreground">Audio files could not be loaded or are not available.</p>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium flex items-center gap-2">
            <VolumeXIcon className="h-4 w-4 text-green-500" />
            {isPlaying ? "Playing" : "Ready"}: {currentLanguage || audioFiles[currentIndex]?.language || "Unknown"}
            <span className="text-xs bg-green-100 text-green-800 px-1 rounded">LIVE SPEECH</span>
          </div>
          <div className="text-sm text-muted-foreground">
            {currentIndex + 1} of {audioFiles.length}
          </div>
        </div>

        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        {error && <div className="text-sm text-red-500 bg-red-50 dark:bg-red-950/20 p-2 rounded-md">{error}</div>}

        {playbackComplete && (
          <div className="text-sm text-green-600 bg-green-50 dark:bg-green-950/20 p-2 rounded-md">
            ✅ Playback completed! All languages have been spoken.
          </div>
        )}

        <div className="text-sm text-blue-600 bg-blue-50 dark:bg-blue-950/20 p-2 rounded-md">
          🎤 Using your browser's speech synthesis for natural pronunciation in multiple languages
        </div>

        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handlePrevious}
            disabled={currentIndex === 0 || isLoading || isPlaying}
          >
            <SkipBackIcon className="h-4 w-4" />
            <span className="sr-only">Previous</span>
          </Button>

          <Button
            variant={isPlaying ? "outline" : "default"}
            size="icon"
            onClick={togglePlayPause}
            disabled={isLoading}
          >
            {isLoading ? (
              <LoaderIcon className="h-4 w-4 animate-spin" />
            ) : isPlaying ? (
              <PauseIcon className="h-4 w-4" />
            ) : (
              <PlayIcon className="h-4 w-4" />
            )}
            <span className="sr-only">{isLoading ? "Loading" : isPlaying ? "Pause" : "Play"}</span>
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={handleNext}
            disabled={currentIndex === audioFiles.length - 1 || isLoading || isPlaying}
          >
            <SkipForwardIcon className="h-4 w-4" />
            <span className="sr-only">Next</span>
          </Button>
        </div>

        {/* Language list */}
        <div className="flex flex-wrap gap-1 justify-center">
          {audioFiles.map((audio, index) => (
            <div
              key={index}
              className={`text-xs px-2 py-1 rounded-full ${
                index === currentIndex && isPlaying
                  ? "bg-green-100 text-green-800 border border-green-300"
                  : index <= currentIndex && playbackComplete
                    ? "bg-blue-100 text-blue-800"
                    : "bg-gray-100 text-gray-600"
              }`}
            >
              {audio.language}
              {index === currentIndex && isPlaying && " 🔊"}
              {index < currentIndex && playbackComplete && " ✅"}
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}
