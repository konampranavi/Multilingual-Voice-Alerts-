"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { SettingsIcon, SaveIcon, LanguagesIcon } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { supportedLanguages } from "@/lib/nlp-translation-service"
import { VoiceTester } from "@/components/voice-tester"

export default function Settings() {
  const { toast } = useToast()
  const [languages, setLanguages] = useState<string[]>(["English"])
  const [voiceSpeed, setVoiceSpeed] = useState(1)
  const [autoPlay, setAutoPlay] = useState(true)
  const [isLoading, setIsLoading] = useState(false)

  // Get available languages from the NLP service
  const AVAILABLE_LANGUAGES = Object.keys(supportedLanguages)

  // Load user preferences from localStorage
  useEffect(() => {
    const storedPreferences = localStorage.getItem("userPreferences")
    if (storedPreferences) {
      const preferences = JSON.parse(storedPreferences)
      setLanguages(preferences.languages || ["English"])
      setVoiceSpeed(preferences.voiceSpeed || 1)
      setAutoPlay(preferences.autoPlay !== undefined ? preferences.autoPlay : true)
    }
  }, [])

  const handleAddLanguage = (language: string) => {
    if (languages.length < 3 && !languages.includes(language)) {
      setLanguages([...languages, language])
    } else if (languages.length >= 3) {
      toast({
        title: "Maximum Languages Reached",
        description: "You can select up to 3 languages for alerts.",
        variant: "destructive",
      })
    }
  }

  const handleRemoveLanguage = (index: number) => {
    const newLanguages = [...languages]
    newLanguages.splice(index, 1)
    setLanguages(newLanguages)
  }

  const handleSaveSettings = () => {
    setIsLoading(true)

    // Validate at least one language is selected
    if (languages.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one language.",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    // Save to localStorage (in a real app, this would be an API call)
    const preferences = {
      languages,
      voiceSpeed,
      autoPlay,
    }

    localStorage.setItem("userPreferences", JSON.stringify(preferences))

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      toast({
        title: "Settings Saved",
        description: "Your preferences have been updated successfully.",
      })
    }, 1000)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Settings</h1>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <LanguagesIcon className="h-5 w-5" />
            <CardTitle>Language Preferences</CardTitle>
          </div>
          <CardDescription>
            Select up to 3 languages for your voice alerts. Now supports Telugu, Russian, and many more languages with
            NLP-powered translation!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Selected Languages</Label>
            <div className="flex flex-wrap gap-2">
              {languages.map((language, index) => (
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
              {languages.length === 0 && <div className="text-sm text-muted-foreground">No languages selected</div>}
            </div>
          </div>

          {languages.length < 3 && (
            <div className="space-y-2">
              <Label htmlFor="add-language">Add Language</Label>
              <Select onValueChange={handleAddLanguage}>
                <SelectTrigger id="add-language">
                  <SelectValue placeholder="Select a language" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {AVAILABLE_LANGUAGES.filter((lang) => !languages.includes(lang)).map((language) => (
                    <SelectItem key={language} value={language}>
                      {language}
                      {(language === "Telugu" || language === "Russian") && (
                        <span className="ml-2 text-xs bg-green-100 text-green-800 px-1 rounded">NEW</span>
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>New:</strong> Enhanced with NLP-powered translation! Now supports Telugu, Russian, Arabic, and
              many Indian languages with natural speech synthesis.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <SettingsIcon className="h-5 w-5" />
            <CardTitle>Voice Settings</CardTitle>
          </div>
          <CardDescription>Customize how voice alerts are delivered using Web Speech API</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="voice-speed">Voice Speed</Label>
              <span className="text-sm font-medium">{voiceSpeed.toFixed(1)}x</span>
            </div>
            <Slider
              id="voice-speed"
              min={0.5}
              max={2}
              step={0.1}
              value={[voiceSpeed]}
              onValueChange={(value) => setVoiceSpeed(value[0])}
            />
            <p className="text-sm text-muted-foreground">Adjust the speed of the voice playback</p>
          </div>

          <div className="flex items-center space-x-2">
            <Switch id="auto-play" checked={autoPlay} onCheckedChange={setAutoPlay} />
            <Label htmlFor="auto-play">Auto-play alerts when generated</Label>
          </div>

          <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
            <p className="text-sm text-green-800 dark:text-green-200">
              <strong>Real Audio:</strong> Your browser's built-in speech synthesis will now speak alerts in your
              selected languages with natural pronunciation!
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={handleSaveSettings} disabled={isLoading}>
            <SaveIcon className="h-4 w-4 mr-2" />
            {isLoading ? "Saving..." : "Save Settings"}
          </Button>
        </CardFooter>
      </Card>

      <VoiceTester />
    </div>
  )
}
