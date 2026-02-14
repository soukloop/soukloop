"use client"

import { useState, useRef } from 'react'
import { Play, Pause, FileText, MapPin, RefreshCw, Download, X, CheckCheck, Clock } from 'lucide-react'

interface Attachment {
    type: string
    url: string
    name?: string
    size?: number
    mimeType?: string
    duration?: number // For voice messages
}

interface MessageBubbleProps {
    message: {
        id: string
        message: string | null
        messageType?: string
        attachments?: Attachment[]
        latitude?: number
        longitude?: number
        status?: string
        isRead?: boolean
        createdAt: string
        senderId: string
    }
    isOwn: boolean
    onRetry?: () => void
}

export function MessageBubble({ message, isOwn, onRetry }: MessageBubbleProps) {
    const [showImageViewer, setShowImageViewer] = useState(false)
    const [showVideoPlayer, setShowVideoPlayer] = useState(false)
    const [viewerMedia, setViewerMedia] = useState<string>('')
    const videoRef = useRef<HTMLVideoElement>(null)

    const formatTime = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    const formatFileSize = (bytes?: number): string => {
        if (!bytes) return ''
        if (bytes < 1024) return `${bytes} B`
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    }

    // Render status icon
    const renderStatus = () => {
        if (!isOwn) return null

        if (message.status === 'sending') {
            return <Clock className="size-3 opacity-70" />
        }
        if (message.status === 'failed') {
            return null
        }
        if (message.isRead) {
            return <CheckCheck className="size-3 text-blue-400" />
        }
        return <CheckCheck className="size-3 opacity-70" />
    }

    const bubbleColor = isOwn ? 'bg-[#E87A3F]' : 'bg-gray-100'
    const textColor = isOwn ? 'text-white' : 'text-gray-900'
    const subTextColor = isOwn ? 'text-white/70' : 'text-gray-500'

    const renderImage = (attachment: Attachment, index: number) => {
        return (
            <ImageAttachment
                key={index}
                attachment={attachment}
                onClick={() => { setViewerMedia(attachment.url); setShowImageViewer(true) }}
            />
        )
    }

    const renderVideo = (attachment: Attachment, index: number) => (
        <VideoAttachment
            key={index}
            attachment={attachment}
            onClick={() => { setViewerMedia(attachment.url); setShowVideoPlayer(true) }}
        />
    )

    const renderVoice = (attachment: Attachment, index: number) => {
        return (
            <VoiceAttachment
                key={index}
                attachment={attachment}
                isOwn={isOwn}
                textColor={textColor}
                subTextColor={subTextColor}
            />
        )
    }

    const renderFile = (attachment: Attachment, index: number) => (
        <a
            key={index}
            href={attachment.url}
            download={attachment.name}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 hover:opacity-90 transition-opacity"
        >
            <div className={`size-10 rounded-lg flex items-center justify-center ${isOwn ? 'bg-white/20' : 'bg-gray-200'}`}>
                <FileText className={`size-5 ${textColor}`} />
            </div>
            <div className="min-w-0 flex-1">
                <p className={`font-medium text-sm truncate ${textColor}`}>{attachment.name || 'File'}</p>
                <p className={`text-xs ${subTextColor}`}>{formatFileSize(attachment.size)}</p>
            </div>
            <Download className={`size-5 shrink-0 ${subTextColor}`} />
        </a>
    )

    const renderLocation = () => {
        if (!message.latitude || !message.longitude) return null

        const googleMapsUrl = `https://www.google.com/maps?q=${message.latitude},${message.longitude}`

        return (
            <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
            >
                <div className="w-[200px] h-[100px] bg-gradient-to-br from-green-200 to-green-300 rounded-lg flex items-center justify-center">
                    <MapPin className="size-10 text-red-500" />
                </div>
                <p className={`text-sm mt-1 ${isOwn ? 'text-white' : 'text-blue-600'}`}>
                    📍 View on Maps
                </p>
            </a>
        )
    }

    const hasMedia = message.attachments && message.attachments.length > 0

    return (
        <>
            <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-1`}>
                <div className={`rounded-2xl px-3 py-2 max-w-[80%] ${bubbleColor}`}>
                    {/* Media attachments */}
                    {hasMedia && (
                        <div className="space-y-2 mb-1">
                            {message.attachments!.map((attachment, index) => {
                                switch (attachment.type) {
                                    case 'image': return renderImage(attachment, index)
                                    case 'video': return renderVideo(attachment, index)
                                    case 'voice': return renderVoice(attachment, index)
                                    case 'file': return renderFile(attachment, index)
                                    default: return null
                                }
                            })}
                        </div>
                    )}

                    {/* Location */}
                    {message.messageType === 'location' && (
                        <div className="mb-1">
                            {renderLocation()}
                        </div>
                    )}

                    {/* Text message */}
                    {message.message && (
                        <p className={`whitespace-pre-wrap break-words text-sm ${textColor}`}>
                            {message.message}
                        </p>
                    )}

                    {/* Timestamp inside bubble */}
                    <div className={`flex justify-end items-center gap-1 mt-1 ${subTextColor}`}>
                        <span className="text-[10px]">{formatTime(message.createdAt)}</span>
                        {renderStatus()}
                    </div>
                </div>
            </div>

            {/* Failed status with retry */}
            {message.status === 'failed' && onRetry && (
                <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-2`}>
                    <button
                        onClick={onRetry}
                        className="flex items-center gap-1 text-red-500 text-xs hover:underline"
                    >
                        <RefreshCw className="size-3" />
                        Failed - Tap to retry
                    </button>
                </div>
            )}

            {/* Fullscreen Image Viewer */}
            {showImageViewer && (
                <div
                    className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
                    onClick={() => setShowImageViewer(false)}
                >
                    <button
                        className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
                        onClick={() => setShowImageViewer(false)}
                    >
                        <X className="size-8" />
                    </button>
                    <img
                        src={viewerMedia}
                        alt="Full size"
                        className="max-w-full max-h-full object-contain"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}

            {/* Fullscreen Video Player */}
            {showVideoPlayer && (
                <div
                    className="fixed inset-0 z-50 bg-black flex items-center justify-center p-4"
                    onClick={() => { setShowVideoPlayer(false); videoRef.current?.pause() }}
                >
                    <button
                        className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
                        onClick={() => { setShowVideoPlayer(false); videoRef.current?.pause() }}
                    >
                        <X className="size-8" />
                    </button>
                    <video
                        ref={videoRef}
                        src={viewerMedia}
                        controls
                        autoPlay
                        className="max-w-full max-h-full"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
        </>
    )
}

// Sub-components for media with loading states

function ImageAttachment({ attachment, onClick }: { attachment: Attachment, onClick: () => void }) {
    const [isLoading, setIsLoading] = useState(true)
    const [hasError, setHasError] = useState(false)

    if (hasError) {
        return (
            <div className="flex items-center justify-center bg-gray-100 rounded-lg min-h-[150px] min-w-[150px] border border-gray-200">
                <div className="flex flex-col items-center gap-2 text-gray-400">
                    <FileText className="size-8" />
                    <span className="text-xs">Failed to load</span>
                </div>
            </div>
        )
    }

    return (
        <div onClick={onClick} className="cursor-pointer rounded-lg overflow-hidden relative min-h-[150px] min-w-[150px]">
            {isLoading && <div className="absolute inset-0 bg-gray-200 animate-pulse" />}
            <img
                src={attachment.url}
                alt={attachment.name || 'Image'}
                className={`max-w-[280px] max-h-[280px] object-contain rounded-lg transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
                loading="lazy"
                onLoad={() => setIsLoading(false)}
                onError={() => {
                    setIsLoading(false)
                    setHasError(true)
                }}
            />
        </div>
    )
}

function VideoAttachment({ attachment, onClick }: { attachment: Attachment, onClick: () => void }) {
    const [isLoading, setIsLoading] = useState(true)

    return (
        <div onClick={onClick} className="relative cursor-pointer rounded-lg overflow-hidden min-h-[150px] min-w-[200px]">
            {isLoading && <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
                <Play className="size-8 text-gray-300" />
            </div>}
            <video
                src={attachment.url}
                className={`max-w-[280px] max-h-[280px] object-contain rounded-lg bg-black transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
                preload="metadata"
                muted
                onLoadedData={() => setIsLoading(false)}
            />
            {/* Play button overlay */}
            {!isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors">
                    <div className="size-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                        <Play className="size-7 text-gray-800 ml-1" fill="currentColor" />
                    </div>
                </div>
            )}
        </div>
    )
}

function VoiceAttachment({ attachment, isOwn, textColor, subTextColor }: { attachment: Attachment, isOwn: boolean, textColor: string, subTextColor: string }) {
    const [isPlaying, setIsPlaying] = useState(false)
    const [audioProgress, setAudioProgress] = useState(0)
    const [audioDuration, setAudioDuration] = useState(0)
    const [currentTime, setCurrentTime] = useState(0)
    const [audioLoaded, setAudioLoaded] = useState(false)
    const audioRef = useRef<HTMLAudioElement>(null)

    const toggleAudioPlay = async (e: React.MouseEvent) => {
        e.stopPropagation()
        if (!audioRef.current) return

        try {
            if (isPlaying) {
                audioRef.current.pause()
                setIsPlaying(false)
            } else {
                await audioRef.current.play()
                setIsPlaying(true)
            }
        } catch (error) {
            console.error('Audio playback error:', error)
        }
    }

    const formatDuration = (seconds: number): string => {
        if (!seconds || isNaN(seconds) || !isFinite(seconds)) return '0:00'
        const mins = Math.floor(seconds / 60)
        const secs = Math.floor(seconds % 60)
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    const waveformBars = Array(30).fill(0).map((_, i) =>
        4 + Math.sin(i * 0.5) * 6 + Math.cos(i * 0.3) * 4
    )

    // Using duration from attachment if available (optimistic), or loaded duration
    const displayDuration = attachment.duration || audioDuration

    return (
        <div className="flex items-center gap-2 min-w-[200px]">
            {/* Simple Skeleton for Voice if not loaded (though canPlay fires fast) */}
            {!audioLoaded && !attachment.duration ? (
                <div className="flex items-center gap-2 w-full animate-pulse">
                    <div className="size-9 rounded-full bg-white/30" />
                    <div className="flex-1 h-6 bg-white/30 rounded" />
                </div>
            ) : (
                <>
                    {/* Play/Pause Button */}
                    <button
                        onClick={toggleAudioPlay}
                        className={`size-9 rounded-full flex items-center justify-center shrink-0 transition-colors ${isOwn
                            ? 'bg-white/20 hover:bg-white/30 text-white'
                            : 'bg-[#E87A3F] hover:bg-[#d96d34] text-white'
                            }`}
                    >
                        {isPlaying ? <Pause className="size-4" /> : <Play className="size-4 ml-0.5" />}
                    </button>

                    {/* Waveform */}
                    <div className="flex-1 flex items-center gap-[2px] h-6">
                        {waveformBars.map((height, i) => {
                            const progress = audioProgress / 100
                            const barProgress = i / waveformBars.length
                            const isPlayed = barProgress < progress

                            return (
                                <div
                                    key={i}
                                    className={`w-[2px] rounded-full transition-colors ${isOwn
                                        ? isPlayed ? 'bg-white' : 'bg-white/40'
                                        : isPlayed ? 'bg-[#E87A3F]' : 'bg-gray-300'
                                        }`}
                                    style={{ height: `${height}px` }}
                                />
                            )
                        })}
                    </div>

                    {/* Duration */}
                    <span className={`text-[11px] font-medium shrink-0 ${subTextColor}`}>
                        {isPlaying ? formatDuration(currentTime) : formatDuration(displayDuration)}
                    </span>
                </>
            )}

            {/* Hidden Audio Element */}
            <audio
                ref={audioRef}
                src={attachment.url}
                preload="auto"
                onTimeUpdate={() => {
                    if (audioRef.current) {
                        setAudioProgress((audioRef.current.currentTime / audioRef.current.duration) * 100)
                        setCurrentTime(audioRef.current.currentTime)
                    }
                }}
                onLoadedMetadata={() => {
                    if (audioRef.current && isFinite(audioRef.current.duration)) {
                        setAudioDuration(audioRef.current.duration)
                        setAudioLoaded(true)
                    }
                }}
                onCanPlay={() => setAudioLoaded(true)}
                onEnded={() => {
                    setIsPlaying(false)
                    setAudioProgress(0)
                    setCurrentTime(0)
                }}
            />
        </div>
    )
}
