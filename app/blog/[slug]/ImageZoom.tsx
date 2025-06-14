'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ZoomIn, Download, RotateCcw, Plus, Minus } from 'lucide-react'

interface ImageZoomProps {
  src: string
  alt: string
  className?: string
}

export default function ImageZoom({ src, alt, className = '' }: ImageZoomProps) {
  const [isZoomed, setIsZoomed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 })
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 })
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 })
  const imageRef = useRef<HTMLImageElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const MIN_SCALE = 0.5
  const MAX_SCALE = 5

  // Reset zoom and position when modal opens
  const resetZoom = useCallback(() => {
    setScale(1)
    setPosition({ x: 0, y: 0 })
  }, [])

  // Update container size on resize
  useEffect(() => {
    const updateContainerSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        setContainerSize({ width: rect.width, height: rect.height })
      }
    }

    if (isZoomed) {
      updateContainerSize()
      window.addEventListener('resize', updateContainerSize)
    }

    return () => {
      window.removeEventListener('resize', updateContainerSize)
    }
  }, [isZoomed])

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsZoomed(false)
        resetZoom()
      }
    }

    if (isZoomed) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isZoomed, resetZoom])

  // Handle wheel zoom
  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault()
    
    if (!imageRef.current || !containerRef.current) return

    const delta = e.deltaY > 0 ? 0.9 : 1.1
    const newScale = Math.min(Math.max(scale * delta, MIN_SCALE), MAX_SCALE)

    if (newScale !== scale) {
      setScale(newScale)
      // Reset position when zooming out to 1x or less
      if (newScale <= 1) {
        setPosition({ x: 0, y: 0 })
      }
    }
  }, [scale])

  // Handle mouse down for dragging
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (scale <= 1) return
    
    setIsDragging(true)
    setDragStart({ x: e.clientX, y: e.clientY })
    setLastPanPoint(position)
    e.preventDefault()
  }, [scale, position])

  // Handle mouse move for dragging
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return

    const deltaX = e.clientX - dragStart.x
    const deltaY = e.clientY - dragStart.y

    setPosition({
      x: lastPanPoint.x + deltaX,
      y: lastPanPoint.y + deltaY
    })
  }, [isDragging, dragStart, lastPanPoint])

  // Handle mouse up
  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  // Handle double click to zoom
  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current) return

    if (scale === 1) {
      // Zoom in to 2x from center
      setScale(2)
      setPosition({ x: 0, y: 0 })
    } else {
      // Reset zoom
      resetZoom()
    }
  }, [scale, resetZoom])

  // Add event listeners for mouse events
  useEffect(() => {
    if (isZoomed) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      
      if (containerRef.current) {
        containerRef.current.addEventListener('wheel', handleWheel, { passive: false })
      }
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      
      if (containerRef.current) {
        containerRef.current.removeEventListener('wheel', handleWheel)
      }
    }
  }, [isZoomed, handleMouseMove, handleMouseUp, handleWheel])

  const handleImageLoad = () => {
    setIsLoading(false)
    if (imageRef.current) {
      setImageSize({
        width: imageRef.current.naturalWidth,
        height: imageRef.current.naturalHeight
      })
    }
  }

  const handleDownload = async () => {
    try {
      const response = await fetch(src)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = alt || 'image'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Download failed:', error)
    }
  }

  const zoomIn = () => {
    const newScale = Math.min(scale * 1.2, MAX_SCALE)
    if (newScale !== scale) {
      setScale(newScale)
      // Keep image centered - no position adjustment needed
    }
  }

  const zoomOut = () => {
    const newScale = Math.max(scale * 0.8, MIN_SCALE)
    if (newScale !== scale) {
      setScale(newScale)
      // Reset position when zooming out to 1x or less
      if (newScale <= 1) {
        setPosition({ x: 0, y: 0 })
      }
    }
  }

  const closeModal = () => {
    setIsZoomed(false)
    resetZoom()
  }

  return (
    <>
      {/* Thumbnail Image */}
      <motion.div
        className={`relative group cursor-pointer ${className}`}
        onClick={() => {
          setIsZoomed(true)
          setIsLoading(true)
          resetZoom()
        }}
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
      >
        <img
          src={src}
          alt={alt}
          className="w-full h-auto rounded-lg border border-cyber-green/20 shadow-lg object-contain"
          style={{ maxHeight: '400px' }}
        />
        
        {/* Hover Overlay */}
        <motion.div
          className="absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
        >
          <div className="flex items-center gap-2 text-cyber-green font-mono">
            <ZoomIn className="w-6 h-6" />
            <span className="text-sm font-semibold">Click to zoom</span>
          </div>
        </motion.div>

        {/* Cyber Glow Effect */}
        <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="absolute inset-0 rounded-lg border-2 border-cyber-green/50 animate-pulse" />
          <div className="absolute inset-0 rounded-lg bg-cyber-green/5" />
        </div>
      </motion.div>

      {/* Zoom Modal */}
      <AnimatePresence>
        {isZoomed && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-black/95 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
            />

            {/* Modal Content */}
            <motion.div
              className="relative w-full max-w-6xl h-full max-h-[90vh] bg-gray-900/95 rounded-lg border border-cyber-green/30 shadow-2xl overflow-hidden flex flex-col"
              initial={{ scale: 0.5, opacity: 0, rotateX: -15 }}
              animate={{ scale: 1, opacity: 1, rotateX: 0 }}
              exit={{ scale: 0.5, opacity: 0, rotateX: 15 }}
              transition={{ 
                type: "spring", 
                damping: 25, 
                stiffness: 300,
                duration: 0.4 
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-cyber-green/20 bg-black/80 backdrop-blur-sm flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500 animate-pulse" style={{ animationDelay: '0.2s' }} />
                  <div className="w-3 h-3 rounded-full bg-cyber-green animate-pulse" style={{ animationDelay: '0.4s' }} />
                  <span className="ml-3 text-cyber-green font-mono text-sm">
                    {alt || 'Image Viewer'} - {Math.round(scale * 100)}% 
                    {scale > 1 && <span className="text-yellow-400 ml-2">ZOOMED</span>}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <motion.button
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      zoomOut()
                    }}
                    className="p-2 text-gray-400 hover:text-cyber-green transition-colors rounded-md hover:bg-cyber-green/10"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={scale <= MIN_SCALE}
                    type="button"
                  >
                    <Minus className="w-5 h-5" />
                  </motion.button>
                  
                  <motion.button
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      zoomIn()
                    }}
                    className="p-2 text-gray-400 hover:text-cyber-green transition-colors rounded-md hover:bg-cyber-green/10"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={scale >= MAX_SCALE}
                    type="button"
                  >
                    <Plus className="w-5 h-5" />
                  </motion.button>
                  
                  <motion.button
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      resetZoom()
                    }}
                    className="p-2 text-gray-400 hover:text-cyber-green transition-colors rounded-md hover:bg-cyber-green/10"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                  >
                    <RotateCcw className="w-5 h-5" />
                  </motion.button>
                  
                  <motion.button
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      handleDownload()
                    }}
                    className="p-2 text-gray-400 hover:text-cyber-green transition-colors rounded-md hover:bg-cyber-green/10"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                  >
                    <Download className="w-5 h-5" />
                  </motion.button>
                  
                  <motion.button
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      closeModal()
                    }}
                    className="p-2 text-gray-400 hover:text-red-400 transition-colors rounded-md hover:bg-red-400/10"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>

              {/* Image Container */}
              <div 
                ref={containerRef}
                className="relative flex-1 flex items-center justify-center overflow-hidden bg-black/20"
                style={{ cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
                onMouseDown={handleMouseDown}
                onDoubleClick={handleDoubleClick}
              >
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
                    <div className="flex items-center gap-3 text-cyber-green font-mono">
                      <div className="w-6 h-6 border-2 border-cyber-green border-t-transparent rounded-full animate-spin" />
                      <span>Loading...</span>
                    </div>
                  </div>
                )}
                
                <motion.img
                  ref={imageRef}
                  src={src}
                  alt={alt}
                  className="max-w-full max-h-full object-contain select-none"
                  style={{
                    transform: scale > 1 && (position.x !== 0 || position.y !== 0) 
                      ? `scale(${scale}) translate(${position.x}px, ${position.y}px)`
                      : `scale(${scale})`,
                    transformOrigin: 'center center',
                    transition: isDragging ? 'none' : 'transform 0.2s ease-out'
                  }}
                  onLoad={handleImageLoad}
                  onDragStart={(e) => e.preventDefault()}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.3 }}
                />

                {/* Cyber Grid Overlay */}
                <div className="absolute inset-0 pointer-events-none opacity-5">
                  <div className="w-full h-full" style={{
                    backgroundImage: `
                      linear-gradient(rgba(0, 255, 65, 0.1) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(0, 255, 65, 0.1) 1px, transparent 1px)
                    `,
                    backgroundSize: '20px 20px'
                  }} />
                </div>
              </div>

              {/* Footer */}
              <div className="p-3 border-t border-cyber-green/20 bg-black/80 backdrop-blur-sm flex-shrink-0">
                <div className="flex items-center justify-between text-xs font-mono text-gray-400">
                  <span>Double-click to zoom • Scroll to zoom • Drag to pan • ESC to close</span>
                  <span className="text-cyber-green">ENHANCED_VIEW_MODE</span>
                </div>
              </div>

              {/* Cyber Glow Border */}
              <div className="absolute inset-0 rounded-lg border-2 border-cyber-green/20 pointer-events-none">
                <div className="absolute inset-0 rounded-lg border border-cyber-green/40 animate-pulse" />
              </div>
            </motion.div>

            {/* Matrix Rain Effect */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
              {[...Array(15)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute text-cyber-green/20 font-mono text-xs"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: '-10px',
                  }}
                  animate={{
                    y: ['0vh', '110vh'],
                  }}
                  transition={{
                    duration: Math.random() * 4 + 3,
                    repeat: Infinity,
                    delay: Math.random() * 3,
                    ease: 'linear',
                  }}
                >
                  {String.fromCharCode(0x30A0 + Math.random() * 96)}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
} 