"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Filter } from "lucide-react"
import { EmailList } from "@/components/email-list"

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilters, setActiveFilters] = useState<string[]>([])

  const filters = [
    { id: "unread", label: "Unread", count: 23 },
    { id: "starred", label: "Starred", count: 12 },
    { id: "attachments", label: "Has Attachments", count: 45 },
    { id: "important", label: "Important", count: 8 },
  ]

  const toggleFilter = (filterId: string) => {
    setActiveFilters((prev) => (prev.includes(filterId) ? prev.filter((id) => id !== filterId) : [...prev, filterId]))
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <Search className="mr-3 h-8 w-8" />
              Search Emails
            </h1>
            <p className="text-muted-foreground mt-2">Find emails quickly with powerful search and filtering</p>
          </div>
        </div>

        {/* Search Bar */}
        <Card>
          <CardContent className="p-6">
            <div className="flex space-x-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search emails by sender, subject, or content..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button>
                <Search className="mr-2 h-4 w-4" />
                Search
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="mr-2 h-5 w-5" />
              Filters
            </CardTitle>
            <CardDescription>Refine your search with these filters</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {filters.map((filter) => (
                <Badge
                  key={filter.id}
                  variant={activeFilters.includes(filter.id) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleFilter(filter.id)}
                >
                  {filter.label} ({filter.count})
                </Badge>
              ))}
            </div>

            {activeFilters.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Active filters: {activeFilters.length}</span>
                  <Button variant="ghost" size="sm" onClick={() => setActiveFilters([])}>
                    Clear all
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Search Results */}
        <Card>
          <CardHeader>
            <CardTitle>Search Results</CardTitle>
            <CardDescription>
              {searchQuery ? `Results for "${searchQuery}"` : "Enter a search query to see results"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="all">All Results</TabsTrigger>
                <TabsTrigger value="productivity">Productivity</TabsTrigger>
                <TabsTrigger value="newsletters">Newsletters</TabsTrigger>
                <TabsTrigger value="office">Office</TabsTrigger>
                <TabsTrigger value="scam">Scam</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-6">
                {searchQuery ? (
                  <div className="space-y-4">
                    <div className="text-sm text-muted-foreground">Found 156 emails matching your search criteria</div>
                    <EmailList category="productivity" />
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">Enter a search query to see results</div>
                )}
              </TabsContent>

              <TabsContent value="productivity" className="mt-6">
                <EmailList category="productivity" />
              </TabsContent>

              <TabsContent value="newsletters" className="mt-6">
                <EmailList category="newsletters" />
              </TabsContent>

              <TabsContent value="office" className="mt-6">
                <EmailList category="office" />
              </TabsContent>

              <TabsContent value="scam" className="mt-6">
                <EmailList category="scam" />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
