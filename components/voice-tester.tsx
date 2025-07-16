"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { PlayIcon, VolumeXIcon, CheckCircleIcon, XCircleIcon, AlertTriangleIcon, InfoIcon } from "lucide-react"
import { webSpeechService } from "@/lib/web-speech-service"
import { supportedLanguages } from "@/lib/nlp-translation-service"

export function VoiceTester() {
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([])
  const [selectedLanguage, setSelectedLanguage] = useState("English")
  const [testText, setTestText] = useState("This is a test message")
  const [isTesting, setIsTesting] = useState(false)
  const [testResults, setTestResults] = useState<Record<string, boolean>>({})
  const [languageSupport, setLanguageSupport] = useState<Record<string, any>>({})
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    const loadVoices = () => {
      const voices = webSpeechService.getAvailableVoices()
      setAvailableVoices(voices)

      // Get language support information
      const support = webSpeechService.getLanguageSupport()
      setLanguageSupport(support)

      console.log("Available voices:", voices)
      console.log("Language support:", support)
    }

    // Load voices immediately
    loadVoices()

    // Also listen for voice changes
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.addEventListener("voiceschanged", loadVoices)
      return () => window.speechSynthesis.removeEventListener("voiceschanged", loadVoices)
    }
  }, [])

  const testLanguage = async (language: string) => {
    setIsTesting(true)
    try {
      const testMessage = language === "English" ? testText : `Test message in ${language}`
      await webSpeechService.speak(testMessage, language)
      setTestResults((prev) => ({ ...prev, [language]: true }))
    } catch (error) {
      console.error(`Failed to test ${language}:`, error)
      setTestResults((prev) => ({ ...prev, [language]: false }))
    } finally {
      setIsTesting(false)
    }
  }

  const testAllLanguages = async () => {
    setIsTesting(true)
    const languages = Object.keys(supportedLanguages)

    for (const language of languages) {
      try {
        await webSpeechService.speak(`Hello in ${language}`, language)
        setTestResults((prev) => ({ ...prev, [language]: true }))
        // Small delay between tests
        await new Promise((resolve) => setTimeout(resolve, 1000))
      } catch (error) {
        console.error(`Failed to test ${language}:`, error)
        setTestResults((prev) => ({ ...prev, [language]: false }))
      }
    }
    setIsTesting(false)
  }

  const getVoicesForLanguage = (language: string) => {
    const langConfig = supportedLanguages[language as keyof typeof supportedLanguages]
    if (!langConfig) return []

    return availableVoices.filter(
      (voice) =>
        voice.lang.startsWith(langConfig.code) ||
        voice.lang === langConfig.voice ||
        voice.name.toLowerCase().includes(language.toLowerCase()),
    )
  }

  const getLanguageStatus = (language: string) => {
    const support = languageSupport[language]
    if (!support) return { status: "unknown", icon: InfoIcon, color: "secondary" }

    if (support.supported && !support.fallback) {
      return { status: "native", icon: CheckCircleIcon, color: "default" }
    } else if (support.supported && support.fallback) {
      return { status: "fallback", icon: AlertTriangleIcon, color: "secondary" }
    } else {
      return { status: "unsupported", icon: XCircleIcon, color: "destructive" }
    }
  }

  const groupedLanguages = {
    "Well Supported": Object.keys(supportedLanguages).filter((lang) => {
      const support = languageSupport[lang]
      return support?.supported && !support?.fallback
    }),
    "Fallback Support": Object.keys(supportedLanguages).filter((lang) => {
      const support = languageSupport[lang]
      return support?.supported && support?.fallback
    }),
    "Limited/No Support": Object.keys(supportedLanguages).filter((lang) => {
      const support = languageSupport[lang]
      return !support?.supported
    }),
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <VolumeXIcon className="h-5 w-5" />
          Voice Testing Tool
        </CardTitle>
        <CardDescription>Test which languages work with your browser's speech synthesis</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <InfoIcon className="h-4 w-4" />
          <AlertDescription>
            <strong>Important:</strong> Many browsers don't have built-in voices for Telugu, Hindi, Russian, and other
            non-Western languages. The system will use fallback voices (usually English) but still speak the translated
            text.
          </AlertDescription>
        </Alert>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium mb-2 block">Test Individual Language</label>
            <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(supportedLanguages).map((lang) => {
                  const status = getLanguageStatus(lang)
                  const StatusIcon = status.icon
                  return (
                    <SelectItem key={lang} value={lang}>
                      <div className="flex items-center gap-2">
                        {lang}
                        <StatusIcon className="h-3 w-3" />
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
            <Button className="w-full mt-2" onClick={() => testLanguage(selectedLanguage)} disabled={isTesting}>
              <PlayIcon className="h-4 w-4 mr-2" />
              Test {selectedLanguage}
            </Button>

            {languageSupport[selectedLanguage] && (
              <div className="mt-2 p-2 bg-muted rounded text-xs">
                <div>
                  <strong>Voice:</strong> {languageSupport[selectedLanguage].voice || "Default"}
                </div>
                <div>
                  <strong>Status:</strong>{" "}
                  {languageSupport[selectedLanguage].fallback ? "Using fallback voice" : "Native support"}
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Available Voices for {selectedLanguage}</label>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {getVoicesForLanguage(selectedLanguage).map((voice, index) => (
                <div key={index} className="text-xs p-2 bg-muted rounded">
                  <div className="font-medium">{voice.name}</div>
                  <div className="text-muted-foreground">{voice.lang}</div>
                </div>
              ))}
              {getVoicesForLanguage(selectedLanguage).length === 0 && (
                <div className="text-xs text-muted-foreground p-2">
                  No specific voices found for {selectedLanguage}. Will use default voice with language attribute.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-medium">Language Support Status</h4>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowDetails(!showDetails)}>
                {showDetails ? "Hide Details" : "Show Details"}
              </Button>
              <Button variant="outline" size="sm" onClick={testAllLanguages} disabled={isTesting}>
                Test All Languages
              </Button>
            </div>
          </div>

          {showDetails ? (
            <div className="space-y-3">
              {Object.entries(groupedLanguages).map(
                ([group, languages]) =>
                  languages.length > 0 && (
                    <div key={group}>
                      <h5 className="text-sm font-medium mb-2">{group}</h5>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {languages.map((language) => {
                          const status = getLanguageStatus(language)
                          const StatusIcon = status.icon
                          return (
                            <Badge key={language} variant={status.color as any} className="justify-between text-xs">
                              {language}
                              <StatusIcon className="h-3 w-3 ml-1" />
                            </Badge>
                          )
                        })}
                      </div>
                    </div>
                  ),
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {Object.keys(supportedLanguages).map((language) => {
                const status = getLanguageStatus(language)
                const StatusIcon = status.icon
                return (
                  <Badge
                    key={language}
                    variant={
                      testResults[language] === true
                        ? "default"
                        : testResults[language] === false
                          ? "destructive"
                          : (status.color as any)
                    }
                    className="justify-center"
                  >
                    {language}
                    {testResults[language] === true && <CheckCircleIcon className="h-3 w-3 ml-1" />}
                    {testResults[language] === false && <XCircleIcon className="h-3 w-3 ml-1" />}
                    {testResults[language] === undefined && <StatusIcon className="h-3 w-3 ml-1" />}
                  </Badge>
                )
              })}
            </div>
          )}
        </div>

        <div className="text-xs text-muted-foreground bg-blue-50 dark:bg-blue-950/20 p-3 rounded space-y-1">
          <div>
            <strong>Legend:</strong>
          </div>
          <div>
            🟢 <strong>Native Support:</strong> Browser has specific voice for this language
          </div>
          <div>
            🟡 <strong>Fallback Support:</strong> Uses English/default voice but speaks translated text
          </div>
          <div>
            🔴 <strong>Limited Support:</strong> May not work properly
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
