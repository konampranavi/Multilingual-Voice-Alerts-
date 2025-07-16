"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { HistoryIcon, PlayIcon, DownloadIcon, PauseIcon } from "lucide-react"
import { getAlertHistory } from "@/lib/alert-service"
// Import the AudioPlayer component
import { AudioPlayer } from "@/components/audio-player"
import type { AlertAudio } from "@/types/voice"
import { useToast } from "@/hooks/use-toast"

interface Alert {
  id: string
  message: string
  timestamp: string
  languages: string[]
  audioUrls?: AlertAudio[]
}

export default function History() {
  const { toast } = useToast()
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [isLoading, setIsLoading] = useState(true)
  // Add state for audio playback
  const [playingAlertId, setPlayingAlertId] = useState<string | null>(null)
  const [audioFiles, setAudioFiles] = useState<AlertAudio[]>([])

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        // In a real app, this would be an API call
        const history = await getAlertHistory()
        setAlerts(history)
      } catch (error) {
        console.error("Failed to fetch alert history:", error)
        toast({
          title: "Error",
          description: "Failed to load alert history",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchAlerts()
  }, [toast])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    }).format(date)
  }

  // Update the handlePlayAlert function to better handle audio playback
  const handlePlayAlert = async (alertId: string) => {
    // If already playing this alert, stop playback
    if (playingAlertId === alertId) {
      setPlayingAlertId(null)
      setAudioFiles([])
      return
    }

    // Reset any existing audio playback
    setPlayingAlertId(null)
    setAudioFiles([])

    // Find the alert
    const alert = alerts.find((alert) => alert.id === alertId)

    if (alert) {
      // If we have real audio URLs, use them
      if (alert.audioUrls && alert.audioUrls.length > 0) {
        // Validate the audio URLs before setting them
        const validAudioFiles = alert.audioUrls.filter(
          (audio) => audio.audioUrl && (audio.audioUrl.startsWith("data:audio/") || audio.audioUrl.startsWith("http")),
        )

        if (validAudioFiles.length > 0) {
          setAudioFiles(validAudioFiles)

          // Small delay to ensure the audio player component has time to initialize
          setTimeout(() => {
            setPlayingAlertId(alertId)
          }, 100)
        } else {
          // No valid audio files
          toast({
            title: "Audio Unavailable",
            description: "No valid audio files available for this alert.",
            variant: "destructive",
          })

          // Create mock audio for demo purposes
          createMockAudio(alert, alertId)
        }
      } else {
        // Create mock audio for demo purposes
        createMockAudio(alert, alertId)
      }
    }
  }

  // Helper function to create mock audio for demo purposes
  const createMockAudio = (alert: Alert, alertId: string) => {
    toast({
      title: "Using Simulated Audio",
      description: "Real audio files not available. Using simulation for demo.",
    })

    // Create mock audio files for demo purposes
    const mockAudioFiles: AlertAudio[] = alert.languages.map((language) => ({
      language,
      // Use a sample audio URL - in a real app, you'd have actual audio files
      audioUrl: "https://audio-samples.github.io/samples/mp3/blizzard_biased/sample-0.mp3",
    }))

    setAudioFiles(mockAudioFiles)

    // Small delay to ensure the audio player component has time to initialize
    setTimeout(() => {
      setPlayingAlertId(alertId)
    }, 100)
  }

  // Add a function to handle when audio playback completes
  const handlePlaybackComplete = () => {
    setPlayingAlertId(null)
    setAudioFiles([])
  }

  const handleDownloadAlert = (alertId: string) => {
    // In a real app, this would download the alert audio files
    toast({
      title: "Download Started",
      description: "Your audio files would be downloading in a real app.",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Alert History</h1>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <HistoryIcon className="h-5 w-5" />
            <CardTitle>Recent Alerts</CardTitle>
          </div>
          <CardDescription>View and replay your previously generated alerts</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : alerts.length > 0 ? (
            <div className="space-y-4">
              {alerts.map((alert) => (
                <div key={alert.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium">{alert.message}</h3>
                      <p className="text-sm text-muted-foreground">{formatDate(alert.timestamp)}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant={playingAlertId === alert.id ? "default" : "outline"}
                        size="icon"
                        onClick={() => handlePlayAlert(alert.id)}
                      >
                        {playingAlertId === alert.id ? (
                          <PauseIcon className="h-4 w-4" />
                        ) : (
                          <PlayIcon className="h-4 w-4" />
                        )}
                        <span className="sr-only">{playingAlertId === alert.id ? "Stop" : "Play"}</span>
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => handleDownloadAlert(alert.id)}>
                        <DownloadIcon className="h-4 w-4" />
                        <span className="sr-only">Download</span>
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {alert.languages.map((language, index) => (
                      <div
                        key={index}
                        className="bg-secondary/50 text-secondary-foreground px-2 py-1 rounded-full text-xs"
                      >
                        {language}
                      </div>
                    ))}
                  </div>

                  {playingAlertId === alert.id && (
                    <div className="mt-4">
                      <AudioPlayer audioFiles={audioFiles} onComplete={handlePlaybackComplete} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <HistoryIcon className="h-12 w-12 mx-auto mb-2 text-muted-foreground/50" />
              <h3 className="font-medium mb-1">No alerts yet</h3>
              <p className="text-sm text-muted-foreground">Create your first alert to see it here</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
