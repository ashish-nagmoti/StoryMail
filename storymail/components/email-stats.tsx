"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Mail } from "lucide-react"

export function EmailStats() {
  const stats = [
    {
      title: "Response Time",
      value: "2.4 hours",
      change: "-12%",
      trend: "down",
      description: "Average response time this week",
    },
    {
      title: "Email Volume",
      value: "156",
      change: "+8%",
      trend: "up",
      description: "Emails received this week",
    },
    {
      title: "Processing Rate",
      value: "94%",
      change: "+3%",
      trend: "up",
      description: "Emails processed automatically",
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Mail className="mr-2 h-5 w-5" />
          Email Statistics
        </CardTitle>
        <CardDescription>Your email performance metrics for this week</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {stats.map((stat, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
            <div>
              <div className="font-medium">{stat.title}</div>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.description}</div>
            </div>
            <div className={`flex items-center text-sm ${stat.trend === "up" ? "text-green-500" : "text-red-500"}`}>
              {stat.trend === "up" ? (
                <TrendingUp className="mr-1 h-4 w-4" />
              ) : (
                <TrendingDown className="mr-1 h-4 w-4" />
              )}
              {stat.change}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
