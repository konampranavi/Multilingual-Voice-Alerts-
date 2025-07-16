"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AlertCircleIcon, SettingsIcon, BellIcon, HistoryIcon, LogOutIcon, HardDriveIcon } from "lucide-react"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [user, setUser] = useState<{ name: string; email: string } | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const storedUser = localStorage.getItem("user")

    if (storedUser) {
      setUser(JSON.parse(storedUser))
    } else {
      router.push("/sign-in")
    }
  }, [router])

  const handleSignOut = () => {
    localStorage.removeItem("user")
    router.push("/")
  }

  if (!mounted || !user) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b bg-background">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/dashboard" className="flex items-center gap-2">
              <AlertCircleIcon className="h-6 w-6 text-red-500" />
              <span className="font-bold">VoiceAlert</span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden md:inline-block">{user.name}</span>
            <Button variant="ghost" size="icon" onClick={handleSignOut}>
              <LogOutIcon className="h-5 w-5" />
              <span className="sr-only">Sign out</span>
            </Button>
          </div>
        </div>
      </header>
      <div className="flex flex-1">
        <aside className="hidden w-64 border-r bg-muted/40 md:block">
          <div className="flex h-full flex-col gap-2 p-4">
            <Link href="/dashboard">
              <Button variant="ghost" className="w-full justify-start gap-2">
                <BellIcon className="h-5 w-5" />
                Create Alert
              </Button>
            </Link>
            <Link href="/dashboard/history">
              <Button variant="ghost" className="w-full justify-start gap-2">
                <HistoryIcon className="h-5 w-5" />
                Alert History
              </Button>
            </Link>
            <Link href="/dashboard/hardware">
              <Button variant="ghost" className="w-full justify-start gap-2">
                <HardDriveIcon className="h-5 w-5" />
                Hardware Setup
              </Button>
            </Link>
            <Link href="/dashboard/settings">
              <Button variant="ghost" className="w-full justify-start gap-2">
                <SettingsIcon className="h-5 w-5" />
                Settings
              </Button>
            </Link>
            <div className="flex-1"></div>
            <Button variant="outline" className="w-full justify-start gap-2" onClick={handleSignOut}>
              <LogOutIcon className="h-5 w-5" />
              Sign out
            </Button>
          </div>
        </aside>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}
