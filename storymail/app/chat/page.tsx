"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, MessagesSquare, LightbulbIcon } from "lucide-react"
import { EmailChat } from "@/components/email-chat"

export default function ChatPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <MessagesSquare className="mr-3 h-8 w-8" />
              Email Assistant
            </h1>
            <p className="text-muted-foreground mt-2">
              Ask questions about your emails and get AI-powered insights
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <EmailChat />
          </div>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <LightbulbIcon className="h-5 w-5 mr-2 text-yellow-500" />
                  Sample Questions
                </CardTitle>
                <CardDescription>Try asking these questions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg bg-muted p-3">
                  <p className="font-medium text-sm">Summarize my newsletters</p>
                </div>
                <div className="rounded-lg bg-muted p-3">
                  <p className="font-medium text-sm">What work emails did I receive this week?</p>
                </div>
                <div className="rounded-lg bg-muted p-3">
                  <p className="font-medium text-sm">Show me emails about AI projects</p>
                </div>
                <div className="rounded-lg bg-muted p-3">
                  <p className="font-medium text-sm">Are there any scam emails I should delete?</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Sparkles className="h-5 w-5 mr-2 text-primary" />
                  About
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  The Email Assistant uses AI to help you understand and organize your emails. 
                  Ask questions in natural language, and it will analyze your emails to provide 
                  insights, summaries, and help you find what you need.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
