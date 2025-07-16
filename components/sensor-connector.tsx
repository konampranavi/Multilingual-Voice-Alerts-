"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SensorType, sensorManager } from "@/lib/sensor-service"
import { ThermometerIcon, DropletIcon, WindIcon, FlameIcon, ZapIcon } from "lucide-react"

interface SensorConnectorProps {
  onConnect?: (sensorId: string, type: SensorType) => void
}

export function SensorConnector({ onConnect }: SensorConnectorProps) {
  const [sensorType, setSensorType] = useState<SensorType>(SensorType.TEMPERATURE)
  const [connectionString, setConnectionString] = useState("")
  const [isConnecting, setIsConnecting] = useState(false)

  const handleConnect = () => {
    setIsConnecting(true)

    try {
      // Parse the connection string
      // In a real app, this would be a proper format for your hardware
      const config = {
        port: connectionString.includes("port=") ? connectionString.split("port=")[1].split(" ")[0] : "/dev/ttyUSB0",
        pin: connectionString.includes("pin=") ? Number.parseInt(connectionString.split("pin=")[1].split(" ")[0]) : 0,
        address: connectionString.includes("address=") ? connectionString.split("address=")[1].split(" ")[0] : "0x76",
      }

      // Connect to the sensor
      const sensorId = sensorManager.connectToHardwareSensor(sensorType, config)

      if (onConnect) {
        onConnect(sensorId, sensorType)
      }

      // Reset the form
      setConnectionString("")
    } catch (error) {
      console.error("Failed to connect to sensor:", error)
    } finally {
      setIsConnecting(false)
    }
  }

  const getSensorIcon = () => {
    switch (sensorType) {
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

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          {getSensorIcon()}
          <CardTitle>Connect Sensor</CardTitle>
        </div>
        <CardDescription>Connect a physical sensor to receive real-time data</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="sensor-type">Sensor Type</Label>
          <Select value={sensorType} onValueChange={(value) => setSensorType(value as SensorType)}>
            <SelectTrigger id="sensor-type">
              <SelectValue placeholder="Select sensor type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={SensorType.TEMPERATURE}>Temperature Sensor</SelectItem>
              <SelectItem value={SensorType.HUMIDITY}>Humidity Sensor</SelectItem>
              <SelectItem value={SensorType.WIND}>Wind Speed Sensor</SelectItem>
              <SelectItem value={SensorType.SMOKE}>Smoke Detector</SelectItem>
              <SelectItem value={SensorType.GAS}>Gas Detector</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="connection-string">Connection String</Label>
          <Input
            id="connection-string"
            placeholder="port=/dev/ttyUSB0 pin=4 address=0x76"
            value={connectionString}
            onChange={(e) => setConnectionString(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Format depends on your sensor type. Examples:
            <br />• GPIO: <code>pin=4</code>
            <br />• I2C: <code>address=0x76 bus=1</code>
            <br />• Serial: <code>port=/dev/ttyUSB0 baud=9600</code>
          </p>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full" onClick={handleConnect} disabled={isConnecting || !connectionString.trim()}>
          {isConnecting ? "Connecting..." : "Connect Sensor"}
        </Button>
      </CardFooter>
    </Card>
  )
}
