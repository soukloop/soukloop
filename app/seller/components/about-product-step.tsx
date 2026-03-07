"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, ChevronRight, X, Star, Sparkles, Info, Zap, Clock } from "lucide-react";

// Helper to format dates and calculate remaining days
const getRemainingDays = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
};

const formatBoostName = (pkg: string) => {
    switch (pkg) {
        case '3_DAYS': return '3 Day Boost';
        case '7_DAYS': return 'Weekly Spotlight (7 Days)';
        case '15_DAYS': return 'Premium Exposure (15 Days)';
        default: return pkg.replace('_', ' ');
    }
};

// Types
import { ProductData } from "./types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormSelect } from "@/components/ui/FormSelect";
import { Switch } from "@/components/ui/switch";

interface AboutProductStepProps {
    data: ProductData;
    onUpdate: (updates: Partial<ProductData>) => void;
}

export default function AboutProductStep({
    data,
    onUpdate,
}: AboutProductStepProps) {
    // Tag State logic
    const [tagInput, setTagInput] = useState("");
    const tagsArray = data.tags ? data.tags.split(',').map(t => t.trim()).filter(Boolean) : [];

    // Categories from API
    const [categories, setCategories] = useState<{ label: string, value: string }[]>([]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await fetch('/api/categories');
                const data = await res.json();
                if (Array.isArray(data)) {
                    setCategories(data.map((c: any) => ({
                        label: c.name,
                        value: c.name,
                        id: c.id // keeping ID for categoryId update
                    })));
                }
            } catch (e) {
                console.error("Failed to fetch categories", e);
            }
        };
        fetchCategories();
    }, []);

    const category = data.category;
    const adultSizes = ["XS", "Small", "Medium", "Large", "XL", "XXL", "3XL", "4XL", "5XL"];
    const kidsSizes = [
        "0–3 Months", "3–6 Months", "6–9 Months", "9–12 Months",
        "12–18 Months", "18–24 Months", "2–3 Years", "3–4 Years",
        "4–5 Years", "5–6 Years", "6–7 Years", "7–8 Years",
        "8–9 Years", "9–10 Years", "10–12 Years", "12–14 Years"
    ];

    const currentSizeOptions = category === "Kids" ? kidsSizes : adultSizes;

    const handleCategorySelect = (val: string) => {
        const cat = categories.find(c => c.value === val);
        onUpdate({
            category: val,
            categoryId: (cat as any)?.id || "",
            size: "",
            dress: "",
            dressStyleId: ""
        });
    };

    // Tag Handlers
    const handleTagKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const val = tagInput.trim();
            if (val && !tagsArray.includes(val)) {
                const newTags = [...tagsArray, val].join(', ');
                onUpdate({ tags: newTags });
                setTagInput("");
            }
        } else if (e.key === 'Backspace' && !tagInput && tagsArray.length > 0) {
            // Remove last tag on backspace if input is empty
            const newTags = tagsArray.slice(0, -1).join(', ');
            onUpdate({ tags: newTags });
        }
    };



    // Location (States / Cities) removed (handled in second step based on prev code structure, 
    // but in this file it was partially present - let's keep consistency)

    // Location (States / Cities)
    const [states, setStates] = useState<{ id: string, name: string }[]>([]);
    const [cities, setCities] = useState<string[]>([]);
    const [isLoadingStates, setIsLoadingStates] = useState(false);
    const [isLoadingCities, setIsLoadingCities] = useState(false);

    useEffect(() => {
        setIsLoadingStates(true);
        fetch('/api/locations/states').then(res => res.json()).then(data => {
            if (Array.isArray(data)) setStates(data);
        }).catch(err => console.error("Failed to fetch states", err)).finally(() => setIsLoadingStates(false));
    }, []);

    useEffect(() => {
        if (!data.state) {
            setCities([]);
            return;
        }
        const selectedState = states.find(s => s.name === data.state);
        if (!selectedState) return;

        setIsLoadingCities(true);
        fetch(`/api/locations/cities?stateId=${selectedState.id}`).then(res => res.json()).then(data => {
            if (Array.isArray(data)) setCities(data.map((c: any) => c.name));
        }).catch(err => console.error("Failed to fetch cities", err)).finally(() => setIsLoadingCities(false));
    }, [data.state, states]);

    // ... Existing Tag Logic ...
    const removeTag = (tagToRemove: string) => {
        const newTags = tagsArray.filter(t => t !== tagToRemove).join(', ');
        onUpdate({ tags: newTags });
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-[1200px]">
            {/* Product Title */}
            <div className="mb-8">
                <Label className="mb-2 block text-sm font-semibold text-gray-900">
                    Product Title
                </Label>
                <div className="relative">
                    <Input
                        type="text"
                        placeholder="e.g. Vintage Denim Jacket"
                        value={data.name}
                        onChange={(e) => onUpdate({ name: e.target.value })}
                        className="h-14 rounded-xl border-gray-100 placeholder:text-gray-400 focus-visible:ring-2 focus-visible:ring-[#E87A3F] focus-visible:border-[#E87A3F]"
                        style={{ boxShadow: "0px 2px 4px rgba(0,0,0,0.02)" }}
                        maxLength={120}
                    />
                    <div className="absolute right-3 top-4 text-xs text-gray-400">
                        {data.name?.length || 0}/120
                    </div>
                </div>
            </div>

            {/* Price */}
            <div className="mb-8">
                <Label className="mb-2 block text-sm font-semibold text-gray-900">
                    Price
                </Label>
                <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</div>
                    <Input
                        type="text"
                        inputMode="decimal"
                        placeholder="0.00"
                        value={data.price}
                        onChange={(e) => {
                            // Only allow valid decimal number characters
                            const val = e.target.value;
                            if (val === '' || /^\d*\.?\d{0,2}$/.test(val)) {
                                onUpdate({ price: val });
                            }
                        }}
                        className="h-14 pl-8 w-full rounded-xl border-gray-100 placeholder:text-gray-400 focus-visible:ring-2 focus-visible:ring-[#E87A3F] focus-visible:border-[#E87A3F]"
                        style={{ boxShadow: "0px 2px 4px rgba(0,0,0,0.02)" }}
                    />
                </div>
            </div>

            {/* Description */}
            <div className="mb-8">
                <Label className="mb-2 block text-sm font-semibold text-gray-900">
                    Description
                </Label>
                <div className="relative">
                    <Textarea
                        placeholder="Enter product description here..."
                        value={data.description}
                        onChange={(e) => onUpdate({ description: e.target.value })}
                        className="h-40 w-full resize-none rounded-xl border-gray-100 bg-white p-4 text-base text-gray-900 outline-none transition-all focus-visible:ring-2 focus-visible:ring-[#E87A3F] focus-visible:border-[#E87A3F] ring-offset-0"
                        style={{ boxShadow: "0px 2px 4px rgba(0,0,0,0.02)" }}
                        maxLength={2000}
                    />
                    <div className="absolute right-3 bottom-3 text-xs text-gray-400">
                        {data.description?.length || 0}/2000
                    </div>
                </div>
            </div>

            {/* Category & Size Grid */}
            <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormSelect
                    label="Category"
                    value={data.category || ""}
                    onChange={handleCategorySelect}
                    options={categories}
                    placeholder="Select category"
                    searchable={false}
                />

                <FormSelect
                    label="Size"
                    value={data.size || ""}
                    onChange={(val) => onUpdate({ size: val })}
                    options={currentSizeOptions}
                    placeholder="Select Size"
                    disabled={!category}
                    searchable={true}
                />
            </div>

            {/* Tags (Chip Input) */}
            <div className="mb-8">
                <Label className="mb-2 block text-sm font-semibold text-gray-900">
                    Tags
                </Label>
                <div
                    className="flex flex-wrap items-center gap-2 min-h-14 w-full rounded-xl border border-gray-100 bg-white px-4 py-2 text-base text-gray-900 transition-all focus-within:border-[#E87A3F] focus-visible:ring-2 focus-within:ring-[#E87A3F]"
                    style={{ boxShadow: "0px 2px 4px rgba(0,0,0,0.02)" }}
                >
                    {tagsArray.map((tag, i) => (
                        <span key={i} className="inline-flex items-center gap-1 bg-orange-50 text-orange-700 px-2 py-1 rounded-md text-sm font-medium">
                            {tag}
                            <button type="button" onClick={() => removeTag(tag)} className="text-orange-400 hover:text-orange-900">
                                <X className="size-3" />
                            </button>
                        </span>
                    ))}
                    <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={handleTagKeyDown}
                        placeholder={tagsArray.length === 0 ? "Type tag & hit Enter" : ""}
                        className="flex-1 min-w-[120px] outline-none bg-transparent placeholder:text-gray-400"
                    />
                </div>
                <p className="mt-1 text-xs text-gray-400">Press Enter to add a tag</p>
            </div>

            {/* ═══════════ Boost This Listing ═══════════ */}
            <div className="mb-4">
                <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 shadow-sm hover:border-orange-200 transition-colors">
                    <div className="mb-5 flex items-center gap-4">
                        <div className="flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 text-orange-600 shadow-sm">
                            <Zap className="size-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">
                                {data.activeBoost ? 'Active Listing Boost' : 'Boost Your Listing'}
                            </h3>
                            <p className="text-sm text-gray-500">
                                {data.activeBoost
                                    ? 'Your product is currently being featured at the top of search results.'
                                    : 'Get more visibility by featuring your product at the top of search results.'}
                            </p>
                        </div>
                    </div>

                    {data.activeBoost ? (
                        // Active Boost Status Card
                        <div className="rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 p-5 border border-orange-100 shadow-inner">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="inline-flex items-center gap-1 rounded-full bg-orange-500 px-2.5 py-0.5 text-[10px] font-black text-white uppercase tracking-wider">
                                            Active
                                        </span>
                                        <h4 className="font-bold text-gray-900">
                                            {formatBoostName(data.activeBoost.packageType)}
                                        </h4>
                                    </div>
                                    <p className="text-xs text-orange-800/70">
                                        Expiring on {new Date(data.activeBoost.endDate).toLocaleDateString(undefined, { dateStyle: 'long' })}
                                    </p>
                                </div>
                                <div className="flex items-center gap-3 bg-white/60 backdrop-blur-sm px-4 py-2.5 rounded-xl border border-orange-100/50">
                                    <Clock className="size-5 text-orange-600" />
                                    <div className="leading-none">
                                        <div className="text-lg font-black text-gray-900">
                                            {getRemainingDays(data.activeBoost.endDate)} Days
                                        </div>
                                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">
                                            Remaining
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-orange-100/50 flex items-center gap-2 text-xs font-semibold text-orange-700">
                                <Sparkles className="size-3.5" />
                                <span>No action needed. Your listing remains featured while you edit.</span>
                            </div>
                        </div>
                    ) : (
                        // Package Picker
                        <>
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                {[
                                    { id: 'NONE', days: 0, label: 'Free', price: 'No Boost' },
                                    { id: '3_DAYS', days: 3, label: '3 Days', price: '$2.99' },
                                    { id: '7_DAYS', days: 7, label: '7 Days', price: '$5.99', recommended: true },
                                    { id: '15_DAYS', days: 15, label: '15 Days', price: '$9.99' }
                                ].map((pkg) => {
                                    const isSelected = data.boostPackage === pkg.id || (!data.boostPackage && pkg.id === 'NONE');
                                    return (
                                        <div
                                            key={pkg.id}
                                            onClick={() => onUpdate({ boostPackage: pkg.id as any, isFeatured: pkg.id !== 'NONE' })}
                                            className={`relative cursor-pointer rounded-xl border-2 p-3 sm:p-4 transition-all ${isSelected
                                                ? 'border-orange-500 bg-orange-50 shadow-sm'
                                                : 'border-gray-100 bg-white hover:border-orange-200'
                                                }`}
                                        >
                                            {pkg.recommended && (
                                                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-2 py-0.5 text-[10px] sm:text-[11px] font-bold text-white uppercase tracking-wider shadow-sm">
                                                    Popular
                                                </div>
                                            )}
                                            <div className="flex flex-col items-center text-center justify-center h-full gap-1">
                                                <span className={`text-xs sm:text-sm font-semibold uppercase tracking-wide ${isSelected ? 'text-orange-900' : 'text-gray-500'}`}>
                                                    {pkg.label}
                                                </span>
                                                <span className={`text-base sm:text-lg font-bold ${isSelected ? 'text-orange-600' : 'text-gray-900'}`}>
                                                    {pkg.price}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {data.boostPackage && data.boostPackage !== 'NONE' && (
                                <div className="mt-5 rounded-xl bg-orange-50/50 p-4 text-sm text-orange-800 space-y-2 border border-orange-100">
                                    <div className="flex items-center gap-2">
                                        <Sparkles className="size-4.5 text-orange-500" />
                                        <span>Your product will appear <span className="font-semibold text-gray-900">at the top</span> with a <span className="inline-flex items-center gap-1 rounded bg-amber-100 px-1.5 py-0.5 text-xs font-bold text-amber-700">★ Featured</span> badge.</span>
                                    </div>
                                    <div className="flex items-center gap-2 pt-2 border-t border-orange-100/50">
                                        <span className="text-orange-600">💳</span>
                                        <span>You will be prompted to pay after publishing your listing.</span>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

