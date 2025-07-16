// This service handles integration with physical sensors
// It provides interfaces and implementations for different types of sensors

import { EventEmitter } from "events"

// Sensor types
export enum SensorType {
  TEMPERATURE = "temperature",
  HUMIDITY = "humidity",
  SMOKE = "smoke",
  GAS = "gas",
  WIND = "wind",
}

// Sensor reading interface
export interface SensorReading {
  type: SensorType
  value: number
  unit: string
  timestamp: number
}

// Alert threshold configuration
export interface AlertThresholds {
  temperature: {
    high: number
    low: number
  }
  humidity: {
    high: number
  }
  wind: {
    high: number
  }
  smoke: {
    threshold: number
  }
  gas: {
    threshold: number
  }
}

// Default alert thresholds
const DEFAULT_THRESHOLDS: AlertThresholds = {
  temperature: {
    high: 35, // °C
    low: 5, // °C
  },
  humidity: {
    high: 85, // %
  },
  wind: {
    high: 30, // km/h
  },
  smoke: {
    threshold: 50, // arbitrary units (0-100)
  },
  gas: {
    threshold: 50, // arbitrary units (0-100)
  },
}

// Sensor manager class
export class SensorManager extends EventEmitter {
  private sensors: Map<string, any> = new Map()
  private readings: Map<SensorType, SensorReading> = new Map()
  private thresholds: AlertThresholds
  private alertState: Map<SensorType, boolean> = new Map()
  private simulationInterval: NodeJS.Timeout | null = null

  constructor(thresholds: Partial<AlertThresholds> = {}) {
    super()
    this.thresholds = { ...DEFAULT_THRESHOLDS, ...thresholds }

    // Initialize alert states
    Object.values(SensorType).forEach((type) => {
      this.alertState.set(type as SensorType, false)
    })
  }

  // Register a physical sensor
  registerSensor(id: string, type: SensorType, sensorObject: any) {
    this.sensors.set(id, { type, sensor: sensorObject })
    console.log(`Registered ${type} sensor with ID: ${id}`)
    return id
  }

  // Update a sensor reading
  updateReading(type: SensorType, value: number, unit: string) {
    const reading: SensorReading = {
      type,
      value,
      unit,
      timestamp: Date.now(),
    }

    this.readings.set(type, reading)
    this.checkThresholds(reading)
    this.emit("reading", reading)
  }

  // Get the latest reading for a sensor type
  getReading(type: SensorType): SensorReading | undefined {
    return this.readings.get(type)
  }

  // Get all current readings
  getAllReadings(): SensorReading[] {
    return Array.from(this.readings.values())
  }

  // Check if a reading exceeds thresholds and emit alerts
  private checkThresholds(reading: SensorReading) {
    let alert = false
    let message = ""

    switch (reading.type) {
      case SensorType.TEMPERATURE:
        if (reading.value > this.thresholds.temperature.high) {
          alert = true
          message = `High temperature alert: ${reading.value.toFixed(1)}°C. Please take precautions against heat.`
        } else if (reading.value < this.thresholds.temperature.low) {
          alert = true
          message = `Low temperature alert: ${reading.value.toFixed(1)}°C. Risk of freezing conditions.`
        }
        break

      case SensorType.HUMIDITY:
        if (reading.value > this.thresholds.humidity.high) {
          alert = true
          message = `High humidity alert: ${reading.value.toFixed(1)}%. Potential for condensation and mold growth.`
        }
        break

      case SensorType.WIND:
        if (reading.value > this.thresholds.wind.high) {
          alert = true
          message = `High wind alert: ${reading.value.toFixed(1)} km/h. Secure loose objects outdoors.`
        }
        break

      case SensorType.SMOKE:
        if (reading.value > this.thresholds.smoke.threshold) {
          alert = true
          message = `Smoke detected: Level ${reading.value.toFixed(0)}. Please check for fire hazards.`
        }
        break

      case SensorType.GAS:
        if (reading.value > this.thresholds.gas.threshold) {
          alert = true
          message = `Gas leak detected: Level ${reading.value.toFixed(0)}. Evacuate the area immediately.`
        }
        break
    }

    // Only emit an alert if the alert state has changed
    const previousAlertState = this.alertState.get(reading.type) || false

    if (alert !== previousAlertState) {
      this.alertState.set(reading.type, alert)

      if (alert) {
        this.emit("alert", {
          type: reading.type,
          message,
          reading,
        })
      } else {
        this.emit("normal", {
          type: reading.type,
          message: `${reading.type} levels have returned to normal: ${reading.value.toFixed(1)} ${reading.unit}`,
          reading,
        })
      }
    }
  }

  // Start simulating sensor data (for demo purposes)
  startSimulation() {
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval)
    }

    // Initialize with some values
    this.updateReading(SensorType.TEMPERATURE, 25, "°C")
    this.updateReading(SensorType.HUMIDITY, 50, "%")
    this.updateReading(SensorType.WIND, 10, "km/h")
    this.updateReading(SensorType.SMOKE, 0, "level")
    this.updateReading(SensorType.GAS, 0, "level")

    // Simulate changes
    this.simulationInterval = setInterval(() => {
      // Get current readings or use defaults
      const temp = this.getReading(SensorType.TEMPERATURE)?.value || 25
      const humidity = this.getReading(SensorType.HUMIDITY)?.value || 50
      const wind = this.getReading(SensorType.WIND)?.value || 10
      const smoke = this.getReading(SensorType.SMOKE)?.value || 0
      const gas = this.getReading(SensorType.GAS)?.value || 0

      // Update with small random changes
      this.updateReading(SensorType.TEMPERATURE, Math.min(Math.max(temp + (Math.random() * 2 - 1), -10), 50), "°C")

      this.updateReading(SensorType.HUMIDITY, Math.min(Math.max(humidity + (Math.random() * 5 - 2.5), 0), 100), "%")

      this.updateReading(SensorType.WIND, Math.min(Math.max(wind + (Math.random() * 3 - 1.5), 0), 50), "km/h")

      // Occasionally simulate smoke or gas detection (1% chance each)
      if (Math.random() < 0.01) {
        this.updateReading(SensorType.SMOKE, Math.min(smoke + Math.random() * 20, 100), "level")
      } else if (smoke > 0) {
        this.updateReading(SensorType.SMOKE, Math.max(smoke - 5, 0), "level")
      }

      if (Math.random() < 0.01) {
        this.updateReading(SensorType.GAS, Math.min(gas + Math.random() * 20, 100), "level")
      } else if (gas > 0) {
        this.updateReading(SensorType.GAS, Math.max(gas - 5, 0), "level")
      }
    }, 3000)

    return this
  }

  // Stop simulation
  stopSimulation() {
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval)
      this.simulationInterval = null
    }
    return this
  }

  // Set custom thresholds
  setThresholds(thresholds: Partial<AlertThresholds>) {
    this.thresholds = { ...this.thresholds, ...thresholds }
    return this
  }

  // Connect to a real sensor (implementation would depend on hardware)
  // This is a placeholder for real hardware integration
  connectToHardwareSensor(type: SensorType, config: any) {
    console.log(`Connecting to ${type} sensor with config:`, config)

    // In a real implementation, you would:
    // 1. Initialize hardware communication (e.g., GPIO, I2C, Serial)
    // 2. Set up event listeners for sensor data
    // 3. Register the sensor with this manager

    // Example for a temperature sensor using a hypothetical library:
    /*
    import { TemperatureSensor } from 'hardware-sensors';
    
    const sensor = new TemperatureSensor(config.pin);
    sensor.on('reading', (value) => {
      this.updateReading(SensorType.TEMPERATURE, value, '°C');
    });
    
    const id = `${type}_${Date.now()}`;
    this.registerSensor(id, type, sensor);
    return id;
    */

    // For demo purposes, just return a fake ID
    const id = `${type}_${Date.now()}`
    return id
  }
}

// Create and export a singleton instance
export const sensorManager = new SensorManager()
