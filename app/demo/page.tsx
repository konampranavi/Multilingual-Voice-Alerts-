"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { AlertCircleIcon, MicIcon, ArrowLeftIcon } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

// Import the AudioPlayer component and types
import { AudioPlayer } from "@/components/audio-player"
import type { AlertAudio } from "@/types/voice"
import { createAlert } from "@/lib/alert-service"
import { VoiceTester } from "@/components/voice-tester"

export default function Demo() {
  const { toast } = useToast()
  const [isGenerating, setIsGenerating] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [alertText, setAlertText] = useState("")
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(["English"])
  // Add state for audio files
  const [audioFiles, setAudioFiles] = useState<AlertAudio[]>([])
  // Add state to track if we're checking ElevenLabs models or voices
  const [isCheckingModels, setIsCheckingModels] = useState(false)
  const [isCheckingVoices, setIsCheckingVoices] = useState(false)

  // Function to check available ElevenLabs models
  const checkElevenLabsModels = async () => {
    setIsCheckingModels(true)
    try {
      const response = await fetch("/api/elevenlabs-models")
      const data = await response.json()
      console.log("Available ElevenLabs models:", data)

      toast({
        title: "Models Checked",
        description: "Check the console for available ElevenLabs models",
      })
    } catch (error) {
      console.error("Error checking models:", error)
      toast({
        title: "Error",
        description: "Failed to check ElevenLabs models",
        variant: "destructive",
      })
    } finally {
      setIsCheckingModels(false)
    }
  }

  // Function to check available ElevenLabs voices
  const checkElevenLabsVoices = async () => {
    setIsCheckingVoices(true)
    try {
      const response = await fetch("/api/elevenlabs-voices")
      const data = await response.json()
      console.log("Available ElevenLabs voices:", data)

      toast({
        title: "Voices Checked",
        description: "Check the console for available ElevenLabs voices",
      })
    } catch (error) {
      console.error("Error checking voices:", error)
      toast({
        title: "Error",
        description: "Failed to check ElevenLabs voices",
        variant: "destructive",
      })
    } finally {
      setIsCheckingVoices(false)
    }
  }

  const handleAddLanguage = (language: string) => {
    if (selectedLanguages.length < 3 && !selectedLanguages.includes(language)) {
      setSelectedLanguages([...selectedLanguages, language])
    }
  }

  const handleRemoveLanguage = (index: number) => {
    const newLanguages = [...selectedLanguages]
    newLanguages.splice(index, 1)
    setSelectedLanguages(newLanguages)
  }

  // Update the handleGenerateDemo function to better handle errors
  const handleGenerateDemo = async () => {
    if (!alertText.trim()) {
      toast({
        title: "Error",
        description: "Please enter an alert message.",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)
    // Reset any existing audio playback
    setIsPlaying(false)
    setAudioFiles([])

    try {
      // Use the real alert service
      const alert = await createAlert(alertText, selectedLanguages)

      toast({
        title: "Demo Alert Generated",
        description: "Voice alerts have been generated in your selected languages.",
      })

      // If we have real audio URLs, use them
      if (alert.audioUrls && alert.audioUrls.length > 0) {
        // Set audio files first, then after a small delay set isPlaying to true
        setAudioFiles(alert.audioUrls)

        // Small delay to ensure the audio player component has time to initialize
        setTimeout(() => {
          setIsPlaying(true)
        }, 100)
      } else {
        // Fallback for demo purposes
        toast({
          title: "Using Simulated Audio",
          description: "No audio was generated. Using simulated playback for demo purposes.",
        })
        setIsPlaying(true)
        setTimeout(() => {
          setIsPlaying(false)
        }, 5000)
      }
    } catch (error) {
      console.error("Error generating demo:", error)
      toast({
        title: "Error",
        description: "Failed to generate voice alerts. Check the console for details.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  // Add a function to handle when audio playback completes
  const handlePlaybackComplete = () => {
    setIsPlaying(false)
    setAudioFiles([])
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="flex items-center mb-8">
        <Link href="/" className="mr-4">
          <Button variant="ghost" size="icon">
            <ArrowLeftIcon className="h-5 w-5" />
            <span className="sr-only">Back to home</span>
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Voice Alert Demo</h1>
          <p className="text-muted-foreground">Try out the multilingual voice alert system</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={checkElevenLabsVoices} disabled={isCheckingVoices}>
            {isCheckingVoices ? "Checking..." : "Check Voices"}
          </Button>
          <Button variant="outline" size="sm" onClick={checkElevenLabsModels} disabled={isCheckingModels}>
            {isCheckingModels ? "Checking..." : "Check Models"}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Create Demo Alert</CardTitle>
            <CardDescription>Enter an alert message to be translated and spoken</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="alert-text">Alert Message</Label>
              <Textarea
                id="alert-text"
                placeholder="Enter your alert message here..."
                className="min-h-32"
                value={alertText}
                onChange={(e) => setAlertText(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Selected Languages</Label>
              <div className="flex flex-wrap gap-2">
                {selectedLanguages.map((language, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 bg-secondary text-secondary-foreground px-3 py-1 rounded-full"
                  >
                    <span>{language}</span>
                    <button
                      onClick={() => handleRemoveLanguage(index)}
                      className="text-secondary-foreground/70 hover:text-secondary-foreground"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {selectedLanguages.length < 3 && (
              <div className="space-y-2">
                <Label htmlFor="add-language">Add Language</Label>
                <Select onValueChange={handleAddLanguage}>
                  <SelectTrigger id="add-language">
                    <SelectValue placeholder="Select a language" />
                  </SelectTrigger>
                  <SelectContent>
                    {["English", "Spanish", "French", "German", "Italian"]
                      .filter((lang) => !selectedLanguages.includes(lang))
                      .map((language) => (
                        <SelectItem key={language} value={language}>
                          {language}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={handleGenerateDemo} disabled={isGenerating || !alertText.trim()}>
              {isGenerating ? "Generating..." : "Generate Demo Alert"}
            </Button>
          </CardFooter>
        </Card>

        <Card className={isPlaying ? "border-primary" : ""}>
          <CardHeader className={isPlaying ? "text-primary" : ""}>
            <div className="flex items-center gap-2">
              <MicIcon className="h-5 w-5" />
              <CardTitle>Demo Playback</CardTitle>
            </div>
            <CardDescription>
              {isPlaying ? "Playing voice alerts in your selected languages" : "Generate an alert to see a demo"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center h-64">
              {isPlaying && audioFiles.length > 0 ? (
                <AudioPlayer audioFiles={audioFiles} onComplete={handlePlaybackComplete} />
              ) : isPlaying ? (
                <div className="flex flex-col items-center gap-4">
                  <div className="relative h-20 w-20">
                    <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping"></div>
                    <div className="relative flex items-center justify-center h-full w-full rounded-full bg-primary/20">
                      <MicIcon className="h-10 w-10 text-primary" />
                    </div>
                  </div>
                  <div className="text-center space-y-2">
                    <div className="font-medium">Playing demo alert</div>
                    <div className="text-sm text-muted-foreground">In a real app, you would hear voice alerts in:</div>
                    <div className="flex flex-wrap justify-center gap-2">
                      {selectedLanguages.map((language, index) => (
                        <div key={index} className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs">
                          {language}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-muted-foreground">
                  <AlertCircleIcon className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                  <p className="mb-2">No active demo</p>
                  <p className="text-sm">Enter an alert message and select languages to try the demo</p>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-center">
            <div className="text-sm text-muted-foreground text-center">
              This is a demo. Sign up for a full account to use all features.
            </div>
          </CardFooter>
        </Card>
      </div>

      <div className="mt-8">
        <VoiceTester />
      </div>

      <div className="mt-8 text-center">
        <p className="mb-4">Ready to create your own voice alerts?</p>
        <Link href="/sign-up">
          <Button size="lg">Create an Account</Button>
        </Link>
      </div>
    </div>
  )
}
