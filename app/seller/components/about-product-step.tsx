"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, ChevronRight, X } from "lucide-react";

// Types
import { ProductData } from "./types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormSelect } from "@/components/ui/FormSelect";

interface AboutProductStepProps {
    data: ProductData;
    onUpdate: (updates: Partial<ProductData>) => void;
}

export default function AboutProductStep({
    data,
    onUpdate,
}: AboutProductStepProps) {
    // Dropdown state moved to FormSelect internal Popover

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
        </div>
    );
}

