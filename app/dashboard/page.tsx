"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  BellIcon,
  MicIcon,
  AlertCircleIcon,
  PauseIcon,
  ThermometerIcon,
  DropletIcon,
  WindIcon,
  FlameIcon,
  ZapIcon,
  InfoIcon,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { createAlert, initializeSensorAlerts, startSensorSimulation } from "@/lib/alert-service"
import { sensorManager, SensorType } from "@/lib/sensor-service"
// Import the AudioPlayer component
import { AudioPlayer } from "@/components/audio-player"
import type { AlertAudio } from "@/types/voice"

export default function Dashboard() {
  const { toast } = useToast()
  const [isGenerating, setIsGenerating] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [alertText, setAlertText] = useState("")
  const [temperature, setTemperature] = useState(25)
  const [humidity, setHumidity] = useState(50)
  const [windSpeed, setWindSpeed] = useState(10)
  const [smoke, setSmoke] = useState(0)
  const [gas, setGas] = useState(0)
  const [autoUpdate, setAutoUpdate] = useState(false)
  const [sensorSimulation, setSensorSimulation] = useState(false)
  const [userPreferences, setUserPreferences] = useState({
    languages: ["English", "Spanish", "French"],
  })
  // Add a new state for audio files
  const [audioFiles, setAudioFiles] = useState<AlertAudio[]>([])
  const [showLanguageInfo, setShowLanguageInfo] = useState(true)

  // Load user preferences from localStorage
  useEffect(() => {
    const storedPreferences = localStorage.getItem("userPreferences")
    if (storedPreferences) {
      const prefs = JSON.parse(storedPreferences)
      setUserPreferences(prefs)
      console.log("📋 Loaded user preferences:", prefs)
    }
  }, [])

  // Initialize sensor alerts when user preferences change
  useEffect(() => {
    const cleanup = initializeSensorAlerts(userPreferences.languages)
    return cleanup
  }, [userPreferences.languages])

  // Handle sensor simulation
  useEffect(() => {
    if (sensorSimulation) {
      const cleanup = startSensorSimulation()

      // Listen for sensor readings
      const handleReading = (reading: any) => {
        switch (reading.type) {
          case SensorType.TEMPERATURE:
            setTemperature(reading.value)
            break
          case SensorType.HUMIDITY:
            setHumidity(reading.value)
            break
          case SensorType.WIND:
            setWindSpeed(reading.value)
            break
          case SensorType.SMOKE:
            setSmoke(reading.value)
            break
          case SensorType.GAS:
            setGas(reading.value)
            break
        }
      }

      sensorManager.on("reading", handleReading)

      // Listen for alerts
      const handleAlert = (alertData: any) => {
        toast({
          title: `${alertData.type.charAt(0).toUpperCase() + alertData.type.slice(1)} Alert`,
          description: alertData.message,
          variant: "destructive",
        })
      }

      sensorManager.on("alert", handleAlert)

      return () => {
        cleanup()
        sensorManager.removeListener("reading", handleReading)
        sensorManager.removeListener("alert", handleAlert)
      }
    }
  }, [sensorSimulation, toast])

  // Simulate sensor data updates when in manual mode
  useEffect(() => {
    if (!autoUpdate || sensorSimulation) return

    const interval = setInterval(() => {
      setTemperature((prev) => Math.min(Math.max(prev + (Math.random() * 2 - 1), 0), 50))
      setHumidity((prev) => Math.min(Math.max(prev + (Math.random() * 5 - 2.5), 0), 100))
      setWindSpeed((prev) => Math.min(Math.max(prev + (Math.random() * 3 - 1.5), 0), 50))

      // Occasionally simulate smoke or gas
      if (Math.random() < 0.05) {
        setSmoke((prev) => Math.min(prev + Math.random() * 10, 100))
      } else {
        setSmoke((prev) => Math.max(prev - 2, 0))
      }

      if (Math.random() < 0.05) {
        setGas((prev) => Math.min(prev + Math.random() * 10, 100))
      } else {
        setGas((prev) => Math.max(prev - 2, 0))
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [autoUpdate, sensorSimulation])

  // Enhanced handleGenerateAlert function
  const handleGenerateAlert = async (source: "manual" | "sensor") => {
    setIsGenerating(true)
    // Reset any existing audio playback
    setIsPlaying(false)
    setAudioFiles([])

    try {
      let alertMessage = ""
      let sensorType: SensorType | undefined = undefined

      if (source === "manual") {
        alertMessage = alertText
      } else {
        // Generate alert based on sensor data
        if (smoke > 50) {
          alertMessage = `Smoke detected: Level ${smoke.toFixed(0)}. Please check for fire hazards.`
          sensorType = SensorType.SMOKE
        } else if (gas > 50) {
          alertMessage = `Gas leak detected: Level ${gas.toFixed(0)}. Evacuate the area immediately.`
          sensorType = SensorType.GAS
        } else if (temperature > 35) {
          alertMessage = `High temperature alert: ${temperature.toFixed(1)}°C. Please take precautions against heat.`
          sensorType = SensorType.TEMPERATURE
        } else if (temperature < 5) {
          alertMessage = `Low temperature alert: ${temperature.toFixed(1)}°C. Risk of freezing conditions.`
          sensorType = SensorType.TEMPERATURE
        } else if (humidity > 85) {
          alertMessage = `High humidity alert: ${humidity.toFixed(1)}%. Potential for condensation and mold growth.`
          sensorType = SensorType.HUMIDITY
        } else if (windSpeed > 30) {
          alertMessage = `High wind alert: ${windSpeed.toFixed(1)} km/h. Secure loose objects outdoors.`
          sensorType = SensorType.WIND
        } else {
          alertMessage = `Environmental monitoring: Temperature ${temperature.toFixed(1)}°C, Humidity ${humidity.toFixed(1)}%, Wind ${windSpeed.toFixed(1)} km/h. All readings normal.`
        }
      }

      console.log("🚨 Generating alert:", alertMessage)
      console.log("🌍 Languages:", userPreferences.languages)

      // Create the alert with NLP translation
      const alert = await createAlert(alertMessage, userPreferences.languages, sensorType)

      toast({
        title: "Alert Generated",
        description: `Voice alerts created in ${userPreferences.languages.join(", ")}`,
      })

      // Set up audio for playback
      if (alert.audioUrls && alert.audioUrls.length > 0) {
        console.log("🎵 Setting up audio files for playback:", alert.audioUrls)
        setAudioFiles(alert.audioUrls)

        // Start playing immediately
        setTimeout(() => {
          setIsPlaying(true)
        }, 500)
      } else {
        toast({
          title: "No Audio Generated",
          description: "Alert was created but no audio could be generated.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("❌ Error generating alert:", error)
      toast({
        title: "Error",
        description: "Failed to generate voice alerts. Please check the console for details.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  // Add a function to handle when audio playback completes
  const handlePlaybackComplete = () => {
    console.log("🎉 Audio playback completed")
    setIsPlaying(false)
    setAudioFiles([])
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Create Alert</h1>
        <div className="flex items-center gap-2">
          {isPlaying ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsPlaying(false)
                setAudioFiles([])
              }}
            >
              <PauseIcon className="h-4 w-4 mr-2" />
              Stop Playback
            </Button>
          ) : null}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Your Language Preferences</CardTitle>
            <CardDescription>Alerts will be generated in these languages</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {userPreferences.languages.map((language, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary"></div>
                  <span>{language}</span>
                </div>
              ))}
            </div>

            {showLanguageInfo && (
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-md">
                <div className="flex items-start gap-2">
                  <InfoIcon className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-blue-800 dark:text-blue-200 mb-2">
                      <strong>Multilingual Voice Alerts:</strong> The system will speak alerts in all your selected
                      languages.
                    </p>
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      Try Telugu, Russian, Hindi, or other languages in Settings!
                    </p>
                    <Button
                      variant="link"
                      size="sm"
                      className="text-xs p-0 h-auto mt-1"
                      onClick={() => setShowLanguageInfo(false)}
                    >
                      Dismiss
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" asChild>
              <a href="/dashboard/settings">Change Languages</a>
            </Button>
          </CardFooter>
        </Card>

        <Card className={isPlaying ? "border-primary" : ""}>
          <CardHeader className={isPlaying ? "text-primary" : ""}>
            <div className="flex items-center gap-2">
              <MicIcon className="h-5 w-5" />
              <CardTitle>Alert Playback</CardTitle>
            </div>
            <CardDescription>
              {isPlaying
                ? "Currently playing voice alerts in your selected languages"
                : "Generate an alert to hear it in your selected languages"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isPlaying && audioFiles.length > 0 ? (
              <AudioPlayer audioFiles={audioFiles} onComplete={handlePlaybackComplete} autoPlay={true} />
            ) : (
              <div className="flex flex-col items-center justify-center h-32">
                <div className="text-center text-muted-foreground">
                  <AlertCircleIcon className="h-12 w-12 mx-auto mb-2 text-muted-foreground/50" />
                  {audioFiles.length > 0 ? "Click play to hear your alerts" : "No active alerts"}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="manual">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="manual">Manual Alert</TabsTrigger>
          <TabsTrigger value="sensor">Sensor Data</TabsTrigger>
        </TabsList>

        <TabsContent value="manual" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Create Manual Alert</CardTitle>
              <CardDescription>Enter the alert text to be translated and spoken</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Enter alert message here..."
                className="min-h-32"
                value={alertText}
                onChange={(e) => setAlertText(e.target.value)}
              />
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                onClick={() => handleGenerateAlert("manual")}
                disabled={isGenerating || !alertText.trim()}
              >
                <BellIcon className="h-4 w-4 mr-2" />
                {isGenerating ? "Generating..." : "Generate Voice Alerts"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="sensor" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Sensor Data</CardTitle>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="sensor-simulation"
                    checked={sensorSimulation}
                    onCheckedChange={(checked) => {
                      setSensorSimulation(checked)
                      if (checked) {
                        setAutoUpdate(false)
                        toast({
                          title: "Sensor Simulation Started",
                          description: "Automatic voice alerts will be spoken when thresholds are exceeded.",
                        })
                      }
                    }}
                  />
                  <Label htmlFor="sensor-simulation">Real sensor simulation</Label>
                </div>
              </div>
              <CardDescription>
                {sensorSimulation
                  ? "Using simulated real sensor data with automatic voice alerts"
                  : "Simulated environmental sensor readings"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ThermometerIcon className="h-4 w-4 text-red-500" />
                    <Label htmlFor="temperature">Temperature</Label>
                  </div>
                  <span className="text-sm font-medium">{temperature.toFixed(1)}°C</span>
                </div>
                <Slider
                  id="temperature"
                  min={0}
                  max={50}
                  step={0.1}
                  value={[temperature]}
                  onValueChange={(value) => setTemperature(value[0])}
                  disabled={sensorSimulation}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DropletIcon className="h-4 w-4 text-blue-500" />
                    <Label htmlFor="humidity">Humidity</Label>
                  </div>
                  <span className="text-sm font-medium">{humidity.toFixed(1)}%</span>
                </div>
                <Slider
                  id="humidity"
                  min={0}
                  max={100}
                  step={0.1}
                  value={[humidity]}
                  onValueChange={(value) => setHumidity(value[0])}
                  disabled={sensorSimulation}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <WindIcon className="h-4 w-4 text-gray-500" />
                    <Label htmlFor="wind">Wind Speed</Label>
                  </div>
                  <span className="text-sm font-medium">{windSpeed.toFixed(1)} km/h</span>
                </div>
                <Slider
                  id="wind"
                  min={0}
                  max={50}
                  step={0.1}
                  value={[windSpeed]}
                  onValueChange={(value) => setWindSpeed(value[0])}
                  disabled={sensorSimulation}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FlameIcon className="h-4 w-4 text-orange-500" />
                    <Label htmlFor="smoke">Smoke Level</Label>
                  </div>
                  <span className="text-sm font-medium">{smoke.toFixed(0)}</span>
                </div>
                <Slider
                  id="smoke"
                  min={0}
                  max={100}
                  step={1}
                  value={[smoke]}
                  onValueChange={(value) => setSmoke(value[0])}
                  disabled={sensorSimulation}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ZapIcon className="h-4 w-4 text-yellow-500" />
                    <Label htmlFor="gas">Gas Level</Label>
                  </div>
                  <span className="text-sm font-medium">{gas.toFixed(0)}</span>
                </div>
                <Slider
                  id="gas"
                  min={0}
                  max={100}
                  step={1}
                  value={[gas]}
                  onValueChange={(value) => setGas(value[0])}
                  disabled={sensorSimulation}
                />
              </div>

              {!sensorSimulation && (
                <div className="flex items-center space-x-2">
                  <Switch id="auto-update" checked={autoUpdate} onCheckedChange={setAutoUpdate} />
                  <Label htmlFor="auto-update">Simulate random updates</Label>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                onClick={() => handleGenerateAlert("sensor")}
                disabled={isGenerating || sensorSimulation}
              >
                <BellIcon className="h-4 w-4 mr-2" />
                {isGenerating ? "Generating..." : "Generate Voice Alerts"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
