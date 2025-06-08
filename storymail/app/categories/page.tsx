"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart3, Search, Filter, Mail, AlertTriangle, Briefcase, BookOpen } from "lucide-react"
import { EmailList } from "@/components/email-list"
import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth-provider"

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
const baseCategories = [
	{
		id: "productivity",
		name: "Productivity",
		icon: Briefcase,
		color: "bg-blue-500/10 text-blue-500 border-blue-500/20",
		description: "Work-related emails, project updates, and task assignments",
	},
	{
		id: "newsletters",
		name: "Newsletters",
		icon: BookOpen,
		color: "bg-green-500/10 text-green-500 border-green-500/20",
		description: "Subscriptions, updates, and informational content",
	},
	{
		id: "work",
		name: "Work",
		icon: Mail,
		color: "bg-purple-500/10 text-purple-500 border-purple-500/20",
		description: "Internal communications and office announcements",
	},
	{
		id: "scam",
		name: "Scam",
		icon: AlertTriangle,
		color: "bg-red-500/10 text-red-500 border-red-500/20",
		description: "Suspicious emails and potential security threats",
	},
	{
		id: "other",
		name: "Other",
		icon: BarChart3,
		color: "bg-gray-500/10 text-gray-500 border-gray-500/20",
		description: "Other uncategorized emails",
	},
]

export default function CategoriesPage() {
	const [stats, setStats] = useState<Record<string, number>>({})
	const { accessToken } = useAuth()

	useEffect(() => {
		// Get the ID token which is what the backend expects for authentication
		const idToken = localStorage.getItem('storymail-id-token')
		
		fetch(`${API_URL}/api/categories/stats/`, { 
			headers: {
				'Authorization': `Bearer ${idToken}`
			}
		})
			.then((res) => {
				if (!res.ok) {
					console.error('Failed to fetch categories:', res.status, res.statusText)
					return {}
				}
				return res.json()
			})
			.then((data) => setStats(data || {}))
			.catch((error) => {
				console.error('Error fetching categories:', error)
				setStats({})
			})
	}, [accessToken])

	return (
		<DashboardLayout>
			<div className="space-y-6">
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-3xl font-bold flex items-center">
							<BarChart3 className="mr-3 h-8 w-8" />
							Email Categories
						</h1>
						<p className="text-muted-foreground mt-2">
							View and manage your automatically categorized emails
						</p>
					</div>
					<div className="flex items-center space-x-2">
						<div className="relative">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
							<Input placeholder="Search emails..." className="pl-10 w-64" />
						</div>
						<Button variant="outline">
							<Filter className="mr-2 h-4 w-4" />
							Filter
						</Button>
					</div>
				</div>

				{/* Category Overview */}
				<div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
					{baseCategories.map((category) => {
						const IconComponent = category.icon
						const count = stats[category.id] ?? 0
						return (
							<Card
								key={category.id}
								className="hover:shadow-md transition-shadow"
							>
								<CardHeader className="pb-2 px-4 pt-3">
									<div className="flex items-center justify-between">
										<IconComponent className="h-6 w-6 text-muted-foreground" />
										<Badge className={category.color}>{count}</Badge>
									</div>
									<CardTitle className="text-base mt-1">{category.name}</CardTitle>
									<CardDescription className="text-xs">
										{category.description}
									</CardDescription>
								</CardHeader>
							</Card>
						)
					})}
				</div>

				{/* Category Tabs */}
				<Card>
					<CardHeader>
						<CardTitle>Browse by Category</CardTitle>
						<CardDescription>
							View emails organized by their automatically assigned categories
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Tabs defaultValue="productivity" className="w-full">
							<TabsList className="grid w-full grid-cols-5">
								{baseCategories.map((category) => (
									<TabsTrigger
										key={category.id}
										value={category.id}
										className="flex items-center"
									>
										<category.icon className="mr-2 h-4 w-4" />
										{category.name}
									</TabsTrigger>
								))}
							</TabsList>

							{baseCategories.map((category) => (
								<TabsContent key={category.id} value={category.id} className="mt-6">
									<EmailList category={category.id} />
								</TabsContent>
							))}
						</Tabs>
					</CardContent>
				</Card>
			</div>
		</DashboardLayout>
	)
}
