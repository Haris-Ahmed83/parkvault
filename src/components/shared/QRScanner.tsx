"use client"

import { useEffect, useRef, useState } from "react"
import jsQR from "jsqr"

interface QRScannerProps {
  onScan: (data: string) => void
  onClose: () => void
}

export default function QRScanner({ onScan, onClose }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    let stream: MediaStream | null = null
    let animId: number

    async function start() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        })
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.play()
          scanFrame()
        }
      } catch {
        setError("Camera access denied or not available")
      }
    }

    function scanFrame() {
      if (!videoRef.current || !canvasRef.current) return

      const video = videoRef.current
      const canvas = canvasRef.current

      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        const ctx = canvas.getContext("2d")
        if (!ctx) return

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const code = jsQR(imageData.data, imageData.width, imageData.height)

        if (code) {
          onScan(code.data)
          cleanup()
          return
        }
      }

      animId = requestAnimationFrame(scanFrame)
    }

    function cleanup() {
      if (animId) cancelAnimationFrame(animId)
      if (stream) {
        stream.getTracks().forEach((t) => t.stop())
      }
    }

    start()

    return cleanup
  }, [onScan])

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 max-w-sm w-full">
        <div className="relative aspect-square bg-black rounded-xl overflow-hidden mb-4">
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover"
            playsInline
          />
          <canvas ref={canvasRef} className="hidden" />
          {error && (
            <div className="absolute inset-0 flex items-center justify-center text-white text-sm p-4 text-center">
              {error}
            </div>
          )}
          <div className="absolute inset-0 border-2 border-indigo-400 rounded-xl m-8" />
        </div>
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 h-11 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}