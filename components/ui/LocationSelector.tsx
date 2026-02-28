import React, { useState, useRef, useEffect, useMemo } from 'react'
import { MapPin, ChevronDown, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
interface LocationSelectorProps {
    type: 'state' | 'city' // Removed 'country'
    value: string
    onChange: (val: string) => void
    placeholder?: string
    disabled?: boolean
    className?: string
    /** For city selector, provide the selected state ISO CODE to filter cities (now expects ISO) */
    selectedState?: string
    /** Show "Use Current Location" option (state only) */
    showCurrentLocation?: boolean
}

// Fuzzy match helper
const fuzzyMatch = (input: string, target: string): boolean => {
    const inputLower = input.toLowerCase()
    const targetLower = target.toLowerCase()
    if (targetLower.includes(inputLower)) return true
    let inputIndex = 0
    for (let i = 0; i < targetLower.length && inputIndex < inputLower.length; i++) {
        if (targetLower[i] === inputLower[inputIndex]) inputIndex++
    }
    return inputIndex === inputLower.length
}

function LocationSelector({
    type,
    value,
    onChange,
    placeholder,
    disabled = false,
    className = '',
    selectedState,
    showCurrentLocation = false,
}: LocationSelectorProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [isLoadingLocation, setIsLoadingLocation] = useState(false)
    const [options, setOptions] = useState<string[]>([])
    const [isLoadingOptions, setIsLoadingOptions] = useState(false)

    const dropdownRef = useRef<HTMLDivElement>(null)

    // Sync search query
    useEffect(() => {
        if (!isOpen) setSearchQuery(value || '')
    }, [value, isOpen])

    // Close on outside click
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Fetch Options based on type
    useEffect(() => {
        const fetchOptions = async () => {
            setIsLoadingOptions(true)
            try {
                let url = ''
                if (type === 'state') {
                    url = '/api/locations/states'
                } else if (type === 'city' && selectedState) {
                    // We assume selectedState is the State Name (as standard in this app now)
                    // We use stateName param so the API resolves it to ISO code
                    url = `/api/locations/cities?stateName=${encodeURIComponent(selectedState)}`
                }

                if (url) {
                    const res = await fetch(url)
                    const data = await res.json()
                    if (Array.isArray(data)) {
                        setOptions(data.map((item: any) => item.name))
                    }
                } else {
                    setOptions([])
                }
            } catch (error) {
                console.error(`Failed to fetch ${type}s:`, error)
                setOptions([])
            } finally {
                setIsLoadingOptions(false)
            }
        }

        if (!disabled && (type === 'state' || (type === 'city' && selectedState))) {
            fetchOptions()
        } else {
            setOptions([])
        }
    }, [type, selectedState, disabled])

    // Filter options
    const filteredOptions = useMemo(() => {
        if (!searchQuery || (isOpen && searchQuery === value)) return options
        return options.filter(opt => fuzzyMatch(searchQuery, opt))
    }, [options, searchQuery, isOpen, value])

    const handleSelect = (opt: string) => {
        onChange(opt)
        setSearchQuery(opt)
        setIsOpen(false)
    }

    const handleUseCurrentLocation = async () => {
        if (!('geolocation' in navigator)) {
            toast.error('Geolocation is not supported')
            return
        }
        setIsLoadingLocation(true)
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const { latitude, longitude } = position.coords
                    const response = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
                    )
                    const data = await response.json()
                    if (data?.address?.state) {
                        handleSelect(data.address.state)
                    } else {
                        toast.error('Could not detect state')
                    }
                } catch (error) {
                    console.error('Geocoding error:', error)
                    toast.error('Failed to get location')
                } finally {
                    setIsLoadingLocation(false)
                }
            },
            () => {
                setIsLoadingLocation(false)
                toast.error('Location access denied')
            }
        )
    }

    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            <div
                className={`flex items-center h-11 w-full rounded-xl border border-gray-200 bg-white px-3 transition-all ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-300'
                    } ${isOpen ? 'ring-2 ring-[#E87A3F] border-transparent' : ''}`}
            >
                {type === 'state' && <MapPin className="mr-2 size-4 text-[#E87A3F] flex-shrink-0" />}
                <input
                    type="text"
                    placeholder={placeholder || `Select ${type === 'state' ? 'State' : 'City'}`}
                    value={searchQuery}
                    onChange={(e) => {
                        setSearchQuery(e.target.value)
                        if (!isOpen) setIsOpen(true)
                    }}
                    onFocus={() => !disabled && setIsOpen(true)}
                    disabled={disabled}
                    className="flex-1 min-w-0 bg-transparent text-sm text-gray-700 outline-none border-none focus:ring-0 placeholder:text-gray-500"
                />
                <button
                    type="button"
                    className="flex items-center justify-center p-1 cursor-pointer outline-none"
                    onClick={() => !disabled && setIsOpen((prev) => !prev)}
                    disabled={disabled}
                >
                    <ChevronDown
                        className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                    />
                </button>
            </div>

            {isOpen && (
                <div className="absolute top-full mt-2 w-full left-0 bg-white border border-gray-200 rounded-xl shadow-xl max-h-60 overflow-y-auto z-50 py-1">
                    {/* Header for State with Current Location */}
                    {type === 'state' && showCurrentLocation && (
                        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100">
                            <span
                                onClick={handleUseCurrentLocation}
                                className={`text-[#E87A3F] font-semibold text-sm cursor-pointer hover:underline ${isLoadingLocation ? 'opacity-50 cursor-wait' : ''
                                    }`}
                            >
                                {isLoadingLocation ? (
                                    <span className="flex items-center gap-1">
                                        <Loader2 className="size-3 animate-spin" /> Detecting...
                                    </span>
                                ) : (
                                    'Use Current Location'
                                )}
                            </span>
                        </div>
                    )}

                    {/* Options List */}
                    <div className="flex flex-col">
                        {isLoadingOptions ? (
                            <div className="px-4 py-2 text-sm text-gray-500 italic text-center">Loading...</div>
                        ) : filteredOptions.length > 0 ? (
                            filteredOptions.map((opt) => (
                                <div
                                    key={opt}
                                    onClick={() => handleSelect(opt)}
                                    className={`px-4 py-2.5 text-sm text-gray-700 cursor-pointer hover:bg-orange-50 hover:text-[#E87A3F] transition-colors ${value === opt ? 'bg-orange-50 text-[#E87A3F] font-semibold' : ''
                                        }`}
                                >
                                    {opt}
                                </div>
                            ))
                        ) : (
                            <div className="px-4 py-2 text-sm text-gray-500 italic text-center">No options found</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

export default React.memo(LocationSelector)
