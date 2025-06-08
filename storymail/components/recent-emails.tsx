"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { useRouter } from "next/navigation"

interface Email {
  id: number;
  from_name: string;
  from_email: string;
  subject: string;
  category: string;
  date: string;
}

interface RecentEmailsProps {
  isLoading?: boolean;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export function RecentEmails({ isLoading = false }: RecentEmailsProps) {
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  
  // Return initials from a name
  const getInitials = (name: string): string => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Get color based on category
  const getCategoryColor = (category: string): string => {
    const categoryColors: Record<string, string> = {
      productivity: "bg-blue-100 text-blue-800 border-blue-200",
      newsletters: "bg-green-100 text-green-800 border-green-200",
      work: "bg-purple-100 text-purple-800 border-purple-200",
      scam: "bg-red-100 text-red-800 border-red-200",
      personal: "bg-amber-100 text-amber-800 border-amber-200",
    };
    
    return categoryColors[category?.toLowerCase()] || "bg-gray-100 text-gray-800 border-gray-200";
  };
  
  // Format date
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.round(diffMs / 60000);
      const diffHours = Math.round(diffMs / 3600000);
      const diffDays = Math.round(diffMs / 86400000);
      
      if (diffMins < 60) {
        return `${diffMins}m ago`;
      } else if (diffHours < 24) {
        return `${diffHours}h ago`;
      } else if (diffDays === 1) {
        return 'Yesterday';
      } else if (diffDays < 7) {
        return `${diffDays}d ago`;
      } else {
        return date.toLocaleDateString();
      }
    } catch (e) {
      return dateString;
    }
  };

  useEffect(() => {
    const fetchRecentEmails = async () => {
      if (isLoading) return;
      
      setLoading(true);
      try {
        const idToken = localStorage.getItem('storymail-id-token');
        
        const response = await fetch(`${API_URL}/api/emails/?limit=5`, {
          headers: {
            'Authorization': `Bearer ${idToken}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch recent emails');
        }
        
        const data = await response.json();
        setEmails(data);
      } catch (error) {
        console.error('Error fetching recent emails:', error);
        setError('Could not load recent emails');
      } finally {
        setLoading(false);
      }
    };
    
    fetchRecentEmails();
  }, [isLoading]);

  // Handle email click
  const handleEmailClick = (emailId: number) => {
    router.push(`/email/${emailId}`);
  };
  
  // Default emails to show if no data is available
  const defaultEmails = [
    {
      id: 1,
      from_name: "Ashish Kumar",
      from_email: "ashish@example.com",
      subject: "Meeting scheduled for tomorrow",
      category: "Work",
      date: new Date(Date.now() - 3600000).toISOString() // 1 hour ago
    },
    {
      id: 2,
      from_name: "GitHub",
      from_email: "noreply@github.com",
      subject: "Pull request review requested",
      category: "Productivity",
      date: new Date(Date.now() - 7200000).toISOString() // 2 hours ago
    },
    {
      id: 3,
      from_name: "Sarah Wilson",
      from_email: "sarah@example.com",
      subject: "Project status update",
      category: "Work",
      date: new Date(Date.now() - 86400000).toISOString() // 1 day ago
    },
    {
      id: 4,
      from_name: "Medium Digest",
      from_email: "noreply@medium.com",
      subject: "Top stories for you: AI trends and more",
      category: "Newsletters",
      date: new Date(Date.now() - 172800000).toISOString() // 2 days ago
    },
  ];

  // Show loading skeleton
  if (loading || isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Emails</CardTitle>
          <CardDescription>Your latest emails</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {Array(4).fill(0).map((_, i) => (
            <div key={i} className="flex items-start space-x-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-full max-w-[250px]" />
                <Skeleton className="h-4 w-full max-w-[200px]" />
              </div>
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  // Show error state
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Emails</CardTitle>
          <CardDescription>Your latest emails</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-6 text-muted-foreground">
            {error}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Display emails (use actual data or fallback to defaults if empty)
  const displayEmails = emails.length > 0 ? emails : defaultEmails;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Emails</CardTitle>
        <CardDescription>Your latest emails</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {displayEmails.map((email) => (
          <div 
            key={email.id} 
            className="flex items-start space-x-4 cursor-pointer hover:bg-muted/50 p-2 rounded-md transition-colors"
            onClick={() => handleEmailClick(email.id)}
          >
            <Avatar>
              <AvatarImage src="" alt={email.from_name} />
              <AvatarFallback>{getInitials(email.from_name)}</AvatarFallback>
            </Avatar>
            <div className="space-y-1 flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <p className="text-sm font-medium leading-none truncate max-w-[180px]">
                  {email.from_name}
                </p>
                <Badge variant="outline" className={getCategoryColor(email.category)}>
                  {email.category}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground truncate">
                {email.subject}
              </p>
            </div>
            <div className="text-xs text-muted-foreground whitespace-nowrap">
              {formatDate(email.date)}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
