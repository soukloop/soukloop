"use client"

import { useState, useRef, useCallback, useEffect } from 'react'

interface UseVoiceRecorderReturn {
    isRecording: boolean
    isPaused: boolean
    duration: number
    audioBlob: Blob | null
    audioUrl: string | null
    error: string | null
    startRecording: () => Promise<void>
    stopRecording: () => Promise<Blob | null>
    pauseRecording: () => void
    resumeRecording: () => void
    cancelRecording: () => void
    resetRecording: () => void
}

const MAX_DURATION = 60 // Maximum 60 seconds

export function useVoiceRecorder(): UseVoiceRecorderReturn {
    const [isRecording, setIsRecording] = useState(false)
    const [isPaused, setIsPaused] = useState(false)
    const [duration, setDuration] = useState(0)
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
    const [audioUrl, setAudioUrl] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)

    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const streamRef = useRef<MediaStream | null>(null)
    const chunksRef = useRef<Blob[]>([])
    const timerRef = useRef<NodeJS.Timeout | null>(null)
    const startTimeRef = useRef<number>(0)
    const onStopResolverRef = useRef<((blob: Blob | null) => void) | null>(null)

    // Clean up on unmount
    useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current)
            }
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop())
            }
            if (audioUrl) {
                URL.revokeObjectURL(audioUrl)
            }
        }
    }, [audioUrl])

    // Auto-stop at max duration
    useEffect(() => {
        if (duration >= MAX_DURATION && isRecording) {
            stopRecording()
        }
    }, [duration, isRecording])

    const startRecording = useCallback(async () => {
        try {
            setError(null)
            chunksRef.current = []
            setAudioBlob(null)
            if (audioUrl) URL.revokeObjectURL(audioUrl)
            setAudioUrl(null)

            // Request microphone permission
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            streamRef.current = stream

            // Try different MIME types for browser compatibility
            const mimeTypes = [
                'audio/webm;codecs=opus',
                'audio/webm',
                'audio/ogg;codecs=opus',
                'audio/mp4',
                '' // fallback to browser default
            ]

            let selectedMimeType = ''
            for (const mimeType of mimeTypes) {
                if (mimeType === '' || MediaRecorder.isTypeSupported(mimeType)) {
                    selectedMimeType = mimeType
                    break
                }
            }

            // Create MediaRecorder with best available format
            const options: MediaRecorderOptions = {}
            if (selectedMimeType) {
                options.mimeType = selectedMimeType
            }

            const mediaRecorder = new MediaRecorder(stream, options)
            mediaRecorderRef.current = mediaRecorder

            // Handle data available
            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    chunksRef.current.push(event.data)
                }
            }

            // Handle recording stop
            mediaRecorder.onstop = () => {
                const actualMimeType = mediaRecorder.mimeType || 'audio/webm'
                const blob = new Blob(chunksRef.current, { type: actualMimeType })
                setAudioBlob(blob)
                setAudioUrl(URL.createObjectURL(blob))

                if (onStopResolverRef.current) {
                    onStopResolverRef.current(blob)
                    onStopResolverRef.current = null
                }

                // Stop all tracks
                if (streamRef.current) {
                    streamRef.current.getTracks().forEach(track => track.stop())
                }
            }

            // Start recording
            mediaRecorder.start(100) // Collect data every 100ms
            setIsRecording(true)
            setIsPaused(false)
            setDuration(0)
            startTimeRef.current = Date.now()

            // Start timer
            timerRef.current = setInterval(() => {
                const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000)
                setDuration(elapsed)
            }, 100)

        } catch (err: any) {
            console.error('Error starting recording:', err)
            if (err.name === 'NotAllowedError') {
                setError('Microphone permission denied')
            } else {
                setError('Failed to start recording')
            }
        }
    }, [audioUrl])

    const stopRecording = useCallback(() => {
        return new Promise<Blob | null>((resolve) => {
            if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
                onStopResolverRef.current = resolve
                mediaRecorderRef.current.stop()
                setIsRecording(false)
                setIsPaused(false)

                if (timerRef.current) {
                    clearInterval(timerRef.current)
                    timerRef.current = null
                }
            } else {
                resolve(null)
            }
        })
    }, [])

    const pauseRecording = useCallback(() => {
        if (mediaRecorderRef.current && isRecording && !isPaused) {
            mediaRecorderRef.current.pause()
            setIsPaused(true)

            if (timerRef.current) {
                clearInterval(timerRef.current)
            }
        }
    }, [isRecording, isPaused])

    const resumeRecording = useCallback(() => {
        if (mediaRecorderRef.current && isRecording && isPaused) {
            mediaRecorderRef.current.resume()
            setIsPaused(false)

            // Resume timer
            const pausedDuration = duration
            startTimeRef.current = Date.now() - (pausedDuration * 1000)
            timerRef.current = setInterval(() => {
                const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000)
                setDuration(elapsed)
            }, 100)
        }
    }, [isRecording, isPaused, duration])

    const cancelRecording = useCallback(() => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.onstop = null // Don't trigger the resolver
            mediaRecorderRef.current.stop()
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop())
        }
        if (timerRef.current) {
            clearInterval(timerRef.current)
            timerRef.current = null
        }

        setIsRecording(false)
        setIsPaused(false)
        setDuration(0)
        setAudioBlob(null)
        setAudioUrl(null)
        chunksRef.current = []
        if (onStopResolverRef.current) {
            onStopResolverRef.current(null)
            onStopResolverRef.current = null
        }
    }, [])

    const resetRecording = useCallback(() => {
        if (audioUrl) {
            URL.revokeObjectURL(audioUrl)
        }
        setAudioBlob(null)
        setAudioUrl(null)
        setDuration(0)
        setError(null)
    }, [audioUrl])

    return {
        isRecording,
        isPaused,
        duration,
        audioBlob,
        audioUrl,
        error,
        startRecording,
        stopRecording,
        pauseRecording,
        resumeRecording,
        cancelRecording,
        resetRecording
    }
}

// Helper to format duration as mm:ss
export function formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
}
