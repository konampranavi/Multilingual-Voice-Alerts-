"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SensorConnector } from "@/components/sensor-connector"
import { SensorType, sensorManager } from "@/lib/sensor-service"
import {
  ThermometerIcon,
  DropletIcon,
  WindIcon,
  FlameIcon,
  ZapIcon,
  PlusCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
  AlertCircleIcon,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ConnectedSensor {
  id: string
  type: SensorType
  status: "connected" | "error" | "disconnected"
  lastReading?: {
    value: number
    unit: string
    timestamp: number
  }
}

// Sample sensor data for demonstration
const sampleSensorData = {
  [SensorType.TEMPERATURE]: {
    value: 24.5,
    unit: "°C",
    timestamp: Date.now(),
    status: "Sample data",
    description: "Normal room temperature",
    thresholds: {
      high: "Above 35°C",
      low: "Below 5°C",
    },
  },
  [SensorType.HUMIDITY]: {
    value: 55.2,
    unit: "%",
    timestamp: Date.now(),
    status: "Sample data",
    description: "Comfortable humidity level",
    thresholds: {
      high: "Above 85%",
    },
  },
  [SensorType.WIND]: {
    value: 15.7,
    unit: "km/h",
    timestamp: Date.now(),
    status: "Sample data",
    description: "Moderate breeze",
    thresholds: {
      high: "Above 30 km/h",
    },
  },
  [SensorType.SMOKE]: {
    value: 12,
    unit: "level",
    timestamp: Date.now(),
    status: "Sample data",
    description: "Low smoke level - normal",
    thresholds: {
      threshold: "Above 50",
    },
  },
  [SensorType.GAS]: {
    value: 8,
    unit: "level",
    timestamp: Date.now(),
    status: "Sample data",
    description: "Low gas level - normal",
    thresholds: {
      threshold: "Above 50",
    },
  },
}

export default function HardwarePage() {
  const { toast } = useToast()
  const [connectedSensors, setConnectedSensors] = useState<ConnectedSensor[]>([])
  const [showSampleData, setShowSampleData] = useState(true)
  const [simulationActive, setSimulationActive] = useState(false)

  // Handle sensor connection
  const handleSensorConnect = (sensorId: string, type: SensorType) => {
    // Add the sensor to our list
    setConnectedSensors((prev) => [
      ...prev,
      {
        id: sensorId,
        type,
        status: "connected",
      },
    ])

    toast({
      title: "Sensor Connected",
      description: `${type} sensor has been connected successfully.`,
    })
  }

  // Handle sensor disconnection
  const handleSensorDisconnect = (sensorId: string) => {
    // In a real app, you would call a method to disconnect the sensor
    // sensorManager.disconnectSensor(sensorId)

    // Update our list
    setConnectedSensors((prev) =>
      prev.map((sensor) => (sensor.id === sensorId ? { ...sensor, status: "disconnected" } : sensor)),
    )

    toast({
      title: "Sensor Disconnected",
      description: "The sensor has been disconnected.",
    })
  }

  // Get icon for sensor type
  const getSensorIcon = (type: SensorType) => {
    switch (type) {
      case SensorType.TEMPERATURE:
        return <ThermometerIcon className="h-5 w-5 text-red-500" />
      case SensorType.HUMIDITY:
        return <DropletIcon className="h-5 w-5 text-blue-500" />
      case SensorType.WIND:
        return <WindIcon className="h-5 w-5 text-gray-500" />
      case SensorType.SMOKE:
        return <FlameIcon className="h-5 w-5 text-orange-500" />
      case SensorType.GAS:
        return <ZapIcon className="h-5 w-5 text-yellow-500" />
    }
  }

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "connected":
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />
      case "error":
        return <XCircleIcon className="h-4 w-4 text-red-500" />
      case "disconnected":
        return <XCircleIcon className="h-4 w-4 text-gray-500" />
      default:
        return <AlertCircleIcon className="h-4 w-4 text-blue-500" />
    }
  }

  // Start or stop sensor simulation
  const toggleSensorSimulation = () => {
    if (simulationActive) {
      sensorManager.stopSimulation()
      setSimulationActive(false)
      toast({
        title: "Simulation Stopped",
        description: "Sensor simulation has been stopped.",
      })
    } else {
      sensorManager.startSimulation()
      setSimulationActive(true)
      toast({
        title: "Simulation Started",
        description: "Sensor simulation is now running. Check the dashboard for data and listen for voice alerts.",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Hardware Setup</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Connected Sensors</CardTitle>
              <CardDescription>Physical sensors connected to your system</CardDescription>
            </CardHeader>
            <CardContent>
              {connectedSensors.length > 0 ? (
                <div className="space-y-4">
                  {connectedSensors.map((sensor) => (
                    <div key={sensor.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getSensorIcon(sensor.type)}
                        <div>
                          <div className="font-medium">
                            {sensor.type.charAt(0).toUpperCase() + sensor.type.slice(1)} Sensor
                          </div>
                          <div className="text-sm text-muted-foreground flex items-center gap-1">
                            {getStatusIcon(sensor.status)}
                            <span>{sensor.status.charAt(0).toUpperCase() + sensor.status.slice(1)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {sensor.lastReading && (
                          <div className="text-sm font-medium">
                            {sensor.lastReading.value.toFixed(1)} {sensor.lastReading.unit}
                          </div>
                        )}

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSensorDisconnect(sensor.id)}
                          disabled={sensor.status === "disconnected"}
                        >
                          Disconnect
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : showSampleData ? (
                <div className="space-y-4">
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-md mb-4">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      These are sample sensors to demonstrate the system. Connect real sensors or use the simulation
                      below.
                    </p>
                  </div>

                  {Object.entries(sampleSensorData).map(([type, data]) => (
                    <div key={type} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getSensorIcon(type as SensorType)}
                        <div>
                          <div className="font-medium">{type.charAt(0).toUpperCase() + type.slice(1)} Sensor</div>
                          <div className="text-sm text-muted-foreground flex items-center gap-1">
                            {getStatusIcon(data.status)}
                            <span>{data.status}</span>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">{data.description}</div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1">
                        <div className="text-sm font-medium">
                          {data.value.toFixed(1)} {data.unit}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Alert: {Object.entries(data.thresholds)[0][1]}
                        </div>
                      </div>
                    </div>
                  ))}

                  <Button variant="outline" className="w-full" onClick={() => setShowSampleData(false)}>
                    Hide Sample Data
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <PlusCircleIcon className="h-12 w-12 text-muted-foreground/50 mb-2" />
                  <h3 className="font-medium mb-1">No sensors connected</h3>
                  <p className="text-sm text-muted-foreground">Connect a sensor using the form on the right</p>
                  <Button variant="link" onClick={() => setShowSampleData(true)} className="mt-4">
                    Show Sample Data
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sensor Simulation</CardTitle>
              <CardDescription>Don't have physical sensors? Use our simulation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Our sensor simulation creates realistic sensor data and triggers alerts based on thresholds. This is
                perfect for testing your alert system without physical hardware.
              </p>

              <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-md">
                <p className="text-sm text-green-800 dark:text-green-200">
                  <strong>Voice Alert Testing:</strong> The simulation will occasionally trigger alerts when sensor
                  values exceed thresholds. You'll hear voice alerts in your selected languages!
                </p>
              </div>

              <Button
                className="w-full"
                variant={simulationActive ? "destructive" : "default"}
                onClick={toggleSensorSimulation}
              >
                {simulationActive ? "Stop Sensor Simulation" : "Start Sensor Simulation"}
              </Button>
            </CardContent>
          </Card>
        </div>

        <SensorConnector onConnect={handleSensorConnect} />
      </div>
    </div>
  )
}
