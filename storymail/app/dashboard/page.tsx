"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Mail, MessageSquare, BarChart3, FileText, Zap } from "lucide-react"
import { EmailStats } from "@/components/email-stats"
import { RecentEmails } from "@/components/recent-emails"
import { CategoryChart } from "@/components/category-chart"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import Link from "next/link"

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Define interfaces for the dashboard data
interface CategoryDistribution {
  [key: string]: number;
}

interface EmailStat {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down";
  description: string;
}

interface DashboardStats {
  total_emails: number;
  weekly_change_percent: number;
  unread_emails: number;
  unread_change: number;
  unique_categories: number;
  category_distribution: CategoryDistribution;
  digest_status: string;
  next_digest: string;
  email_stats: EmailStat[];
}

export default function DashboardPage() {
  const { user, isLoading, accessToken } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoadingStats, setIsLoadingStats] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  // Fetch dashboard stats from the API
  useEffect(() => {
    const fetchDashboardStats = async () => {
      if (!user) return;
      
      setIsLoadingStats(true);
      try {
        const idToken = localStorage.getItem('storymail-id-token');
        
        const response = await fetch(`${API_URL}/api/dashboard/stats/`, {
          headers: {
            'Authorization': `Bearer ${idToken}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard stats');
        }
        
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        toast({
          title: "Error loading dashboard",
          description: "Could not load your dashboard statistics. Please try again later.",
          variant: "destructive"
        });
      } finally {
        setIsLoadingStats(false);
      }
    };
    
    fetchDashboardStats();
  }, [user, toast]);

  // Handle button actions
  const handleGenerateDigest = () => {
    router.push('/digest');
  };

  const handleChatWithEmails = () => {
    router.push('/chat');
  };

  const handleViewAnalytics = () => {
    router.push('/categories');
  };

  const handleSyncEmails = async () => {
    toast({
      title: "Syncing emails",
      description: "This feature will be available soon!"
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Please sign in to access the dashboard.</p>
        </div>
      </div>
    )
  }

  // Show loading state while fetching stats
  const isStatsLoading = !stats && isLoadingStats;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        
        {/* Welcome Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Welcome back, {user.name}!</h1>
            <p className="text-muted-foreground mt-2">Here's what's happening with your emails today.</p>
          </div>
          <Badge variant="secondary" className="bg-green-500/10 text-green-500 border-green-500/20">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            All systems operational
          </Badge>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Emails</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isStatsLoading ? (
                <div className="h-10 bg-muted animate-pulse rounded-md"></div>
              ) : (
                <>
                  <div className="text-2xl font-bold">{stats?.total_emails || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    <span className={stats?.weekly_change_percent && stats.weekly_change_percent > 0 ? "text-green-500" : "text-red-500"}>
                      {stats?.weekly_change_percent ? (stats.weekly_change_percent > 0 ? "+" : "") + stats.weekly_change_percent + "%" : "0%"}
                    </span> from last week
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unread</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isStatsLoading ? (
                <div className="h-10 bg-muted animate-pulse rounded-md"></div>
              ) : (
                <>
                  <div className="text-2xl font-bold">{stats?.unread_emails || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    <span className={stats?.unread_change && stats.unread_change > 0 ? "text-red-500" : "text-green-500"}>
                      {stats?.unread_change ? (stats.unread_change > 0 ? "+" : "") + stats.unread_change : "0"}
                    </span> since yesterday
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Categories</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isStatsLoading ? (
                <div className="h-10 bg-muted animate-pulse rounded-md"></div>
              ) : (
                <>
                  <div className="text-2xl font-bold">{stats?.unique_categories || 0}</div>
                  <p className="text-xs text-muted-foreground">Active classification types</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Weekly Digest</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isStatsLoading ? (
                <div className="h-10 bg-muted animate-pulse rounded-md"></div>
              ) : (
                <>
                  <div className="text-2xl font-bold">{stats?.digest_status || "Not generated"}</div>
                  <p className="text-xs text-muted-foreground">Next: {stats?.next_digest || "Sunday 9:00 AM"}</p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Email Categories Chart */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Email Categories</CardTitle>
              <CardDescription>Distribution of your emails by category this week</CardDescription>
            </CardHeader>
            <CardContent>
              {isStatsLoading ? (
                <div className="h-64 bg-muted animate-pulse rounded-md"></div>
              ) : (
                <CategoryChart categoryData={stats?.category_distribution} />
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks and shortcuts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                className="w-full justify-start" 
                variant="outline" 
                onClick={handleChatWithEmails}
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                Chat with Emails
              </Button>
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={handleGenerateDigest}
              >
                <FileText className="mr-2 h-4 w-4" />
                Generate Weekly Digest
              </Button>
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={handleViewAnalytics}
              >
                <BarChart3 className="mr-2 h-4 w-4" />
                View Analytics
              </Button>
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={handleSyncEmails}
              >
                <Zap className="mr-2 h-4 w-4" />
                Sync Emails
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <EmailStats stats={stats?.email_stats} isLoading={isStatsLoading} />
          <RecentEmails isLoading={isStatsLoading} />
        </div>
      </div>
    </DashboardLayout>
  )
}
