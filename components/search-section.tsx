"use client";
import { MapPin, ChevronDown, Search, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useState, useRef, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface SearchSectionProps {
  searchQuery?: string;
  onSearchQueryChange?: (query: string) => void;
  selectedState?: string;
  onStateChange?: (state: string) => void;
  onSearch?: () => void;
  onCategoryChange?: (category: string) => void;
  dressStyles?: { id: string, name: string, categoryType: string }[];
}

const DEFAULT_DRESS_STYLES: any[] = [];

export default function SearchSection({
  searchQuery: propSearchQuery,
  onSearchQueryChange,
  selectedState: propSelectedState,
  onStateChange,
  onSearch,
  onCategoryChange,
  dressStyles: propDressStyles = DEFAULT_DRESS_STYLES
}: SearchSectionProps = {}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // States Fetched from API
  const [availableStates, setAvailableStates] = useState<string[]>([]);

  useEffect(() => {
    fetch('/api/locations/states')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch states');
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) setAvailableStates(data.map((s: any) => s.name));
      })
      .catch(err => console.error("Failed to load states", err));
  }, []);

  // Dress styles passed from props
  const [allDressStyles, setAllDressStyles] = useState<string[]>([]);

  useEffect(() => {
    if (propDressStyles && propDressStyles.length > 0) {
      const formattedStyles = propDressStyles.map(style =>
        `${style.name} in ${style.categoryType}`
      );
      setAllDressStyles(formattedStyles);
    } else if (allDressStyles.length > 0) {
      setAllDressStyles([]);
    }
  }, [propDressStyles]);


  // Internal state for uncontrolled mode
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [internalSelectedState, setInternalSelectedState] = useState("");
  const [internalSearchQuery, setInternalSearchQuery] = useState("");
  const [locationSearch, setLocationSearch] = useState("");
  const [preventNextFocus, setPreventNextFocus] = useState(false);

  // Search suggestions state
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [productSuggestions, setProductSuggestions] = useState<Array<{ text: string, type: 'product' | 'dress', category?: string }>>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  // Separate refs for desktop and mobile dropdowns
  const desktopDropdownRef = useRef<HTMLDivElement>(null);
  const mobileDropdownRef = useRef<HTMLDivElement>(null);
  const desktopSearchRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);

  // Determine effective values (Controlled > Internal)
  const isControlledState = propSelectedState !== undefined;
  const isControlledSearch = propSearchQuery !== undefined;

  const effectiveSelectedState = isControlledState ? propSelectedState : internalSelectedState;
  const effectiveSearchQuery = isControlledSearch ? propSearchQuery : internalSearchQuery;

  // Sync locationSearch with effectiveSelectedState ONLY when not open and not searching
  // Sync locationSearch with effectiveSelectedState
  useEffect(() => {
    setLocationSearch(effectiveSelectedState === "Select State" ? "" : (effectiveSelectedState || ""));
  }, [effectiveSelectedState]);

  // Initialize search query from URL if available and not controlled
  useEffect(() => {
    if (!isControlledSearch && searchParams) {
      const q = searchParams.get('q');
      if (q) setInternalSearchQuery(q);
    }
  }, [searchParams, isControlledSearch]);

  // Handlers
  const handleStateChange = (state: string) => {
    if (onStateChange) onStateChange(state);
    if (!isControlledState) setInternalSelectedState(state);
    setLocationSearch(state);
    setInternalIsOpen(false);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (onSearchQueryChange) onSearchQueryChange(val);
    if (!isControlledSearch) setInternalSearchQuery(val);
  };

  const handleSearchClick = () => {
    // ✅ Save to search history when user clicks search button
    if (effectiveSearchQuery && effectiveSearchQuery.length >= 2) {
      fetch('/api/search-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ searchQuery: effectiveSearchQuery })
      }).catch(() => { });
    }

    if (onSearch) {
      onSearch();
    } else {
      const params = new URLSearchParams();
      if (effectiveSearchQuery) params.set('q', effectiveSearchQuery);
      if (effectiveSelectedState) params.set('state', effectiveSelectedState);
      router.push(`/products?${params.toString()}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (showSuggestions && allSuggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHighlightedIndex(prev => prev < allSuggestions.length - 1 ? prev + 1 : 0);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : allSuggestions.length - 1);
      } else if (e.key === 'Enter' && highlightedIndex >= 0) {
        e.preventDefault();
        handleSuggestionSelect(allSuggestions[highlightedIndex]);
      } else if (e.key === 'Escape') {
        setShowSuggestions(false);
        setHighlightedIndex(-1);
      }
    } else if (e.key === 'Enter') {
      handleSearchClick();
    }
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      const isOutsideDesktop = !desktopDropdownRef.current?.contains(target);
      const isOutsideMobile = !mobileDropdownRef.current?.contains(target);
      if (isOutsideDesktop && isOutsideMobile) {
        setInternalIsOpen(false);
      }
      // Close suggestions when clicking outside
      const isOutsideDesktopSearch = !desktopSearchRef.current?.contains(target);
      const isOutsideMobileSearch = !mobileSearchRef.current?.contains(target);
      if (isOutsideDesktopSearch && isOutsideMobileSearch) {
        setShowSuggestions(false);
        setHighlightedIndex(-1);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Fetch product suggestions from API
  useEffect(() => {
    const fetchProducts = async () => {
      if (!effectiveSearchQuery || effectiveSearchQuery.length < 2) {
        setProductSuggestions([]);
        return;
      }
      setIsLoadingProducts(true);
      try {
        const res = await fetch(`/api/products/suggestions?q=${encodeURIComponent(effectiveSearchQuery)}`);
        if (!res.ok) throw new Error('Failed to fetch suggestions');
        const data = await res.json();
        if (data.suggestions && Array.isArray(data.suggestions)) {
          setProductSuggestions(data.suggestions);
        }
      } catch (err) {
        setProductSuggestions([]);
      } finally {
        setIsLoadingProducts(false);
      }
    };
    const timer = setTimeout(fetchProducts, 300);
    return () => clearTimeout(timer);
  }, [effectiveSearchQuery]);

  // Filter dress style suggestions based on search query
  const filteredDressSuggestions = useMemo(() => {
    if (!effectiveSearchQuery || effectiveSearchQuery.length < 1) return [];
    return allDressStyles.filter(style =>
      style.toLowerCase().includes(effectiveSearchQuery.toLowerCase())
    ).slice(0, 5); // Limit to 5 dress suggestions
  }, [effectiveSearchQuery, allDressStyles]);

  // Combine all suggestions
  const allSuggestions = useMemo(() => {
    const combined: Array<{ text: string, type: 'product' | 'dress' | 'style', category?: string }> = [];

    // Add API suggestions (Products + Smart Dress Styles)
    productSuggestions.forEach(p => {
      const categoryCapitalized = p.category ? p.category.charAt(0).toUpperCase() + p.category.slice(1) : '';
      const displayText = categoryCapitalized
        ? `${p.text} in ${categoryCapitalized}`
        : p.text;

      combined.push({
        text: displayText,
        type: p.type, // 'product' or 'dress'
        category: p.category
      });
    });

    // Add hardcoded dress style suggestions (fallback/legacy)
    // Only if we don't have enough API suggestions
    if (combined.length < 5) {
      filteredDressSuggestions.forEach(style => {
        // Parse hardcoded style "Style in Category"
        const separator = " in ";
        const lastIndex = style.lastIndexOf(separator);
        let category = undefined;
        if (lastIndex !== -1) {
          category = style.substring(lastIndex + separator.length);
        }

        combined.push({
          text: style,
          type: 'style', // Legacy type
          category
        });
      });
    }

    return combined.slice(0, 8); // Limit total to 8 suggestions
  }, [productSuggestions, filteredDressSuggestions]);

  // Save search history to database (fire and forget)
  const saveSearchHistory = async (query: string) => {
    if (!query || query.length < 2) return;
    try {
      await fetch('/api/search-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ searchQuery: query })
      });
    } catch (err) {
      // Silently fail - search history is not critical
      console.debug('Search history save failed:', err);
    }
  };

  const handleSuggestionSelect = (suggestion: { text: string, type: string, category?: string }) => {
    // 🔍 Unified Search Handling
    let keyword = suggestion.text;

    // Clean up "Item in Category" format
    if (suggestion.category && suggestion.text.endsWith(` in ${suggestion.category.charAt(0).toUpperCase() + suggestion.category.slice(1)}`)) {
      // "Silk Tie in Men" -> "Silk Tie"
      keyword = suggestion.text.replace(` in ${suggestion.category.charAt(0).toUpperCase() + suggestion.category.slice(1)}`, '');
    } else if (suggestion.text.includes(" in ")) {
      // Fallback
      keyword = suggestion.text.substring(0, suggestion.text.lastIndexOf(" in "));
    }

    // Set search query
    if (onSearchQueryChange) onSearchQueryChange(keyword);
    if (!isControlledSearch) setInternalSearchQuery(keyword);

    setShowSuggestions(false); // ✅ Close suggestions immediately
    setHighlightedIndex(-1);

    // ✅ Save to search history (async, fire and forget)
    saveSearchHistory(keyword);

    // Apply category filter if present
    const params = new URLSearchParams();
    params.set('q', keyword);

    // ✅ Persist currently selected state
    if (effectiveSelectedState && effectiveSelectedState !== "Select State") {
      params.set('state', effectiveSelectedState);
    }

    // For unified search:
    // Only apply category if the suggestion TEXT explicitly included it (e.g. "Abaya in Women")
    // checking if we stripped " in ..." from the keyword above.
    const wasExplicitCategory = suggestion.text.includes(" in ");

    if (suggestion.category && (wasExplicitCategory || suggestion.type === 'dress')) {
      // If it's a specific Style (Dress) or explicit "Item in Category", use the category.
      if (onCategoryChange) {
        onCategoryChange(suggestion.category.toLowerCase());
      } else {
        params.set('category', suggestion.category.toLowerCase());
        router.push(`/products?${params.toString()}`);
      }
    } else {
      // Otherwise, search globally (so "Vintage Jacket" finds Men AND Women versions)
      router.push(`/products?${params.toString()}`);
    }
  };

  // Fuzzy match helper - matches if all characters appear in order (typo-tolerant)
  const fuzzyMatch = (input: string, target: string): boolean => {
    const inputLower = input.toLowerCase();
    const targetLower = target.toLowerCase();

    // First try exact contains match
    if (targetLower.includes(inputLower)) return true;

    // Then try fuzzy: all input chars must appear in order in target
    let inputIndex = 0;
    for (let i = 0; i < targetLower.length && inputIndex < inputLower.length; i++) {
      if (targetLower[i] === inputLower[inputIndex]) {
        inputIndex++;
      }
    }
    return inputIndex === inputLower.length;
  };

  const filteredStates = useMemo(() => {
    if (!locationSearch || (internalIsOpen && locationSearch === effectiveSelectedState)) return availableStates;
    return availableStates.filter(s => fuzzyMatch(locationSearch, s));
  }, [locationSearch, internalIsOpen, effectiveSelectedState, availableStates]);

  const handleUseCurrentLocation = () => {
    if ("geolocation" in navigator) {
      setIsLoadingLocation(true);
      navigator.geolocation.getCurrentPosition(async (position) => {
        try {
          const { latitude, longitude } = position.coords;

          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&timestamp=${Date.now()}`, {
            headers: {
              'User-Agent': 'SoukLoop/1.0',
              'Accept-Language': 'en-US,en;q=0.5'
            },
            cache: 'no-store'
          });
          if (!response.ok) throw new Error('Geocoding failed');
          const data = await response.json();

          if (data && data.address && data.address.state) {
            const detectedState = data.address.state;
            handleStateChange(detectedState);
          } else {
            toast.error("Could not detect state from your location.");
          }
        } catch (error) {
          console.error("Geocoding error:", error);
          toast.error("Failed to get location details.");
        } finally {
          setIsLoadingLocation(false);
        }
      }, (error) => {
        console.error("Geolocation error:", error);
        setIsLoadingLocation(false);
        toast.error("Location access denied or unavailable.");
      }, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      });
    } else {
      toast.error("Geolocation is not supported by your browser");
    }
  };

  return (
    <div className="bg-[#fdf7f4] py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-4 md:flex-row md:gap-4 md:justify-center">

          {/* Desktop Layout */}
          <div className="hidden md:flex items-center gap-4 w-full">
            {/* Location Selector - Desktop */}
            <div
              className="relative flex items-center rounded-full border border-gray-200 bg-white pl-4 pr-3 h-[56px] shadow-sm transition-shadow hover:shadow-md w-[320px]"
              ref={desktopDropdownRef}
            >
              <MapPin className="mr-2 size-5 text-[#E87A3F] flex-shrink-0" />
              <input
                type="text"
                placeholder="Select location"
                value={locationSearch}
                onChange={(e) => {
                  const val = e.target.value;
                  setLocationSearch(val);
                  if (val === "") {
                    handleStateChange("");
                  } else {
                    setInternalIsOpen(true);
                  }
                }}
                onFocus={() => {
                  if (preventNextFocus) {
                    setPreventNextFocus(false);
                    return;
                  }
                  setInternalIsOpen(true);
                }}
                className="flex-1 min-w-0 bg-transparent font-medium text-gray-700 outline-none text-base border-none focus:ring-0 placeholder:text-gray-500"
              />
              <button
                type="button"
                className="flex items-center justify-center p-2 cursor-pointer outline-none"
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (internalIsOpen) {
                    setPreventNextFocus(true);
                  }
                  setInternalIsOpen((prev) => !prev);
                }}
              >
                <ChevronDown
                  className={`h-4 w-4 text-gray-500 transition-transform duration-200 flex-shrink-0 ${internalIsOpen ? "rotate-180" : ""}`}
                />
              </button>

              {internalIsOpen && (
                <LocationDropdown
                  onSelect={handleStateChange}
                  onUseCurrent={handleUseCurrentLocation}
                  filteredStates={filteredStates}
                  effectiveSelectedState={effectiveSelectedState}
                  isLoadingLocation={isLoadingLocation}
                />
              )}
            </div>

            {/* Search Input - Desktop */}
            <div className="flex-1 relative" ref={desktopSearchRef}>
              <input
                type="text"
                placeholder="Search Product"
                value={effectiveSearchQuery}
                onChange={(e) => {
                  handleSearchChange(e);
                  // Only open if query has enough chars
                  if (e.target.value.length >= 1) setShowSuggestions(true);
                }}
                onKeyDown={handleKeyDown}
                onFocus={() => {
                  if (allSuggestions.length > 0) {
                    setShowSuggestions(true);
                  }
                }}
                className="w-full h-[56px] rounded-full border border-gray-200 bg-white px-6 text-sm text-gray-700 shadow-sm placeholder:text-gray-500 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#E87A3F] sm:text-base font-medium"
              />
              {showSuggestions && effectiveSearchQuery.length >= 1 && (
                <SuggestionsDropdown
                  suggestions={allSuggestions}
                  onSelect={handleSuggestionSelect}
                  highlightedIndex={highlightedIndex}
                  isLoading={isLoadingProducts}
                />
              )}
            </div>

            {/* Search Button - Desktop */}
            <Button
              onClick={handleSearchClick}
              className="h-[56px] w-[160px] rounded-full bg-[#E87A3F] text-base font-bold text-white shadow-sm transition-all hover:bg-[#d96d34] hover:shadow-md"
            >
              Search
            </Button>
          </div>

          {/* Mobile Layout */}
          <div className="flex flex-col md:hidden w-full gap-4">
            {/* Search Input - Mobile */}
            <div className="w-full relative" ref={mobileSearchRef}>
              <input
                type="text"
                placeholder="Search Product"
                value={effectiveSearchQuery}
                onChange={(e) => {
                  handleSearchChange(e);
                  if (e.target.value.length >= 1) setShowSuggestions(true);
                }}
                onKeyDown={handleKeyDown}
                onFocus={() => {
                  if (allSuggestions.length > 0) {
                    setShowSuggestions(true);
                  }
                }}
                className="w-full h-[56px] rounded-full border border-gray-200 bg-white px-6 text-sm text-gray-700 shadow-sm placeholder:text-gray-500 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#E87A3F] sm:text-base font-medium"
              />
              {showSuggestions && effectiveSearchQuery.length >= 1 && (
                <SuggestionsDropdown
                  suggestions={allSuggestions}
                  onSelect={handleSuggestionSelect}
                  highlightedIndex={highlightedIndex}
                  isLoading={isLoadingProducts}
                />
              )}
            </div>

            {/* Location + Search Button - Mobile */}
            <div className="flex w-full gap-3">
              <div
                className="relative flex flex-1 items-center rounded-full border border-gray-200 bg-white pl-4 pr-3 h-[56px] shadow-sm transition-shadow hover:shadow-md"
                ref={mobileDropdownRef}
              >
                <MapPin className="mr-2 size-5 text-[#E87A3F] flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Select location"
                  value={locationSearch}
                  onChange={(e) => {
                    const val = e.target.value;
                    setLocationSearch(val);
                    if (val === "") {
                      handleStateChange("");
                    } else {
                      setInternalIsOpen(true);
                    }
                  }}
                  onFocus={() => {
                    if (preventNextFocus) {
                      setPreventNextFocus(false);
                      return;
                    }
                    setInternalIsOpen(true);
                  }}
                  className="flex-1 min-w-0 bg-transparent font-medium text-gray-700 outline-none text-sm border-none focus:ring-0 placeholder:text-gray-500"
                />
                <button
                  type="button"
                  className="flex items-center justify-center p-2 cursor-pointer outline-none"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (internalIsOpen) {
                      setPreventNextFocus(true);
                    }
                    setInternalIsOpen((prev) => !prev);
                  }}
                >
                  <ChevronDown
                    className={`h-4 w-4 text-gray-500 transition-transform duration-200 flex-shrink-0 ${internalIsOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {internalIsOpen && (
                  <LocationDropdown
                    onSelect={handleStateChange}
                    onUseCurrent={handleUseCurrentLocation}
                    filteredStates={filteredStates}
                    effectiveSelectedState={effectiveSelectedState}
                    isLoadingLocation={isLoadingLocation}
                  />
                )}
              </div>

              <Button
                onClick={handleSearchClick}
                className="h-[56px] px-6 rounded-full bg-[#E87A3F] text-base font-bold text-white shadow-sm transition-all hover:bg-[#d96d34] hover:shadow-md"
              >
                Search
              </Button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// LocationDropdown Component (Child)
function LocationDropdown({ onSelect, onUseCurrent, filteredStates, effectiveSelectedState, isLoadingLocation }: {
  onSelect: (s: string) => void,
  onUseCurrent: () => void,
  filteredStates: string[],
  effectiveSelectedState: string,
  isLoadingLocation?: boolean
}) {
  return (
    <div className="absolute top-full mt-2 w-full left-0 bg-white border border-gray-200 rounded-2xl shadow-xl max-h-80 overflow-y-auto scrollbar-hide z-[40] py-1">
      {/* Search Header Options */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-50">
        <span
          onClick={(e) => {
            e.stopPropagation();
            if (!isLoadingLocation) onUseCurrent();
          }}
          className={`text-[#E87A3F] font-bold text-sm cursor-pointer transition-all hover:font-extrabold ${isLoadingLocation ? "opacity-50 cursor-wait" : ""}`}
        >
          {isLoadingLocation ? "Detecting..." : "Use Current Location"}
        </span>
        <span
          onClick={(e) => {
            e.stopPropagation();
            onSelect("All US");
          }}
          className="text-gray-900 font-bold text-sm cursor-pointer transition-all hover:font-extrabold"
        >
          See all in US
        </span>
      </div>

      {/* Subheading */}
      <div className="px-4 py-1.5 text-xs font-bold text-gray-400 mt-1 uppercase tracking-wider">
        State
      </div>

      {/* States List */}
      <div className="flex flex-col">
        {filteredStates.length > 0 ? (
          filteredStates.map((state) => (
            <div
              key={state}
              onClick={(e) => {
                e.stopPropagation();
                onSelect(state);
              }}
              className={`px-4 py-2.5 text-base text-gray-700 cursor-pointer hover:bg-orange-50 hover:text-[#E87A3F] transition-colors border-t border-gray-50 first:border-t-0 ${effectiveSelectedState === state ? "bg-orange-50 text-[#E87A3F] font-semibold" : ""
                }`}
            >
              {state}
            </div>
          ))
        ) : (
          <div className="px-4 py-2 text-sm text-gray-500 italic text-center">No states found</div>
        )}
      </div>
    </div>
  );
}

// Shimmer skeleton for loading state
function SuggestionShimmer() {
  return (
    <div className="px-4 py-2.5 flex items-center gap-3 animate-pulse">
      <div className="w-4 h-4 bg-gray-200 rounded" />
      <div className="flex-1 space-y-1">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
      </div>
    </div>
  );
}

function SuggestionsDropdown({ suggestions, onSelect, highlightedIndex, isLoading }: {
  suggestions: Array<{ text: string, type: 'product' | 'dress' | 'style', category?: string }>,
  onSelect: (s: { text: string, type: string, category?: string }) => void,
  highlightedIndex: number,
  isLoading?: boolean
}) {
  return (
    <div className="absolute top-full mt-2 w-full left-0 bg-white border border-gray-200 rounded-2xl shadow-xl max-h-80 overflow-y-auto scrollbar-hide z-[40] py-1">
      {/* Suggestions List */}
      <div className="flex flex-col">
        {isLoading ? (
          // ✨ Shimmer loading effect
          <>
            <SuggestionShimmer />
            <SuggestionShimmer />
            <SuggestionShimmer />
            <SuggestionShimmer />
          </>
        ) : suggestions.length > 0 ? (
          suggestions.map((suggestion, index) => (
            <div
              // Use index fallback to prevent duplicate key errors if text is same
              key={`${suggestion.type}-${suggestion.text}-${index}`}
              onClick={(e) => {
                e.stopPropagation();
                onSelect(suggestion);
              }}
              className={`px-4 py-2.5 text-base text-gray-700 cursor-pointer hover:bg-orange-50 hover:text-[#E87A3F] transition-colors border-t border-gray-50 first:border-t-0 ${highlightedIndex === index ? "bg-orange-50 text-[#E87A3F] font-semibold" : ""
                }`}
            >
              <Search className="inline-block mr-2 h-4 w-4 text-gray-400" />
              {suggestion.text}
            </div>
          ))
        ) : null}
      </div>
    </div>
  );
}
