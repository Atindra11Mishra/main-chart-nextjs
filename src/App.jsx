"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import "./App.css"

// Badge component for user achievements
const Badge = ({ id, name, icon }) => (
  <span className="inline-flex items-center rounded-md border border-cyan-400/30 bg-black/40 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm">
    {icon} {name}
  </span>
)

// Score calculation function
function calculateScore(twitterScore, walletScore, telegramScore) {
  const weightedTwitter = twitterScore * 0.5
  const weightedWallet = walletScore * 0.3
  const weightedTelegram = telegramScore * 0.2
  return Math.round(weightedTwitter + weightedWallet + weightedTelegram)
}

function App() {
  const [username, setUsername] = useState("")
  const [users, setUsers] = useState([])
  const [tempUsers, setTempUsers] = useState([])
  const [showUserPanel, setShowUserPanel] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [notification, setNotification] = useState("")
  const [hoverInfo, setHoverInfo] = useState(null)
  const canvasRef = useRef(null)
  const userPositionsRef = useRef([])
  const animationFrameRef = useRef(null)
  const imagesLoadedRef = useRef({})
  const notificationTimeoutRef = useRef(null)

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

    // Cleanup function to prevent memory leaks
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      if (notificationTimeoutRef.current) {
        clearTimeout(notificationTimeoutRef.current)
      }
      // Clear image cache on unmount
      imagesLoadedRef.current = {}
    }
  }, [])

  // Save users to localStorage when they change
  useEffect(() => {
    if (users.length > 0) {
      localStorage.setItem("users", JSON.stringify(users))
    }
  }, [users])

  // Memoized draw function to prevent unnecessary re-renders
  const drawGraph = useCallback(() => {
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

    // Set background - vanta black with subtle cyan/teal gradient
    const gradient = ctx.createLinearGradient(0, 0, rect.width, rect.height)
    gradient.addColorStop(0, "rgba(0, 0, 0, 0.99)")
    gradient.addColorStop(0.5, "rgba(2, 6, 8, 0.99)")
    gradient.addColorStop(1, "rgba(0, 3, 5, 0.99)")
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, rect.width, rect.height)

    // Add subtle grid pattern
    ctx.strokeStyle = "rgba(0, 210, 210, 0.05)"
    ctx.lineWidth = 0.5

    // Vertical grid lines
    for (let i = 0; i <= 20; i++) {
      const x = (i / 20) * rect.width
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, rect.height)
      ctx.stroke()
    }

    // Horizontal grid lines
    for (let i = 0; i <= 20; i++) {
      const y = (i / 20) * rect.height
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(rect.width, y)
      ctx.stroke()
    }

    // Draw axes
    const axisGradient = ctx.createLinearGradient(0, 0, rect.width, rect.height)
    axisGradient.addColorStop(0, "rgba(0, 255, 240, 0.4)")
    axisGradient.addColorStop(1, "rgba(0, 210, 210, 0.3)")
    ctx.strokeStyle = axisGradient
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
    ctx.fillStyle = "rgba(255, 255, 255, 0.9)"
    ctx.font = "12px 'Inter', sans-serif"
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
      ...users.map((user) => user.badges.length),
      ...tempUsers.map((user) => user.badges.length),
    )

    // Draw scale markers
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
      const y = rect.height - 30 - (user.badges.length / maxBadges) * (rect.height - 60)

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
      ctx.fillStyle = "rgba(255, 255, 255, 0.9)"
      ctx.font = "10px 'Inter', sans-serif"
      ctx.textAlign = "center"
      ctx.fillText(`@${user.username}`, x, y + imageSize / 2 + 15)

      // Draw profile image background glow
      const glowGradient = ctx.createRadialGradient(x, y, imageSize / 2, x, y, imageSize)
      glowGradient.addColorStop(0, isTemp ? "rgba(255, 50, 50, 0.7)" : "rgba(0, 210, 210, 0.4)")
      glowGradient.addColorStop(1, "rgba(0, 0, 0, 0)")

      ctx.beginPath()
      ctx.rect(x - imageSize / 2 - 5, y - imageSize / 2 - 5, imageSize + 10, imageSize + 10)
      ctx.fillStyle = glowGradient
      ctx.fill()

      // Draw profile image border (square)
      ctx.beginPath()
      ctx.rect(x - imageSize / 2, y - imageSize / 2, imageSize, imageSize)

      // Create gradient for border
      const borderGradient = ctx.createLinearGradient(
        x - imageSize / 2,
        y - imageSize / 2,
        x + imageSize / 2,
        y + imageSize / 2,
      )

      if (isTemp) {
        borderGradient.addColorStop(0, "rgba(255, 50, 50, 0.9)")
        borderGradient.addColorStop(1, "rgba(255, 100, 100, 0.7)")
      } else {
        borderGradient.addColorStop(0, "rgba(0, 255, 240, 0.9)")
        borderGradient.addColorStop(1, "rgba(0, 210, 210, 0.7)")
      }

      ctx.strokeStyle = borderGradient
      ctx.lineWidth = 2
      ctx.stroke()

      // Load and draw profile image (square)
      // Check if image is already loaded and cached
      if (!imagesLoadedRef.current[user.profileImageUrl]) {
        const img = new Image()
        img.crossOrigin = "anonymous"
        img.src = user.profileImageUrl

        img.onload = () => {
          // Cache the loaded image
          imagesLoadedRef.current[user.profileImageUrl] = img

          // Draw square profile image
          ctx.save()
          ctx.beginPath()
          ctx.rect(x - imageSize / 2, y - imageSize / 2, imageSize, imageSize)
          ctx.clip()
          ctx.drawImage(img, x - imageSize / 2, y - imageSize / 2, imageSize, imageSize)
          ctx.restore()
        }

        img.onerror = () => {
          // Handle image loading error
          console.error(`Failed to load image: ${user.profileImageUrl}`)
          // Draw a placeholder
          ctx.save()
          ctx.beginPath()
          ctx.rect(x - imageSize / 2, y - imageSize / 2, imageSize, imageSize)
          ctx.clip()
          ctx.fillStyle = "#111"
          ctx.fillRect(x - imageSize / 2, y - imageSize / 2, imageSize, imageSize)
          ctx.fillStyle = isTemp ? "#ff3232" : "#00d2d2"
          ctx.font = "bold 16px 'Inter', sans-serif"
          ctx.textAlign = "center"
          ctx.textBaseline = "middle"
          ctx.fillText(user.username.charAt(0).toUpperCase(), x, y)
          ctx.restore()
        }
      } else {
        // Use cached image
        const img = imagesLoadedRef.current[user.profileImageUrl]
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

      // Draw info box with glass effect
      ctx.fillStyle = isTemp ? "rgba(50, 0, 0, 0.85)" : "rgba(0, 20, 20, 0.85)"
      ctx.fillRect(x - 80, y - 100, 160, 80)

      // Add gradient border
      const borderGradient = ctx.createLinearGradient(x - 80, y - 100, x + 80, y - 20)

      if (isTemp) {
        borderGradient.addColorStop(0, "rgba(255, 50, 50, 0.9)")
        borderGradient.addColorStop(1, "rgba(255, 100, 100, 0.7)")
      } else {
        borderGradient.addColorStop(0, "rgba(0, 255, 240, 0.9)")
        borderGradient.addColorStop(1, "rgba(0, 210, 210, 0.7)")
      }

      ctx.strokeStyle = borderGradient
      ctx.lineWidth = 1
      ctx.strokeRect(x - 80, y - 100, 160, 80)

      // Draw info text
      ctx.fillStyle = "white"
      ctx.font = "12px 'Inter', sans-serif"
      ctx.textAlign = "center"
      ctx.fillText(`Total Score: ${user.totalScore}`, x, y - 75)
      ctx.fillText(`Badges: ${user.badges.length}`, x, y - 55)

      if (!isTemp) {
        ctx.fillText(`Twitter: ${user.twitterScore}`, x, y - 35)
      } else {
        ctx.fillText("Connect wallet for full score", x, y - 35)
      }
    }
  }, [users, tempUsers, hoverInfo])

  // Draw the graph whenever users or tempUsers change
  useEffect(() => {
    // Cancel any pending animation frame
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }

    // Schedule a new draw
    animationFrameRef.current = requestAnimationFrame(drawGraph)

    // Cleanup function
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [users, tempUsers, hoverInfo, drawGraph])

  // Handle mouse movement for hover effects
  const handleMouseMove = useCallback((e) => {
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
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!username.trim()) return

    setIsLoading(true)

    try {
      // In a real app, you would fetch actual user data from Twitter API
      // For now, we'll simulate with random data
      const twitterScore = Math.floor(Math.random() * 100)
      const walletScore = Math.floor(Math.random() * 100)
      const telegramScore = Math.floor(Math.random() * 100)

      // Calculate total score based on algorithm
      const totalScore = calculateScore(twitterScore, walletScore, telegramScore)

      // Generate random badges
      const badges = [
        { id: "1", name: "Early Adopter", icon: "🌟" },
        { id: "2", name: "Content Creator", icon: "📝" },
        { id: "3", name: "Community Builder", icon: "🏗️" },
      ].filter(() => Math.random() > 0.5)

      // Check if this is a full user or temp user
      const isFullUser = Math.random() > 0.3 // 70% chance of being a full user

      if (isFullUser) {
        const newUser = {
          id: Date.now().toString(),
          username,
          profileImageUrl: `https://via.placeholder.com/100x100`,
          twitterScore,
          walletScore,
          telegramScore,
          totalScore,
          badges,
          isVerified: Math.random() > 0.7,
        }
        setUsers((prevUsers) => [...prevUsers, newUser])
        setNotification(`@${username} has been added to the graph with full data.`)
      } else {
        // Create temporary user with only Twitter data
        const tempUser = {
          id: `temp-${Date.now().toString()}`,
          username,
          profileImageUrl: `https://via.placeholder.com/100x100`,
          twitterScore,
          totalScore: twitterScore, // For temp users, total score is just Twitter score
          badges: badges.slice(0, 1), // Temp users get fewer badges
        }
        setTempUsers((prevTempUsers) => [...prevTempUsers, tempUser])
        setNotification(
          `@${username} has been added with Twitter data only. Connect wallet and Telegram for full score.`,
        )
      }

      // Clear notification after 5 seconds
      if (notificationTimeoutRef.current) {
        clearTimeout(notificationTimeoutRef.current)
      }

      notificationTimeoutRef.current = setTimeout(() => {
        setNotification("")
        notificationTimeoutRef.current = null
      }, 5000)

      setUsername("")
    } catch (error) {
      console.error("Error fetching user data:", error)
      setNotification("Error adding user. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const clearUsers = () => {
    setUsers([])
    setTempUsers([])
    localStorage.removeItem("users")
    setNotification("All users have been cleared.")

    // Clear notification after 3 seconds
    if (notificationTimeoutRef.current) {
      clearTimeout(notificationTimeoutRef.current)
    }

    notificationTimeoutRef.current = setTimeout(() => {
      setNotification("")
      notificationTimeoutRef.current = null
    }, 3000)
  }

  return (
    <main className="min-h-screen flex flex-col items-center p-4 md:p-8 bg-vanta">
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
              className="text-cyan-400"
            >
              <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
              <path d="M5 3v4" />
              <path d="M19 17v4" />
              <path d="M3 5h4" />
              <path d="M17 19h4" />
            </svg>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-teal-300">
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
                className="w-full px-4 py-2 rounded-md bg-black/50 border border-cyan-500/30 text-white placeholder:text-gray-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all backdrop-blur-sm"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="p-2 rounded-md bg-black/50 border border-cyan-500/30 text-gray-200 hover:bg-cyan-900/30 hover:border-cyan-500/50 transition-all backdrop-blur-sm"
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
              className="p-2 rounded-md bg-cyan-600/20 border border-cyan-500/50 text-white hover:bg-cyan-700/30 transition-all backdrop-blur-sm"
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
            <div className="mt-4 w-full max-w-md p-3 rounded-lg bg-black/70 border border-cyan-500/30 text-white text-center animate-fadeIn backdrop-blur-sm">
              {notification}
            </div>
          )}
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          {showUserPanel && (
            <div className="w-full md:w-96">
              <div
                className="bg-gradient-to-br from-black/90 to-black/80 rounded-lg overflow-hidden h-full border border-cyan-500/20 shadow-xl"
                style={{ backdropFilter: "blur(10px)" }}
              >
                <div className="bg-black/80 p-3 border-b border-cyan-500/20">
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
                      className="text-cyan-300 mr-2"
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

                <div className="p-4">
                  {users.length === 0 && tempUsers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-center text-gray-200">
                      <div className="border-2 border-dashed border-cyan-400/30 p-6 rounded-lg mb-4">
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
                          className="text-cyan-300 mx-auto mb-2"
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
                    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                      {[...users, ...tempUsers].map((user) => {
                        const isTemp = !("walletScore" in user)

                        return (
                          <div
                            key={user.id}
                            className={`${isTemp ? "bg-red-900/10" : "bg-cyan-900/10"} rounded-lg p-3 border ${isTemp ? "border-red-500/30" : "border-cyan-500/30"} hover:border-opacity-50 transition-all backdrop-blur-sm`}
                          >
                            <div className="flex items-center gap-3 mb-2">
                              <div className="w-10 h-10 rounded-none overflow-hidden border-2 shadow-glow border-cyan-400/50">
                                <img
                                  src={user.profileImageUrl || "https://via.placeholder.com/100x100"}
                                  alt={user.username}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div>
                                <h3 className="font-bold text-white">@{user.username}</h3>
                                <div className="flex items-center gap-1">
                                  <span className="text-xs text-cyan-200">Score: {user.totalScore}</span>
                                  <span className="text-xs text-cyan-200">•</span>
                                  <span className="text-xs text-cyan-200">Badges: {user.badges.length}</span>
                                </div>
                              </div>

                              {isTemp && (
                                <div className="ml-auto px-2 py-1 bg-red-600/50 rounded text-xs font-medium text-white flex items-center">
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

                              {!isTemp && user.isVerified && (
                                <div className="ml-auto px-2 py-1 bg-blue-600/50 rounded text-xs font-medium text-white">
                                  Verified
                                </div>
                              )}
                            </div>

                            <div className="mt-3">
                              <h4 className="text-xs font-semibold text-cyan-200 mb-1">Badges:</h4>
                              <div className="flex flex-wrap gap-2">
                                {user.badges.map((badge) => (
                                  <Badge key={badge.id} {...badge} />
                                ))}

                                {user.badges.length === 0 && (
                                  <span className="text-xs text-cyan-300">No badges earned yet</span>
                                )}
                              </div>
                            </div>

                            {!isTemp && (
                              <div className="mt-3 grid grid-cols-3 gap-2">
                                <div className="bg-black/50 p-2 rounded border border-cyan-500/20">
                                  <div className="text-xs text-cyan-300">Twitter</div>
                                  <div className="font-bold text-white">{user.twitterScore}</div>
                                </div>
                                <div className="bg-black/50 p-2 rounded border border-cyan-500/20">
                                  <div className="text-xs text-cyan-300">Wallet</div>
                                  <div className="font-bold text-white">{user.walletScore}</div>
                                </div>
                                <div className="bg-black/50 p-2 rounded border border-cyan-500/20">
                                  <div className="text-xs text-cyan-300">Telegram</div>
                                  <div className="font-bold text-white">{user.telegramScore}</div>
                                </div>
                              </div>
                            )}

                            {isTemp && (
                              <div className="mt-3 p-2 bg-black/50 rounded border border-red-500/20">
                                <p className="text-xs text-red-200">
                                  <span className="font-semibold">Limited data:</span> To get a complete profile and
                                  accurate total score, please connect your wallet and Telegram account.
                                </p>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className={`flex-1 ${showUserPanel ? "md:max-w-[calc(100%-24rem)]" : "w-full"}`}>
            <div className="p-6 bg-black/70 rounded-lg border border-cyan-500/20 shadow-xl backdrop-blur-sm">
              <div className="w-full">
                <div className="flex justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-4 h-4 rounded-none bg-cyan-600 mr-2"></div>
                    <span className="text-white text-sm">Full Users</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 rounded-none bg-red-400 mr-2"></div>
                    <span className="text-white text-sm">Temporary Users</span>
                  </div>
                </div>
                <canvas
                  ref={canvasRef}
                  className="w-full aspect-[4/3] rounded-lg border border-cyan-500/20 bg-black/80"
                  style={{
                    boxShadow: "0 0 30px rgba(0, 210, 210, 0.1)",
                  }}
                  onMouseMove={handleMouseMove}
                  onMouseLeave={() => setHoverInfo(null)}
                />
                <div className="mt-2 text-xs text-cyan-300 text-center">
                  <span className="italic">Hover over a user to see details</span>
                </div>
              </div>

              {users.length === 0 && tempUsers.length === 0 && (
                <div className="mt-4 p-4 bg-black/50 rounded-lg border border-cyan-500/20 text-center">
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
                    className="mx-auto mb-2 text-cyan-300"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 16v-4" />
                    <path d="M12 8h.01" />
                  </svg>
                  <p className="text-cyan-100">
                    Enter a Twitter username to plot it on the graph. The X-axis represents total score, and the Y-axis
                    represents total badges.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-center mt-6 gap-4">
          <button
            onClick={() => setShowUserPanel(!showUserPanel)}
            className="px-4 py-2 bg-cyan-600/20 hover:bg-cyan-700/30 border border-cyan-500/50 text-white rounded-full flex items-center shadow-lg shadow-cyan-900/20 transition-all backdrop-blur-sm"
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
              className="mr-2"
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
            className="px-4 py-2 bg-red-500/30 hover:bg-red-600/40 border border-red-400/50 text-white rounded-full flex items-center shadow-lg shadow-red-900/20 transition-all backdrop-blur-sm"
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
              className="mr-2"
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

        <div className="text-center text-xs text-gray-400 mt-8">
          <p>For a proper plot with total score and total badges, please login with all required logins</p>
        </div>
      </div>
    </main>
  )
}

export default App

