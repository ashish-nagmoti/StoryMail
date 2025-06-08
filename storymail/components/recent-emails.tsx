"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Clock } from "lucide-react"

const recentEmails = [
  {
    id: "1",
    sender: "Sarah Johnson",
    subject: "Project Alpha - Final Review",
    category: "Productivity",
    time: "2 hours ago",
    avatar: "/placeholder.svg?height=32&width=32",
    unread: true,
  },
  {
    id: "2",
    sender: "Marketing Team",
    subject: "Client Presentation Materials",
    category: "Office",
    time: "4 hours ago",
    avatar: "/placeholder.svg?height=32&width=32",
    unread: true,
  },
  {
    id: "3",
    sender: "Tech Weekly",
    subject: "Latest AI Developments",
    category: "Newsletter",
    time: "6 hours ago",
    avatar: "/placeholder.svg?height=32&width=32",
    unread: false,
  },
  {
    id: "4",
    sender: "Finance Department",
    subject: "Budget Approval Required",
    category: "Productivity",
    time: "1 day ago",
    avatar: "/placeholder.svg?height=32&width=32",
    unread: false,
  },
]

const getCategoryColor = (category: string) => {
  switch (category) {
    case "Productivity":
      return "bg-blue-500/10 text-blue-500 border-blue-500/20"
    case "Office":
      return "bg-purple-500/10 text-purple-500 border-purple-500/20"
    case "Newsletter":
      return "bg-green-500/10 text-green-500 border-green-500/20"
    default:
      return "bg-gray-500/10 text-gray-500 border-gray-500/20"
  }
}

export function RecentEmails() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Clock className="mr-2 h-5 w-5" />
          Recent Activity
        </CardTitle>
        <CardDescription>Latest emails processed by StoryMail</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {recentEmails.map((email) => (
          <div key={email.id} className="flex items-start space-x-3 p-3 hover:bg-muted/30 rounded-lg transition-colors">
            <Avatar className="h-8 w-8">
              <AvatarImage src={email.avatar || "/placeholder.svg"} />
              <AvatarFallback>
                {email.sender
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium truncate">{email.sender}</p>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className={getCategoryColor(email.category)}>
                    {email.category}
                  </Badge>
                  {email.unread && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                </div>
              </div>
              <p className="text-sm text-muted-foreground truncate">{email.subject}</p>
              <p className="text-xs text-muted-foreground">{email.time}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
