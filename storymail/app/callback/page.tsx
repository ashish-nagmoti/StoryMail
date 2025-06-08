"use client"

import { useEffect } from "react"
import { Loader2 } from "lucide-react"

export default function CallbackPage() {
  useEffect(() => {
    // The callback handling is done in the AuthProvider component
    // This page just shows a loading state while that happens
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="text-center text-white">
        <Loader2 className="h-16 w-16 animate-spin mx-auto mb-4 text-purple-400" />
        <h1 className="text-2xl font-semibold mb-2">Logging you in...</h1>
        <p className="text-gray-300">Please wait while we complete the authentication process.</p>
      </div>
    </div>
  )
}