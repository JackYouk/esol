"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Error({
  error,
  reset,
}: {
  error: Error
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <h1 className="text-4xl font-bold mb-4">Oops! Something went wrong</h1>
      <p className="text-xl mb-8 text-muted-foreground">We apologize for the inconvenience.</p>
      <div className="flex space-x-4">
        <Button onClick={reset}>Try again</Button>
        <Link href="/" passHref>
          <Button variant="outline">Return to Home</Button>
        </Link>
      </div>
    </div>
  )
}

