import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Mail, MessageSquare, Shield, Zap, BarChart3, FileText, ArrowRight, Star } from "lucide-react"
import Link from "next/link"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
      <nav className="border-b border-white/10 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <Mail className="h-8 w-8 text-purple-400" />
              <span className="text-2xl font-bold text-white">StoryMail</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button variant="ghost" className="text-white hover:text-purple-300">
                  Sign In
                </Button>
              </Link>
              <Link href="/login">
                <Button className="bg-purple-600 hover:bg-purple-700">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <Badge className="mb-4 bg-purple-600/20 text-purple-300 border-purple-500/30">
            AI-Powered Email Intelligence
          </Badge>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            Transform Your
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400"> Inbox</span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            StoryMail converts your chaotic inbox into an organized, searchable knowledge base. Chat with your emails,
            get intelligent summaries, and never miss important information again.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login">
              <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-lg px-8 py-3">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 py-3 border-white/20 text-white hover:bg-white/10"
            >
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Intelligent Email Management</h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Powered by advanced AI to help you stay organized and productive
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <MessageSquare className="h-12 w-12 text-purple-400 mb-4" />
                <CardTitle className="text-white">AI Chat Interface</CardTitle>
                <CardDescription className="text-gray-300">
                  Ask natural language questions about your emails and get instant, intelligent responses.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <BarChart3 className="h-12 w-12 text-purple-400 mb-4" />
                <CardTitle className="text-white">Smart Classification</CardTitle>
                <CardDescription className="text-gray-300">
                  Automatically categorize emails into Productivity, Newsletters, Scam, and Office categories.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <FileText className="h-12 w-12 text-purple-400 mb-4" />
                <CardTitle className="text-white">Weekly Digests</CardTitle>
                <CardDescription className="text-gray-300">
                  Get beautifully formatted weekly summaries as emails and downloadable PDFs.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <Shield className="h-12 w-12 text-purple-400 mb-4" />
                <CardTitle className="text-white">Secure Authentication</CardTitle>
                <CardDescription className="text-gray-300">
                  Login securely with Google authentication powered by Auth0.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <Zap className="h-12 w-12 text-purple-400 mb-4" />
                <CardTitle className="text-white">Real-time Sync</CardTitle>
                <CardDescription className="text-gray-300">
                  Automatically fetch and process emails in real-time via secure API integration.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <Star className="h-12 w-12 text-purple-400 mb-4" />
                <CardTitle className="text-white">Smart Search</CardTitle>
                <CardDescription className="text-gray-300">
                  Find any email instantly with powerful search and filtering capabilities.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <Card className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-purple-500/30 backdrop-blur-sm">
            <CardContent className="p-12">
              <h2 className="text-4xl font-bold text-white mb-4">Ready to Transform Your Inbox?</h2>
              <p className="text-xl text-gray-300 mb-8">
                Join thousands of professionals who have already revolutionized their email workflow.
              </p>
              <Link href="/login">
                <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-lg px-8 py-3">
                  Get Started Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Mail className="h-6 w-6 text-purple-400" />
              <span className="text-lg font-semibold text-white">StoryMail</span>
            </div>
            <p className="text-gray-400">© 2024 StoryMail. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
