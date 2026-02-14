"use client"

import { X, Send, Mic, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatDuration } from '@/hooks/useVoiceRecorder'

interface VoiceRecorderProps {
    isRecording: boolean
    duration: number
    onCancel: () => void
    onSend: () => void
}

export function VoiceRecorder({
    isRecording,
    duration,
    onCancel,
    onSend
}: VoiceRecorderProps) {

    // Generate waveform pattern
    const generateWaveform = (count: number) => {
        const bars = []
        for (let i = 0; i < count; i++) {
            const height = 4 + Math.sin(i * 0.4) * 8 + Math.cos(i * 0.7) * 6
            bars.push(Math.max(4, Math.min(20, height)))
        }
        return bars
    }

    const waveformBars = generateWaveform(40)

    if (!isRecording) {
        return null // Component only shows during recording
    }

    return (
        <div className="flex items-center gap-2 h-12 px-3 bg-white border rounded-2xl shadow-sm flex-1">
            {/* Cancel/Delete Button */}
            <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-10 text-red-500 hover:text-red-600 hover:bg-red-50 shrink-0"
                onClick={onCancel}
            >
                <Trash2 className="size-5" />
            </Button>

            {/* Recording waveform animation */}
            <div className="flex-1 flex items-center gap-[2px] h-8 overflow-hidden">
                {waveformBars.map((height, i) => (
                    <div
                        key={i}
                        className="w-[4px] bg-red-500 rounded-full animate-pulse"
                        style={{
                            height: `${height}px`,
                            animationDelay: `${i * 30}ms`
                        }}
                    />
                ))}
            </div>

            {/* Recording indicator */}
            <div className="flex items-center gap-2 shrink-0">
                <span className="size-2.5 rounded-full bg-red-500 animate-pulse" />
                <span className="text-sm font-mono text-red-500 font-medium min-w-[45px]">
                    {formatDuration(duration)}
                </span>
            </div>

            {/* Send Button - stops recording and sends immediately */}
            <Button
                type="button"
                size="icon"
                className="size-10 bg-[#E87A3F] hover:bg-[#d96d34] shrink-0"
                onClick={onSend}
            >
                <Send className="size-5" />
            </Button>
        </div>
    )
}
