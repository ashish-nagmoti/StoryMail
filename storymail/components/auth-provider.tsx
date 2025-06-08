"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface User {
  id: string
  name: string
  email: string
  picture: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  accessToken: string | null
  login: () => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Configuration
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
const REDIRECT_URI = typeof window !== 'undefined' ? `${window.location.origin}/callback` : ''

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Function to handle authentication with token data in URL hash
  const handleHashTokens = () => {
    if (typeof window !== 'undefined' && window.location.hash) {
      // Check for auth_result in URL hash
      const hash = window.location.hash.substring(1); // Remove the # character
      
      // Parse auth_result from hash if present
      if (hash.startsWith('auth_result=')) {
        try {
          const authResult = hash.substring('auth_result='.length);
          const tokenData = new URLSearchParams(authResult);
          
          const access_token = tokenData.get('access_token');
          const id_token = tokenData.get('id_token');
          const refresh_token = tokenData.get('refresh_token');
          
          if (access_token) {
            console.log('Received tokens from URL hash');
            
            // Save tokens
            localStorage.setItem('storymail-access-token', access_token);
            if (id_token) localStorage.setItem('storymail-id-token', id_token);
            if (refresh_token) localStorage.setItem('storymail-refresh-token', refresh_token);
            
            setAccessToken(access_token);
            
            // Remove the hash from the URL (for security)
            window.history.replaceState(
              {},
              document.title,
              window.location.pathname + window.location.search
            );
            
            // Fetch user info
            fetchUserInfo(access_token).then(() => {
              // Navigate to dashboard after setting user info
              window.location.href = '/dashboard';
            });
            
            return true;
          }
        } catch (error) {
          console.error('Error processing auth tokens from hash:', error);
        }
      }
    }
    return false;
  };

  // Check URL for Auth0 callback code or hash tokens
  useEffect(() => {
    const handleAuthCallback = async () => {
      if (typeof window !== 'undefined') {
        // First check for tokens in URL hash (new flow)
        if (handleHashTokens()) {
          // If tokens were found in hash, we're done
          return;
        }
        
        // Legacy flow - check for code parameter
        if (window.location.pathname === '/callback' && window.location.search.includes('code=')) {
          const urlParams = new URLSearchParams(window.location.search)
          const code = urlParams.get('code')
          const error = urlParams.get('error')
          const errorDescription = urlParams.get('error_description')
          
          if (error) {
            console.error(`Auth error: ${error} - ${errorDescription}`);
            setIsLoading(false);
            return;
          }

          if (code) {
            try {
              // Exchange code for tokens with our backend
              const response = await fetch(`${API_URL}/api/auth/callback/`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  code,
                  redirect_uri: REDIRECT_URI,
                }),
              })

              if (!response.ok) {
                throw new Error('Failed to exchange code for tokens')
              }

              const data = await response.json()
              
              // Save tokens
              localStorage.setItem('storymail-access-token', data.access_token)
              localStorage.setItem('storymail-id-token', data.id_token)
              localStorage.setItem('storymail-refresh-token', data.refresh_token)
              setAccessToken(data.access_token)
              
              // Fetch user info
              await fetchUserInfo(data.access_token)
              
              // Redirect to dashboard
              window.location.href = '/dashboard'
            } catch (error) {
              console.error('Auth callback error:', error)
              setIsLoading(false)
            }
          }
        } else {
          // Regular page load - check for existing session
          checkAuth()
        }
      }
    }

    handleAuthCallback()
  }, [])

  const fetchUserInfo = async (token: string) => {
    try {
      const idToken = localStorage.getItem('storymail-id-token');
      const response = await fetch(`${API_URL}/api/auth/user/`, {
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch user info')
      }

      const userData = await response.json()
      setUser(userData)
      localStorage.setItem('storymail-user', JSON.stringify(userData))
      setIsLoading(false)
      return userData
    } catch (error) {
      console.error('Error fetching user info:', error)
      setIsLoading(false)
      return null
    }
  }

  const checkAuth = async () => {
    const savedToken = localStorage.getItem('storymail-access-token')
    const savedUser = localStorage.getItem('storymail-user')
    
    if (savedToken && savedUser) {
      setAccessToken(savedToken)
      setUser(JSON.parse(savedUser))
      
      // Optional: Validate token with backend or refresh if needed
      try {
        // Check if token is still valid by fetching user info
        await fetchUserInfo(savedToken)
      } catch (error) {
        // Token invalid - clear auth
        logout()
      }
    }
    
    setIsLoading(false)
  }

  const login = async () => {
    setIsLoading(true)
    try {
      // Get login URL from backend - now the backend will handle the redirect flow properly
      const response = await fetch(`${API_URL}/api/auth/login/?redirect_uri=${encodeURIComponent(window.location.origin)}`)
      
      if (!response.ok) {
        throw new Error('Failed to get login URL')
      }
      
      const { auth_url } = await response.json()
      
      // Redirect to Auth0 login page
      window.location.href = auth_url
    } catch (error) {
      console.error('Login error:', error)
      setIsLoading(false)
    }
  }

  const logout = async () => {
    setIsLoading(true)
    
    try {
      // Call backend logout endpoint
      const response = await fetch(`${API_URL}/api/auth/logout/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          returnTo: typeof window !== 'undefined' ? window.location.origin : '',
        }),
      })
      
      if (!response.ok) {
        throw new Error('Logout failed')
      }
      
      const { logout_url } = await response.json()
      
      // Clear local storage
      localStorage.removeItem('storymail-user')
      localStorage.removeItem('storymail-access-token')
      localStorage.removeItem('storymail-id-token')
      localStorage.removeItem('storymail-refresh-token')
      
      // Clear state
      setUser(null)
      setAccessToken(null)
      
      // Redirect to Auth0 logout
      window.location.href = logout_url
    } catch (error) {
      console.error('Logout error:', error)
      // Still clear local data even if API call fails
      localStorage.removeItem('storymail-user')
      localStorage.removeItem('storymail-access-token')
      setUser(null)
      setAccessToken(null)
      window.location.href = '/'
    }
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, accessToken, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
