import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MicIcon, AlertCircleIcon, LanguagesIcon } from "lucide-react"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircleIcon className="h-6 w-6 text-red-500" />
            <span className="text-xl font-bold">VoiceAlert</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/sign-in">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/sign-up">
              <Button>Sign Up</Button>
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <section className="py-12 md:py-24 lg:py-32 bg-gradient-to-b from-white to-gray-100 dark:from-gray-950 dark:to-gray-900">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                    Multilingual Voice Alerts for Any Environment
                  </h1>
                  <p className="max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                    Get critical alerts in multiple languages, powered by AI. Connect to sensors or create manual
                    alerts.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href="/sign-up">
                    <Button size="lg" className="w-full min-[400px]:w-auto">
                      Get Started
                    </Button>
                  </Link>
                  <Link href="/demo">
                    <Button size="lg" variant="outline" className="w-full min-[400px]:w-auto">
                      Try Demo
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="mx-auto lg:ml-auto flex justify-center">
                <div className="relative w-full max-w-[500px] aspect-video rounded-xl bg-gradient-to-br from-red-100 to-blue-100 dark:from-red-950/30 dark:to-blue-950/30 p-6 flex items-center justify-center">
                  <div className="flex flex-col items-center gap-4">
                    <MicIcon className="h-16 w-16 text-red-500" />
                    <div className="flex gap-2">
                      <div className="h-3 w-16 bg-red-400 rounded-full animate-pulse"></div>
                      <div className="h-3 w-24 bg-blue-400 rounded-full animate-pulse delay-75"></div>
                      <div className="h-3 w-12 bg-green-400 rounded-full animate-pulse delay-150"></div>
                    </div>
                    <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                      Voice alerts in your preferred languages
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Key Features</h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                  Our platform provides everything you need for multilingual voice alerts
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3 lg:gap-12 mt-8">
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
                <LanguagesIcon className="h-12 w-12 text-blue-500" />
                <h3 className="text-xl font-bold">Multiple Languages</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                  Select up to 3 preferred languages for your alerts
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
                <AlertCircleIcon className="h-12 w-12 text-red-500" />
                <h3 className="text-xl font-bold">Dual Input Modes</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                  Manual text input or real-time sensor data
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
                <MicIcon className="h-12 w-12 text-green-500" />
                <h3 className="text-xl font-bold">Natural Voice</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                  High-quality voice synthesis in multiple languages
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
          <p className="text-sm text-gray-500 dark:text-gray-400">© 2025 VoiceAlert. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/terms" className="text-sm text-gray-500 hover:underline dark:text-gray-400">
              Terms
            </Link>
            <Link href="/privacy" className="text-sm text-gray-500 hover:underline dark:text-gray-400">
              Privacy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
