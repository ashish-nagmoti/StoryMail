"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Mail } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface EmailStat {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down";
  description: string;
}

interface EmailStatsProps {
  stats?: EmailStat[];
  isLoading?: boolean;
}

export function EmailStats({ stats, isLoading = false }: EmailStatsProps) {
  // Default stats if none are provided
  const defaultStats = [
    {
      title: "Response Time",
      value: "2.4 hours",
      change: "-12%",
      trend: "down" as const,
      description: "Average response time this week",
    },
    {
      title: "Email Volume",
      value: "156",
      change: "+8%",
      trend: "up" as const,
      description: "Emails received this week",
    },
    {
      title: "Processing Rate",
      value: "94%",
      change: "+3%",
      trend: "up" as const,
      description: "Emails processed automatically",
    },
  ]

  // Use provided stats or default if not available
  const displayStats = stats || defaultStats;

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
        {isLoading ? (
          // Loading skeletons
          Array(3).fill(0).map((_, i) => (
            <div key={i} className="p-3 bg-muted/30 rounded-lg">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-20 mb-1" />
              <Skeleton className="h-4 w-36" />
            </div>
          ))
        ) : (
          displayStats.map((stat, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div>
                <div className="font-medium">{stat.title}</div>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.description}</div>
              </div>
              <div className={`flex items-center text-sm ${stat.trend === "up" ? 
                (stat.title === "Response Time" ? "text-red-500" : "text-green-500") : 
                (stat.title === "Response Time" ? "text-green-500" : "text-red-500")}`}>
                {stat.trend === "up" ? (
                  <TrendingUp className="mr-1 h-4 w-4" />
                ) : (
                  <TrendingDown className="mr-1 h-4 w-4" />
                )}
                {stat.change}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
