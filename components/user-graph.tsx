"use client"

import { useRef, useEffect } from "react"
import Image from "next/image"
import type { User, TempUser } from "@/types/user"

interface UserGraphProps {
  users: User[]
  tempUsers: TempUser[]
}

export default function UserGraph({ users, tempUsers }: UserGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Calculate the maximum score and badge count for scaling
  const maxScore = Math.max(
    1, // Minimum scale
    ...users.map((user) => user.totalScore),
    ...tempUsers.map((user) => user.totalScore),
  )

  const maxBadges = Math.max(
    1, // Minimum scale
    ...users.map((user) => user.badges.length),
    ...tempUsers.map((user) => user.badges.length),
  )

  // Draw the graph
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()

    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr

    ctx.scale(dpr, dpr)

    // Clear canvas
    ctx.clearRect(0, 0, rect.width, rect.height)

    // Set background
    ctx.fillStyle = "rgba(0, 0, 0, 0.3)"
    ctx.fillRect(0, 0, rect.width, rect.height)

    // Draw grid
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)"
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

    // Draw axes
    ctx.strokeStyle = "rgba(255, 255, 255, 0.5)"
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
    ctx.fillStyle = "white"
    ctx.font = "12px Arial"
    ctx.textAlign = "center"

    // X-axis label
    ctx.fillText("Total Score", rect.width / 2, rect.height - 10)

    // Y-axis label
    ctx.save()
    ctx.translate(10, rect.height / 2)
    ctx.rotate(-Math.PI / 2)
    ctx.fillText("Total Badges", 0, 0)
    ctx.restore()

    // Draw scale markers
    ctx.textAlign = "right"
    ctx.fillText("0", 25, rect.height - 25)
    ctx.fillText(maxScore.toString(), rect.width - 5, rect.height - 25)

    ctx.textAlign = "left"
    ctx.fillText("0", 35, rect.height - 35)
    ctx.fillText(maxBadges.toString(), 35, 15)

    // Draw all users first without profile images
    const drawUserPoint = (user, isTemp) => {
      const x = 30 + (user.totalScore / maxScore) * (rect.width - 60)
      const y = rect.height - 30 - (user.badges.length / maxBadges) * (rect.height - 60)

      // Draw point
      ctx.beginPath()
      ctx.arc(x, y, isTemp ? 8 : 12, 0, Math.PI * 2)
      ctx.fillStyle = isTemp ? "rgba(255, 100, 100, 0.7)" : "rgba(138, 43, 226, 0.7)"
      ctx.fill()
      ctx.strokeStyle = isTemp ? "rgba(255, 100, 100, 0.9)" : "rgba(138, 43, 226, 0.9)"
      ctx.lineWidth = 2
      ctx.stroke()

      // Draw username
      ctx.fillStyle = "white"
      ctx.font = "10px Arial"
      ctx.textAlign = "center"
      ctx.fillText(`@${user.username}`, x, y - 15)

      return { x, y, isTemp }
    }

    // Draw all users first
    const userPoints = users.map((user) => drawUserPoint(user, false))
    const tempUserPoints = tempUsers.map((user) => drawUserPoint(user, true))

    // Then load and draw profile images separately
    const loadProfileImage = (user, point) => {
      if (!user.profileImageUrl) return;
      
      const img = new Image()
      img.crossOrigin = "anonymous"
      img.onload = () => {
        ctx.save()
        ctx.beginPath()
        ctx.arc(point.x, point.y, point.isTemp ? 6 : 10, 0, Math.PI * 2)
        ctx.closePath()
        ctx.clip()
        ctx.drawImage(
          img,
          point.x - (point.isTemp ? 6 : 10),
          point.y - (point.isTemp ? 6 : 10),
          point.isTemp ? 12 : 20,
          point.isTemp ? 12 : 20,
        )
        ctx.restore()
      }
      img.src = user.profileImageUrl
    }

    // Load profile images
    users.forEach((user, i) => loadProfileImage(user, userPoints[i]))
    tempUsers.forEach((user, i) => loadProfileImage(user, tempUserPoints[i]))
  }, [users, tempUsers, maxScore, maxBadges])

  return (
    <div className="w-full">
      <div className="flex justify-between mb-4">
        <div className="flex items-center">
          <div className="w-4 h-4 rounded-full bg-purple-600 mr-2"></div>
          <span className="text-white text-sm">Full Users</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 rounded-full bg-red-400 mr-2"></div>
          <span className="text-white text-sm">Temporary Users</span>
        </div>
      </div>
      <canvas
        ref={canvasRef}
        className="w-full aspect-square rounded-lg border border-purple-500/50 bg-black/50"
        style={{
          boxShadow: "0 0 20px rgba(168, 85, 247, 0.2)",
          background: "linear-gradient(135deg, rgba(20, 20, 20, 0.8), rgba(30, 10, 60, 0.8))",
        }}
      />
    </div>
  )
}