"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"

// Add global scrollbar hide styles
const globalStyles = `
  .scrollbar-hide {
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
  
  /* Apply to html and body to hide main page scrollbar */
  html, body {
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
  
  html::-webkit-scrollbar, 
  body::-webkit-scrollbar {
    display: none;
  }
  
  /* Hide all scrollbars by default */
  ::-webkit-scrollbar {
    display: none;
  }
`

// Badge component for user achievements
const Badge = ({ id, name, icon }: { id: string; name: string; icon: string }) => (
  <span className="inline-flex items-center rounded-md border border-cyber-green/40 bg-[#011013]/80 px-2 py-1 text-xs font-medium text-cyber-green backdrop-blur-sm shadow-[0_0_5px_rgba(9,251,211,0.2)]">
    {icon} {name}
  </span>
)

// Define types
interface Badge {
  id: string
  name: string
  icon: string
}

interface User {
  id: string
  username: string
  profileImageUrl: string
  twitterScore: number
  walletScore: number
  telegramScore: number
  totalScore: number
  badges: Badge[]
  isVerified: boolean
}

interface TempUser {
  id: string
  username: string
  profileImageUrl: string
  twitterScore: number
  totalScore: number
  badges: Badge[]
}

interface HoverInfo {
  user: User | TempUser
  x: number
  y: number
}

// Score calculation function
function calculateScore(twitterScore: number, walletScore: number, telegramScore: number): number {
  const weightedTwitter = twitterScore * 0.5
  const weightedWallet = walletScore * 0.3
  const weightedTelegram = telegramScore * 0.2
  return Math.round(weightedTwitter + weightedWallet + weightedTelegram)
}

// Function to check if a Twitter user exists (simulated)
async function checkTwitterUser(username: string): Promise<{
  exists: boolean
  profileImageUrl: string
  estimatedScore: number
}> {
  // This is a simulation of a Twitter API call
  // In production, you would use the actual Twitter API

  // For demo purposes, we'll consider some usernames as "valid"
  const validUsers = [
    "elonmusk",
    "jack",
    "twitter",
    "vercel",
    "nextjs",
    "reactjs",
    // Add more known usernames for testing
  ]

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 800))

  // Check if username is in our valid users list or has more than 4 characters
  // This is just for demo - in production you'd check against the real Twitter API
  const exists = validUsers.includes(username.toLowerCase()) || (username.length > 4 && Math.random() > 0.3) // 70% chance of "existing" for testing

  if (exists) {
    // Generate a random score between 30-70 for temporary users
    const estimatedScore = Math.floor(Math.random() * 40) + 30

    // Return simulated Twitter user data
    return {
      exists: true,
      profileImageUrl: `https://unavatar.io/twitter/${username}`,
      estimatedScore,
    }
  }

  return {
    exists: false,
    profileImageUrl: "",
    estimatedScore: 0,
  }
}

export default function Home() {
  const [username, setUsername] = useState("")
  const [users, setUsers] = useState<User[]>([])
  const [tempUsers, setTempUsers] = useState<TempUser[]>([])
  const [showUserPanel, setShowUserPanel] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [notification, setNotification] = useState("")
  const [hoverInfo, setHoverInfo] = useState<HoverInfo | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const userPositionsRef = useRef<{ x: number; y: number; size: number; user: User | TempUser }[]>([])
  const [isMounted, setIsMounted] = useState(false)

  // Set isMounted to true after component mounts
  useEffect(() => {
    setIsMounted(true)
  }, [])

  console.log("app page is running")

  // Load users from localStorage on initial render
  useEffect(() => {
    const savedUsers = localStorage.getItem("users")
    if (savedUsers) {
      try {
        setUsers(JSON.parse(savedUsers))
      } catch (e) {
        console.error("Failed to parse saved users", e)
      }
    }
  }, [])

  // Save users to localStorage when they change
  useEffect(() => {
    if (users.length > 0) {
      localStorage.setItem("users", JSON.stringify(users))
    }
  }, [users])

  // Draw the graph whenever users or tempUsers change, but only on client
  useEffect(() => {
    if (isMounted) {
      drawGraph()
    }
  }, [users, tempUsers, hoverInfo, isMounted])

  // Handle mouse movement for hover effects
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (typeof window === "undefined") return // Only run in browser

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top

    // Check if mouse is over any user position
    const hoveredUser = userPositionsRef.current.find((item) => {
      const { x, y, size } = item
      return mouseX >= x - size / 2 && mouseX <= x + size / 2 && mouseY >= y - size / 2 && mouseY <= y + size / 2
    })

    if (hoveredUser) {
      setHoverInfo({
        user: hoveredUser.user,
        x: hoveredUser.x,
        y: hoveredUser.y,
      })
    } else {
      setHoverInfo(null)
    }
  }

  // Function to draw the graph
  const drawGraph = () => {
    if (typeof window === "undefined") return // Only run in browser

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Reset user positions
    userPositionsRef.current = []

    // Set canvas dimensions
    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()

    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr

    ctx.scale(dpr, dpr)

    // Clear canvas
    ctx.clearRect(0, 0, rect.width, rect.height)

    // Set background - cyber theme with darker bg
    const gradient = ctx.createLinearGradient(0, 0, rect.width, rect.height)
    gradient.addColorStop(0, "rgba(1, 16, 19, 1)") // Match the card background
    gradient.addColorStop(1, "rgba(1, 16, 19, 1)") // Solid color matching the card
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, rect.width, rect.height)

    // Add subtle radial gradient overlay for cyber effect
    const radialGradient = ctx.createRadialGradient(
      rect.width / 2,
      rect.height / 2,
      10,
      rect.width / 2,
      rect.height / 2,
      rect.width * 0.8,
    )
    radialGradient.addColorStop(0, "rgba(9, 251, 211, 0.03)") // Very subtle cyber green center glow
    radialGradient.addColorStop(0.5, "rgba(9, 251, 211, 0.01)")
    radialGradient.addColorStop(1, "rgba(0, 0, 0, 0)")
    ctx.fillStyle = radialGradient
    ctx.fillRect(0, 0, rect.width, rect.height)

    // Draw grid
    ctx.strokeStyle = "rgba(9, 251, 211, 0.1)"
    ctx.lineWidth = 1

    // Vertical grid lines
    for (let i = 0; i <= 10; i++) {
      const x = (i / 10) * rect.width
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, rect.height)
      ctx.stroke()
    }

    // Horizontal grid lines
    for (let i = 0; i <= 10; i++) {
      const y = (i / 10) * rect.height
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(rect.width, y)
      ctx.stroke()
    }

    // Draw outer glow border for the graph
    ctx.strokeStyle = "rgba(9, 251, 211, 0.3)"
    ctx.lineWidth = 2
    ctx.strokeRect(0, 0, rect.width, rect.height)

    // Draw a second inner border for depth
    ctx.strokeStyle = "rgba(9, 251, 211, 0.1)"
    ctx.lineWidth = 1
    ctx.strokeRect(3, 3, rect.width - 6, rect.height - 6)

    // Draw axes
    ctx.strokeStyle = "rgba(9, 251, 211, 0.5)"
    ctx.lineWidth = 2

    // X-axis
    ctx.beginPath()
    ctx.moveTo(0, rect.height - 30)
    ctx.lineTo(rect.width, rect.height - 30)
    ctx.stroke()

    // Y-axis
    ctx.beginPath()
    ctx.moveTo(30, 0)
    ctx.lineTo(30, rect.height)
    ctx.stroke()

    // Draw axis labels
    ctx.fillStyle = "rgba(9, 251, 211, 0.8)" // Cyber green for labels
    ctx.font = "12px 'Space Grotesk', sans-serif"
    ctx.textAlign = "center"

    // X-axis label
    ctx.fillText("Total Score", rect.width / 2, rect.height - 10)

    // Y-axis label
    ctx.save()
    ctx.translate(10, rect.height / 2)
    ctx.rotate(-Math.PI / 2)
    ctx.fillText("Total Badges", 0, 0)
    ctx.restore()

    // Calculate the maximum score and badge count for scaling
    const maxScore = Math.max(
      100, // Minimum scale
      ...users.map((user) => user.totalScore),
      ...tempUsers.map((user) => user.totalScore),
    )

    const maxBadges = Math.max(
      5, // Minimum scale
      ...users.map((user) => user.badges?.length || 0),
      ...tempUsers.map((user) => user.badges?.length || 0),
    )

    // Draw scale markers
    ctx.fillStyle = "rgba(9, 251, 211, 0.6)" // Cyber green for scale markers
    ctx.textAlign = "right"
    ctx.fillText("0", 25, rect.height - 25)
    ctx.fillText(maxScore.toString(), rect.width - 5, rect.height - 25)

    ctx.textAlign = "left"
    ctx.fillText("0", 35, rect.height - 35)
    ctx.fillText(maxBadges.toString(), 35, 15)

    // Draw all users
    const allUsers = [...users, ...tempUsers]

    allUsers.forEach((user) => {
      // Determine if it's a temp user
      const isTemp = !("walletScore" in user)

      // Calculate position
      const x = 30 + (user.totalScore / maxScore) * (rect.width - 60)
      const y =
        rect.height -
        30 -
        ((isTemp ? user.badges.length : (user as User).badges?.length || 0) / maxBadges) * (rect.height - 60)

      // Define image size (larger square - one grid cell)
      const cellSize = Math.min(rect.width, rect.height) / 10
      const imageSize = cellSize * 0.8 // 80% of a grid cell

      // Store user position for hover detection
      userPositionsRef.current.push({
        x,
        y,
        size: imageSize,
        user,
      })

      // Draw username
      ctx.fillStyle = isTemp ? "rgba(254, 83, 187, 0.8)" : "rgba(9, 251, 211, 0.8)"
      ctx.font = "10px 'Space Grotesk', sans-serif"
      ctx.textAlign = "center"
      ctx.fillText(`@${user.username}`, x, y + imageSize / 2 + 15)

      // Draw profile image background glow
      const glowGradient = ctx.createRadialGradient(x, y, imageSize / 2, x, y, imageSize)
      glowGradient.addColorStop(0, isTemp ? "rgba(254, 83, 187, 0.8)" : "rgba(9, 251, 211, 0.8)")
      glowGradient.addColorStop(1, "rgba(0, 0, 0, 0)")

      ctx.beginPath()
      ctx.rect(x - imageSize / 2 - 5, y - imageSize / 2 - 5, imageSize + 10, imageSize + 10)
      ctx.fillStyle = glowGradient
      ctx.fill()

      // Draw profile image border (square)
      ctx.beginPath()
      ctx.rect(x - imageSize / 2, y - imageSize / 2, imageSize, imageSize)
      ctx.strokeStyle = isTemp ? "rgba(254, 83, 187, 0.9)" : "rgba(9, 251, 211, 0.9)"
      ctx.lineWidth = 2
      ctx.stroke()

      // Load and draw profile image (square)
      const img = new Image()
      img.crossOrigin = "anonymous"
      img.src = user.profileImageUrl

      img.onload = () => {
        // Draw square profile image
        ctx.save()
        ctx.beginPath()
        ctx.rect(x - imageSize / 2, y - imageSize / 2, imageSize, imageSize)
        ctx.clip()
        ctx.drawImage(img, x - imageSize / 2, y - imageSize / 2, imageSize, imageSize)
        ctx.restore()
      }
    })

    // Draw hover info if available
    if (hoverInfo) {
      const { user, x, y } = hoverInfo
      const isTemp = !("walletScore" in user)

      // Draw info box background with glow
      const boxWidth = 160
      const boxHeight = 80

      // Add glow effect
      ctx.shadowColor = isTemp ? "rgba(254, 83, 187, 0.6)" : "rgba(9, 251, 211, 0.6)"
      ctx.shadowBlur = 10
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 0

      // Draw glass panel
      ctx.fillStyle = "rgba(0, 0, 0, 0.7)"
      ctx.fillRect(x - boxWidth / 2, y - 100, boxWidth, boxHeight)

      // Reset shadow
      ctx.shadowColor = "transparent"
      ctx.shadowBlur = 0

      // Draw border
      ctx.strokeStyle = isTemp ? "rgba(254, 83, 187, 0.8)" : "rgba(9, 251, 211, 0.8)"
      ctx.lineWidth = 1
      ctx.strokeRect(x - boxWidth / 2, y - 100, boxWidth, boxHeight)

      // Draw info text
      ctx.fillStyle = isTemp ? "rgba(254, 83, 187, 1)" : "rgba(9, 251, 211, 1)"
      ctx.font = "12px 'Space Grotesk', sans-serif"
      ctx.textAlign = "center"
      ctx.fillText(`Score: ${user.totalScore}`, x, y - 75)
      ctx.fillText(`Badges: ${user.badges?.length}`, x, y - 55)

      if (!isTemp) {
        ctx.fillText(`Twitter: ${(user as User).twitterScore}`, x, y - 35)
      } else {
        ctx.fillStyle = "rgba(254, 83, 187, 0.8)"
        ctx.fillText("Connect wallet for full score", x, y - 35)
      }
    }
  }
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
  
    if (!username.trim()) {
      setNotification("Please enter a valid username.")
      return
    }
  
    setIsLoading(true)
    setNotification("")
  
    try {
      // First try to get user from our backend
      const response = await fetch(`https://back.braindrop.fun/api/chart/user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username }),
      })
  
      if (response.ok) {
        const result = await response.json()
        console.log("✅ User data received from backend:", result)
  
        const {
          id,
          username: returnedUsername,
          profileImageUrl = `https://unavatar.io/twitter/${username}`,
          twitterScore = 0,
          walletScore = 0,
          telegramScore = 0,
          totalScore = 0,
          badges = [],
          isVerified = false,
        } = result
  
        // Create a user with all data received
        const newUser: User = {
          id: id || `user-${Date.now()}`,
          username: returnedUsername,
          profileImageUrl,
          twitterScore,
          walletScore,
          telegramScore,
          totalScore,
          badges,
          isVerified,
        }
  
        setUsers((prev) => [...prev, newUser])
        
        const isFullUser = walletScore > 0 && telegramScore > 0
        if (isFullUser) {
          setNotification(`✅ @${returnedUsername} added with full score data.`)
        } else {
          setNotification(`⚠️ @${returnedUsername} added with partial data. Connect additional services to increase your score!`)
        }
      } else {
        // User not found in our backend, try to fetch from Twitter API using new endpoint
        console.log("User not found in backend, trying Twitter details API...")
  
        try {
          // Call the Twitter details API
          const twitterResponse = await fetch(`https://back.braindrop.fun/api/twitter/details`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ username }),
          })
  
          if (twitterResponse.ok) {
            const twitterData = await twitterResponse.json()
            console.log("✅ Twitter data received:", twitterData)
  
            if (twitterData.success) {
              // Create a user with Twitter data
              const newUser: User = {
                id: `twitter-${Date.now()}`,
                username: twitterData.username || username,
                profileImageUrl: twitterData.profileImageUrl || `https://unavatar.io/twitter/${username}`,
                twitterScore: twitterData.twitterScore || 20,
                walletScore: 0, // No wallet score yet
                telegramScore: 0, // No telegram score yet
                totalScore: twitterData.totalScore || twitterData.twitterScore || 20,
                badges: twitterData.badges || [{ id: "twitter-basic", name: "Twitter User", icon: "🐦" }],
                isVerified: false,
              }
  
              setUsers((prev) => [...prev, newUser])
              setNotification(
                `⚠️ @${username} added with Twitter score. Connect your wallet and Telegram to get a full profile!`
              )
            } else {
              setNotification(`❌ Error: ${twitterData.message || "Could not retrieve Twitter data"}`)
            }
          } else {
            setNotification(`❌ Error: Twitter user data retrieval failed.`)
          }
        } catch (twitterError) {
          console.error("Error fetching Twitter details:", twitterError)
          setNotification(`❌ Error: Twitter API error. User data retrieval failed.`)
        }
      }
    } catch (error) {
      console.error("❌ Error fetching user:", error)
      setNotification("Server error. Please try again later.")
    } finally {
      setIsLoading(false)
      setUsername("") // Reset input
    }
  }

  const clearUsers = () => {
    setUsers([])
    setTempUsers([])
    localStorage.removeItem("users")
    setNotification("All users have been cleared.")

    // Clear notification after 3 seconds
    setTimeout(() => {
      setNotification("")
    }, 3000)
  }

  const clearTempUsers = () => {
    setTempUsers([])
    setNotification("All temporary users have been cleared.")

    // Clear notification after 3 seconds
    setTimeout(() => {
      setNotification("")
    }, 3000)
  }

  return (
    <>
      <style jsx global>
        {globalStyles}
      </style>
      <main className="min-h-screen flex flex-col items-center p-4 md:p-8 bg-[#011013] bg-[radial-gradient(ellipse_at_center,rgba(9,251,211,0.05),transparent_70%)] overflow-x-hidden scrollbar-hide">
        <div className="w-full max-w-4xl">
          <div className="flex flex-col items-center mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2 mb-6">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-cyber-green drop-shadow-[0_0_8px_rgba(9,251,211,0.8)]"
              >
                <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
                <path d="M5 3v4" />
                <path d="M19 17v4" />
                <path d="M3 5h4" />
                <path d="M17 19h4" />
              </svg>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyber-green to-cyber-blue drop-shadow-[0_0_8px_rgba(9,251,211,0.5)]">
                User Score & Badge Analysis
              </span>
            </h1>

            <form onSubmit={handleSubmit} className="w-full flex gap-2 max-w-md">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Enter Twitter username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-2 rounded-md bg-[#011013] border border-cyber-green/30 text-white placeholder:text-gray-500 focus:border-cyber-green focus:ring-1 focus:ring-cyber-green transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="p-2 rounded-md bg-[#011013] border border-cyber-green/30 text-cyber-green hover:bg-cyber-green/10 hover:border-cyber-green/50 transition-all"
                style={{
                  boxShadow: isLoading ? "none" : "0 0 8px rgba(9, 251, 211, 0.2)",
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => setShowUserPanel(!showUserPanel)}
                className="p-2 rounded-md bg-cyber-green text-black hover:bg-cyber-green/90 transition-all"
                style={{
                  boxShadow: "0 0 10px rgba(9, 251, 211, 0.3)",
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
                  <path d="M5 3v4" />
                  <path d="M19 17v4" />
                  <path d="M3 5h4" />
                  <path d="M17 19h4" />
                </svg>
              </button>
            </form>

            {/* Notification */}
            {notification && (
              <div className="mt-4 w-full max-w-md p-3 rounded-lg bg-[#011013] border border-cyber-green/30 text-white text-center animate-fadeIn">
                {notification}
              </div>
            )}
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            {showUserPanel && (
              <div className="w-full md:w-96">
                <div className="bg-[#011013] rounded-lg overflow-hidden h-full border-2 border-cyber-green/50 shadow-[0_0_20px_rgba(9,251,211,0.3)] backdrop-blur-lg relative scrollbar-hide">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(9,251,211,0.05),transparent_70%)] z-0"></div>

                  <div className="bg-cyber-green/5 p-3 border-b border-cyber-green/20 relative z-10">
                    <h2 className="text-lg font-bold text-white flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-cyber-green mr-2"
                      >
                        <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
                        <path d="M5 3v4" />
                        <path d="M19 17v4" />
                        <path d="M3 5h4" />
                        <path d="M17 19h4" />
                      </svg>
                      User Analysis
                    </h2>
                  </div>

                  <div className="p-4 relative z-10 overflow-y-auto scrollbar-hide">
                    {users.length === 0 && tempUsers.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-64 text-center text-gray-200">
                        <div className="border-2 border-dashed border-cyber-green/30 p-6 rounded-lg mb-4">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="32"
                            height="32"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-cyber-green mx-auto mb-2"
                          >
                            <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
                            <path d="M5 3v4" />
                            <path d="M19 17v4" />
                            <path d="M3 5h4" />
                            <path d="M17 19h4" />
                          </svg>
                        </div>
                        <p>No users analyzed yet. Enter a Twitter username to see their score and badges.</p>
                      </div>
                    ) : (
                      <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 scrollbar-hide">
                        {[...users, ...tempUsers].map((user) => {
                          const isTemp = !("walletScore" in user)

                          return (
                            <div
                              key={user.id}
                              className={`${
                                isTemp ? "bg-[#011013] border-cyber-pink/30" : "bg-[#011013] border-cyber-green/30"
                              } rounded-lg p-3 border hover:border-opacity-50 transition-all`}
                            >
                              <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 rounded-none overflow-hidden border-2 border-cyber-green/50">
                                  <img
                                    src={user.profileImageUrl || "/placeholder.svg"}
                                    alt={user.username}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div>
                                  <h3 className="font-bold text-white">@{user.username}</h3>
                                  <div className="flex items-center gap-1">
                                    <span className="text-xs text-cyber-green">Score: {user.totalScore}</span>
                                    <span className="text-xs text-cyber-green">•</span>
                                    <span className="text-xs text-cyber-green">Badges: {user.badges?.length}</span>
                                  </div>
                                </div>

                                {isTemp && (
                                  <div className="ml-auto px-2 py-1 bg-[#011013] border border-cyber-pink/30 rounded text-xs font-medium text-cyber-pink flex items-center">
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      width="12"
                                      height="12"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      className="mr-1"
                                    >
                                      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                                      <path d="M12 9v4" />
                                      <path d="M12 17h.01" />
                                    </svg>
                                    Temp
                                  </div>
                                )}

                                {!isTemp && (user as User).isVerified && (
                                  <div className="ml-auto px-2 py-1 bg-[#011013] border border-cyber-blue/30 rounded text-xs font-medium text-cyber-blue">
                                    Verified
                                  </div>
                                )}
                              </div>

                              <div className="mt-3">
                                <h4 className="text-xs font-semibold text-cyber-green mb-1">Badges:</h4>
                                <div className="flex flex-wrap gap-2">
                                  {user.badges?.map((badge, index) => (
                                    <span
                                      key={index}
                                      className="inline-flex items-center rounded-md border border-cyber-green/40 bg-[#011013] px-2 py-1 text-xs font-medium text-cyber-green shadow-[0_0_5px_rgba(9,251,211,0.2)]"
                                    >
                                      {badge?.icon} {badge?.name}
                                    </span>
                                  ))}

                                  {user.badges?.length === 0 && (
                                    <span className="text-xs text-cyan-300">No badges earned yet</span>
                                  )}
                                </div>
                              </div>

                              {!isTemp && (
                                <div className="mt-3 grid grid-cols-3 gap-2">
                                  <div className="bg-[#011013] p-2 rounded border border-cyber-green/30 shadow-[0_0_5px_rgba(9,251,211,0.1)]">
                                    <div className="text-xs text-cyber-green">Twitter</div>
                                    <div className="font-bold text-white">{(user as User).twitterScore}</div>
                                  </div>
                                  <div className="bg-[#011013] p-2 rounded border border-cyber-green/30 shadow-[0_0_5px_rgba(9,251,211,0.1)]">
                                    <div className="text-xs text-cyber-green">Wallet</div>
                                    <div className="font-bold text-white">{(user as User).walletScore}</div>
                                  </div>
                                  <div className="bg-[#011013] p-2 rounded border border-cyber-green/30 shadow-[0_0_5px_rgba(9,251,211,0.1)]">
                                    <div className="text-xs text-cyber-green">Telegram</div>
                                    <div className="font-bold text-white">{(user as User).telegramScore}</div>
                                  </div>
                                </div>
                              )}

                              {isTemp && (
                                <div className="mt-3 space-y-2">
                                  <div className="p-2 bg-[#011013] rounded border border-cyber-pink/30 shadow-[0_0_5px_rgba(254,83,187,0.1)]">
                                    <p className="text-xs text-cyber-pink">
                                      <span className="font-semibold">Temporary profile:</span> This is based on
                                      estimated Twitter data only.
                                    </p>
                                  </div>

                                  <div className="p-3 bg-[#011013] rounded border border-cyber-green/30 shadow-[0_0_5px_rgba(9,251,211,0.1)]">
                                    <h4 className="text-xs font-semibold text-cyber-green mb-2">
                                      Complete your profile:
                                    </h4>
                                    <div className="grid grid-cols-3 gap-2">
                                      <div className="bg-[#011013] p-2 rounded border border-cyber-green/30 flex flex-col items-center justify-center">
                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          width="16"
                                          height="16"
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          stroke="currentColor"
                                          strokeWidth="2"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          className="text-cyber-green mb-1"
                                        >
                                          <path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z" />
                                        </svg>
                                        <div className="text-xs text-cyber-green">Connect Wallet</div>
                                      </div>
                                      <div className="bg-[#011013] p-2 rounded border border-cyber-green/30 flex flex-col items-center justify-center">
                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          width="16"
                                          height="16"
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          stroke="currentColor"
                                          strokeWidth="2"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          className="text-cyber-green mb-1"
                                        >
                                          <path d="m22 2-7 20-4-9-9-4Z" />
                                          <path d="M22 2 11 13" />
                                        </svg>
                                        <div className="text-xs text-cyber-green">Connect Telegram</div>
                                      </div>
                                      <div className="bg-[#011013] p-2 rounded border border-cyber-green/30 flex flex-col items-center justify-center">
                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          width="16"
                                          height="16"
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          stroke="currentColor"
                                          strokeWidth="2"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          className="text-cyber-green mb-1"
                                        >
                                          <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
                                        </svg>
                                        <div className="text-xs text-cyber-green">Unlock Badges</div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-center mt-3 py-3 border-t border-cyber-green/20 px-4">
                    <button
                      onClick={() => setShowUserPanel(false)}
                      className="px-4 py-2 bg-[#011013] border border-cyber-green/30 rounded text-sm font-medium text-cyber-green hover:bg-cyber-green/5 transition-all shadow-lg"
                    >
                      Close Panel
                    </button>
                    <button
                      onClick={clearTempUsers}
                      className="px-4 py-2 bg-[#011013] border border-cyber-pink/30 rounded text-sm font-medium text-cyber-pink hover:bg-cyber-pink/5 transition-all shadow-lg"
                    >
                      Clear Temp
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className={`flex-1 ${showUserPanel ? "md:max-w-[calc(100%-24rem)]" : "w-full"} scrollbar-hide`}>
              <div className="p-6 bg-[#011013] rounded-lg border-2 border-cyber-green/50 shadow-[0_0_20px_rgba(9,251,211,0.3)] backdrop-blur-lg relative overflow-hidden scrollbar-hide">
                {/* Add the subtle radial gradient overlay */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(9,251,211,0.08),transparent_70%)] z-0"></div>

                <div className="w-full relative z-10">
                  <div className="flex justify-between mb-4">
                    <div className="flex items-center">
                      <div className="w-4 h-4 rounded-none bg-cyber-green mr-2"></div>
                      <span className="text-white text-sm">Loyals</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 rounded-none bg-cyber-pink mr-2"></div>
                      <span className="text-white text-sm">Guests</span>
                    </div>
                  </div>
                  <canvas
                    ref={canvasRef}
                    className="w-full aspect-[4/3] rounded-lg border border-cyber-green/30 bg-[#011013]"
                    style={{
                      boxShadow: "0 0 15px rgba(9, 251, 211, 0.1)",
                    }}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={() => setHoverInfo(null)}
                  />
                  <div className="mt-2 text-xs text-cyber-green text-center">
                    <span className="italic">Hover over a user to see details</span>
                  </div>
                </div>

                {users.length === 0 && tempUsers.length === 0 && (
                  <div className="mt-4 p-4 bg-[#011013] rounded-lg border border-cyber-green/30 text-center shadow-[0_0_10px_rgba(9,251,211,0.1)]">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mx-auto mb-2 text-cyber-green drop-shadow-[0_0_5px_rgba(9,251,211,0.5)]"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 16v-4" />
                      <path d="M12 8h.01" />
                    </svg>
                    <p className="text-cyber-green">
                      Enter a Twitter username to plot it on the graph. The X-axis represents total score, and the
                      Y-axis represents total badges.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-center mt-6 gap-4">
            <button
              onClick={() => setShowUserPanel(!showUserPanel)}
              className="px-6 py-3 bg-cyber-green text-black font-medium hover:bg-cyber-green/90 transition-all rounded-md shadow-lg"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-2 inline"
              >
                <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
                <path d="M5 3v4" />
                <path d="M19 17v4" />
                <path d="M3 5h4" />
                <path d="M17 19h4" />
              </svg>
              User details
            </button>

            <button
              onClick={clearUsers}
              className="px-6 py-3 bg-cyber-pink text-black font-medium hover:bg-cyber-pink/90 transition-all rounded-md shadow-lg"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-2 inline"
              >
                <path d="M3 6h18" />
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                <line x1="10" x2="10" y1="11" y2="17" />
                <line x1="14" x2="14" y1="11" y2="17" />
              </svg>
              Clear all
            </button>
          </div>

          <div className="text-center text-xs text-cyber-green mt-8">
            <p>For a proper plot with total score and total badges, please login with all required logins</p>
          </div>

          <div className="flex justify-between items-center mt-3 py-3 border-t border-cyber-green/20"></div>
        </div>
      </main>
    </>
  )
}

