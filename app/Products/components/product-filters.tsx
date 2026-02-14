"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { ChevronDown, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { useState, useRef, useEffect, useMemo } from "react";
import SearchableDropdown from "@/app/seller/components/searchable-dropdown";

// =============================================================================
// SUB-COMPONENTS (PriceSlider)
// =============================================================================

function PriceSlider({
    value,
    onValueChange,
}: {
    value: number[];
    onValueChange: (val: number[]) => void;
}) {
    // We only control the MAX price (index 1 of the array). Min is always 0.
    const maxPrice = value[1] || 1000;

    return (
        <SliderPrimitive.Root
            value={[maxPrice]} // Only pass the max value to the slider root
            onValueChange={(vals) => onValueChange([0, vals[0]])} // Always set min to 0
            max={1000}
            step={10}
            className="relative flex w-full touch-none select-none items-center"
        >
            <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-gray-200">
                <SliderPrimitive.Range className="absolute h-full bg-[#E87A3F]" />
            </SliderPrimitive.Track>
            <SliderPrimitive.Thumb className="block h-4 w-4 rounded-full border-2 border-[#E87A3F] bg-white shadow focus:outline-none focus:ring-2 focus:ring-[#E87A3F]" />
        </SliderPrimitive.Root>
    );
}

// =============================================================================
// TYPES & PROPS Interface
// =============================================================================

interface ProductFiltersProps {
    /* URL-driven state (optional, can be managed internally or passed) */
    categoryFromURL?: string;

    /* Local Filter States */
    occasion: string;
    setOccasion: (val: string) => void;

    gender: string;
    setGender: (val: string) => void;

    condition: string;
    setCondition: (val: string) => void;

    size: string;
    setSize: (val: string) => void;

    fabric: string;
    setFabric: (val: string) => void;

    dress: string;
    setDress: (val: string) => void;

    brandQuery: string;
    setBrandQuery: (val: string) => void;

    priceRange: number[];
    setPriceRange: (val: number[]) => void;

    onSale: boolean;
    setOnSale: (val: boolean) => void;

    minRating: string;
    setMinRating: (val: string) => void;

    onCategoryChange?: (cat: string) => void;

    categories: { id: string, name: string, slug: string }[];
    brands: { id: string, name: string }[];
    allDressStyles: { id: string, name: string, categoryType: string }[];
    initialOccasions: { id: string, name: string }[];
    initialMaterials: { id: string, name: string }[];
}

// =============================================================================
// FILTER CONSTANTS
// =============================================================================

export const conditions = ["all", "New", "Used - Like New", "Used - Good", "Used - Fair"];
export const genders = ["all", "Male", "Female", "Unisex"];

const adultSizes = ["all", "XS", "Small", "Medium", "Large", "XL", "XXL", "3XL", "4XL", "5XL"];
const kidsSizes = ["all", "0–3 Months", "3–6 Months", "6–9 Months", "9–12 Months", "12–18 Months", "18–24 Months", "2–3 Years", "3–4 Years", "4–5 Years", "5–6 Years", "6–7 Years", "7–8 Years", "8–9 Years", "9–10 Years", "10–12 Years", "12–14 Years"];

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function ProductFilters({
    categoryFromURL = "all",
    occasion, setOccasion,
    gender, setGender,
    condition, setCondition,
    size, setSize,
    fabric, setFabric,
    dress, setDress,
    brandQuery, setBrandQuery,
    priceRange, setPriceRange,
    onSale, setOnSale,
    minRating, setMinRating,
    onCategoryChange,
    categories = [],
    brands = [],
    allDressStyles = [],
    initialOccasions = [],
    initialMaterials = [],
}: ProductFiltersProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    /* Dropdown Logic */
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const toggleDropdown = (name: string) => setOpenDropdown(openDropdown === name ? null : name);
    const filterDropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target as Node)) {
                // Only close if it's strictly outside
                setOpenDropdown(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Categories from props
    // const [categories, setCategories] = useState<{ id: string, name: string, slug: string }[]>([]);
    // Removed internal fetch for categories


    // Brands from props
    // const [brands, setBrands] = useState<string[]>([]);
    // Removed internal fetch for brands


    /* Helper to switch Category via URL */
    const handleCategorySwitch = (cat: string) => {
        if (onCategoryChange) {
            onCategoryChange(cat);
        }

        if (!searchParams) return;
        const params = new URLSearchParams(searchParams.toString());
        params.set("category", cat);
        params.set("page", "1");
        // Use replace instead of push and scroll: false to prevent jumping to top
        router.replace(`?${params.toString()}`, { scroll: false });

        // Reset specific filters if needed
        setSize("all");

        // Reset gender if incompatible
        if (cat === 'men' && gender === 'Female') setGender('all');
        if (cat === 'women' && gender === 'Male') setGender('all');
    };

    const currentSizeOptions = categoryFromURL === "kids" ? kidsSizes : adultSizes;

    // Filter dress styles locally based on category
    const dressStyles = useMemo(() => {
        if (categoryFromURL && categoryFromURL !== 'all') {
            const catType = categoryFromURL.charAt(0).toUpperCase() + categoryFromURL.slice(1);
            return allDressStyles.filter(s => s.categoryType === catType || !s.categoryType); // !categoryType for generic styles if any?
        }
        return allDressStyles; // Or maybe return empty if 'all'? Original logic returned all if includeAll=true
    }, [categoryFromURL, allDressStyles]);

    // Removed internal fetch for dress styles


    return (
        <div className="space-y-8" ref={filterDropdownRef}>
            {/* Category */}
            <div>
                <h3 className="font-semibold text-gray-900 mb-3">Category</h3>
                <div className="flex flex-wrap gap-2">
                    {/* Always include 'all' */}
                    <button
                        onClick={() => handleCategorySwitch("all")}
                        className={`rounded-xl px-4 py-2.5 text-sm font-medium capitalize transition-all ${categoryFromURL === "all"
                            ? "bg-[#E87A3F] text-white shadow-sm"
                            : "border border-gray-200 bg-white text-gray-700 hover:border-[#E87A3F] hover:text-[#E87A3F]"
                            }`}
                    >
                        All
                    </button>
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => handleCategorySwitch(cat.slug)}
                            className={`rounded-xl px-4 py-2.5 text-sm font-medium capitalize transition-all ${categoryFromURL === cat.slug
                                ? "bg-[#E87A3F] text-white shadow-sm"
                                : "border border-gray-200 bg-white text-gray-700 hover:border-[#E87A3F] hover:text-[#E87A3F]"
                                }`}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Occasion */}
            <div className="relative">
                <h3 className="font-semibold text-gray-900 mb-3">Occasion</h3>
                <button
                    type="button"
                    onClick={() => toggleDropdown("occasion")}
                    className={`flex h-12 w-full items-center justify-between rounded-xl border bg-white px-4 text-left outline-none transition-all ${openDropdown === "occasion" ? "border-[#E87A3F] ring-1 ring-[#E87A3F]" : "border-gray-200 hover:border-gray-300"}`}
                    style={{ boxShadow: "0px 2px 4px rgba(0,0,0,0.02)" }}
                >
                    <span className={occasion !== "all" ? "text-gray-900 font-medium" : "text-gray-400"}>
                        {occasion === "all" ? "All Occasions" : occasion}
                    </span>
                    <ChevronDown className={`size-5 text-gray-400 transition-transform duration-200 ${openDropdown === "occasion" ? "rotate-180" : ""}`} />
                </button>
                {openDropdown === "occasion" && (
                    <div className="absolute top-full left-0 z-50 mt-2 w-full overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xl animate-in fade-in zoom-in-95 duration-200">
                        <div className="max-h-[200px] overflow-y-auto py-2 custom-scrollbar">
                            <button
                                type="button"
                                onClick={() => { setOccasion("all"); setOpenDropdown(null); }}
                                className={`block w-full px-4 py-2.5 text-left text-sm transition-colors ${occasion === "all" ? "bg-orange-50 text-[#E87A3F] font-medium" : "text-gray-600 hover:bg-orange-50 hover:text-[#E87A3F]"}`}
                            >
                                All Occasions
                            </button>
                            {initialOccasions.map((o) => (
                                <button
                                    key={o.id}
                                    type="button"
                                    onClick={() => { setOccasion(o.name); setOpenDropdown(null); }}
                                    className={`block w-full px-4 py-2.5 text-left text-sm transition-colors ${occasion === o.name ? "bg-orange-50 text-[#E87A3F] font-medium" : "text-gray-600 hover:bg-orange-50 hover:text-[#E87A3F]"}`}
                                >
                                    {o.name}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Gender */}
            <div>
                <h3 className="font-semibold text-gray-900 mb-3">Gender</h3>
                {genders.filter(g => {
                    if (categoryFromURL === 'men' && g === 'Female') return false;
                    if (categoryFromURL === 'women' && g === 'Male') return false;
                    return true;
                }).map((g) => (
                    <label key={g} className="flex items-center mb-2">
                        <input
                            type="radio"
                            name="gender"
                            value={g}
                            checked={gender === g}
                            onChange={(e) => setGender(e.target.value)}
                            className="mr-3 accent-[#E87A3F]"
                        />
                        <span className="text-gray-700">
                            {g === "all" ? "All" : g}
                        </span>
                    </label>
                ))}
            </div>

            {/* Condition */}
            <div>
                <h3 className="font-semibold text-gray-900 mb-3">Condition</h3>
                {conditions.map((c) => (
                    <label key={c} className="flex items-center mb-2">
                        <input
                            type="radio"
                            name="condition"
                            value={c}
                            checked={condition === c}
                            onChange={(e) => setCondition(e.target.value)}
                            className="mr-3 accent-[#E87A3F]"
                        />
                        <span className="text-gray-700">
                            {c === "all" ? "All" : c}
                        </span>
                    </label>
                ))}
            </div>

            {/* Size */}
            <div className="relative">
                <h3 className="font-semibold text-gray-900 mb-3">Size</h3>
                <button
                    type="button"
                    onClick={() => toggleDropdown("size")}
                    className={`flex h-12 w-full items-center justify-between rounded-xl border bg-white px-4 text-left outline-none transition-all ${openDropdown === "size" ? "border-[#E87A3F] ring-1 ring-[#E87A3F]" : "border-gray-200 hover:border-gray-300"}`}
                    style={{ boxShadow: "0px 2px 4px rgba(0,0,0,0.02)" }}
                >
                    <span className={size !== "all" ? "text-gray-900 font-medium" : "text-gray-400"}>
                        {size === "all" ? "All Sizes" : size}
                    </span>
                    <ChevronDown className={`size-5 text-gray-400 transition-transform duration-200 ${openDropdown === "size" ? "rotate-180" : ""}`} />
                </button>
                {openDropdown === "size" && (
                    <div className="absolute top-full left-0 z-50 mt-2 w-full overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xl animate-in fade-in zoom-in-95 duration-200">
                        <div className="max-h-[200px] overflow-y-auto py-2 custom-scrollbar">
                            {currentSizeOptions.map((s) => (
                                <button
                                    key={s}
                                    type="button"
                                    onClick={() => { setSize(s); setOpenDropdown(null); }}
                                    className={`block w-full px-4 py-2.5 text-left text-sm transition-colors ${size === s ? "bg-orange-50 text-[#E87A3F] font-medium" : "text-gray-600 hover:bg-orange-50 hover:text-[#E87A3F]"}`}
                                >
                                    {s === "all" ? "All Sizes" : s}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Dress Style (Dynamic) */}
            <div className="relative">
                <h3 className="font-semibold text-gray-900 mb-3">Dress Style</h3>
                <button
                    type="button"
                    onClick={() => toggleDropdown("dress")}
                    className={`flex h-12 w-full items-center justify-between rounded-xl border bg-white px-4 text-left outline-none transition-all ${openDropdown === "dress" ? "border-[#E87A3F] ring-1 ring-[#E87A3F]" : "border-gray-200 hover:border-gray-300"}`}
                    style={{ boxShadow: "0px 2px 4px rgba(0,0,0,0.02)" }}
                >
                    <span className={dress !== "all" ? "text-gray-900 font-medium" : "text-gray-400"}>
                        {dress === "all" ? "All Styles" : dress}
                    </span>
                    {/* Removed isLoading state check since it is now props driven */}
                    <ChevronDown className={`size-5 text-gray-400 transition-transform duration-200 ${openDropdown === "dress" ? "rotate-180" : ""}`} />
                </button>
                {openDropdown === "dress" && (
                    <div className="absolute top-full left-0 z-50 mt-2 w-full overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xl animate-in fade-in zoom-in-95 duration-200">
                        <div className="max-h-[200px] overflow-y-auto py-2 custom-scrollbar">
                            <button
                                type="button"
                                onClick={() => { setDress("all"); setOpenDropdown(null); }}
                                className={`block w-full px-4 py-2.5 text-left text-sm transition-colors ${dress === "all" ? "bg-orange-50 text-[#E87A3F] font-medium" : "text-gray-600 hover:bg-orange-50 hover:text-[#E87A3F]"}`}
                            >
                                All Styles
                            </button>
                            {dressStyles.map((s) => (
                                <button
                                    key={s.id}
                                    type="button"
                                    onClick={() => { setDress(s.name); setOpenDropdown(null); }}
                                    className={`block w-full px-4 py-2.5 text-left text-sm transition-colors ${dress === s.name ? "bg-orange-50 text-[#E87A3F] font-medium" : "text-gray-600 hover:bg-orange-50 hover:text-[#E87A3F]"}`}
                                >
                                    {s.name}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Fabric */}
            <div className="relative">
                <h3 className="font-semibold text-gray-900 mb-3">Fabric</h3>
                <button
                    type="button"
                    onClick={() => toggleDropdown("fabric")}
                    className={`flex h-12 w-full items-center justify-between rounded-xl border bg-white px-4 text-left outline-none transition-all ${openDropdown === "fabric" ? "border-[#E87A3F] ring-1 ring-[#E87A3F]" : "border-gray-200 hover:border-gray-300"}`}
                    style={{ boxShadow: "0px 2px 4px rgba(0,0,0,0.02)" }}
                >
                    <span className={fabric !== "all" ? "text-gray-900 font-medium" : "text-gray-400"}>
                        {fabric === "all" ? "All Fabrics" : fabric}
                    </span>
                    <ChevronDown className={`size-5 text-gray-400 transition-transform duration-200 ${openDropdown === "fabric" ? "rotate-180" : ""}`} />
                </button>
                {openDropdown === "fabric" && (
                    <div className="absolute top-full left-0 z-50 mt-2 w-full overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xl animate-in fade-in zoom-in-95 duration-200">
                        <div className="max-h-[200px] overflow-y-auto py-2 custom-scrollbar">
                            <button
                                type="button"
                                onClick={() => { setFabric("all"); setOpenDropdown(null); }}
                                className={`block w-full px-4 py-2.5 text-left text-sm transition-colors ${fabric === "all" ? "bg-orange-50 text-[#E87A3F] font-medium" : "text-gray-600 hover:bg-orange-50 hover:text-[#E87A3F]"}`}
                            >
                                All Fabrics
                            </button>
                            {initialMaterials.map((f) => (
                                <button
                                    key={f.id}
                                    type="button"
                                    onClick={() => { setFabric(f.name); setOpenDropdown(null); }}
                                    className={`block w-full px-4 py-2.5 text-left text-sm transition-colors ${fabric === f.name ? "bg-orange-50 text-[#E87A3F] font-medium" : "text-gray-600 hover:bg-orange-50 hover:text-[#E87A3F]"}`}
                                >
                                    {f.name}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Brand */}
            <div>
                <SearchableDropdown
                    label="Brand"
                    value={brands.find(b => b.id === brandQuery)?.name || "All Brands"}
                    options={["All Brands", ...brands.map(b => b.name)]}
                    placeholder="All Brands"
                    variant="input"
                    searchable={true}
                    actionLabel="Select"
                    onChange={(val) => {
                        if (val === "All Brands") {
                            setBrandQuery("");
                        } else {
                            const selectedBrand = brands.find(b => b.name === val);
                            if (selectedBrand) {
                                setBrandQuery(selectedBrand.id);
                            }
                        }
                    }}
                />
            </div>

            {/* Rating */}
            <div>
                <h3 className="font-semibold text-gray-900 mb-3">Rating</h3>
                <div className="space-y-2">
                    <label className="flex items-center">
                        <input
                            type="radio"
                            name="rating"
                            value="all"
                            checked={minRating === "all" || !minRating}
                            onChange={() => setMinRating("all")}
                            className="mr-3 accent-[#E87A3F]"
                        />
                        <span className="text-gray-700">All Ratings</span>
                    </label>
                    {[4, 3, 2, 1].map((star) => (
                        <label key={star} className="flex items-center">
                            <input
                                type="radio"
                                name="rating"
                                value={star.toString()}
                                checked={minRating === star.toString()}
                                onChange={() => setMinRating(star.toString())}
                                className="mr-3 accent-[#E87A3F]"
                            />
                            <div className="flex items-center">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <svg
                                        key={i}
                                        className={`size-4 ${i < star ? "text-yellow-400 fill-yellow-400" : "text-gray-200 fill-gray-200"}`}
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                    >
                                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                    </svg>
                                ))}
                                <span className="ml-2 text-sm text-gray-600">& Up</span>
                            </div>
                        </label>
                    ))}
                </div>
            </div>

            {/* Price */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">Price</h3>
                    {/* Show dynamic range */}
                    <span className="text-sm text-[#E87A3F] font-medium">
                        ${priceRange[0]} - ${priceRange[1] >= 1000 ? "1000+" : priceRange[1]}
                    </span>
                </div>
                <PriceSlider
                    value={priceRange}
                    onValueChange={(val) => setPriceRange(val)}
                />
            </div>

            {/* On Sale */}
            <div className="flex items-center justify-between">
                <span className="font-medium text-gray-900">On sale</span>
                <input
                    type="checkbox"
                    checked={onSale}
                    onChange={(e) => setOnSale(e.target.checked)}
                    className="accent-[#E87A3F]"
                />
            </div>
        </div>
    );
}


