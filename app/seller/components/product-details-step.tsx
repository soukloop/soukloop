"use client";

import { useState, useEffect } from "react";
import { FormSelect } from "@/components/ui/FormSelect";
import { ProductData } from "./types";
import RequestDressStyleModal from "./request-dress-style-modal";
import { Loader2 } from "lucide-react";
import { getDressStylesByCategory, createBrand, createMaterial, createOccasion } from "../actions";

import { Label } from "@/components/ui/label";

interface ProductDetailsStepProps {
    data: ProductData;
    onUpdate: (updates: Partial<ProductData>) => void;
}

interface DressStyleOption {
    id: string;
    name: string;
    status: string;
    isPending: boolean;
}

export default function ProductDetailsStep({ data, onUpdate }: ProductDetailsStepProps) {
    const [dressStyles, setDressStyles] = useState<DressStyleOption[]>([]);
    const [isLoadingStyles, setIsLoadingStyles] = useState(false);
    const [showRequestModal, setShowRequestModal] = useState(false);
    const [requestedStyleName, setRequestedStyleName] = useState("");


    // ...

    // Fetch dress styles when category changes
    useEffect(() => {
        const fetchDressStyles = async () => {
            if (!data.categoryId) {
                setDressStyles([]);
                return;
            }

            setIsLoadingStyles(true);
            try {
                const styles = await getDressStylesByCategory(data.categoryId);
                if (styles) {
                    // Map to expected format (server action returns {id, name}, component expects more fields?)
                    // Interface DressStyleOption { id: string; name: string; status: string; isPending: boolean; }
                    // We can map status='approved', isPending=false for fetched ones.
                    setDressStyles(styles.map((s: any) => ({ ...s, status: 'approved', isPending: false })));
                }
            } catch (error) {
                console.error('Failed to fetch dress styles:', error);
            } finally {
                setIsLoadingStyles(false);
            }
        };

        fetchDressStyles();
    }, [data.categoryId]);

    // Close when clicking outside - removed as FormSelect uses Popover

    // Reset gender if incompatible with category
    useEffect(() => {
        const cat = data.category?.toLowerCase();
        if (cat === 'men' && data.gender === 'Female') onUpdate({ gender: "" });
        if (cat === 'women' && data.gender === 'Male') onUpdate({ gender: "" });
    }, [data.category, data.gender]);

    // Fetched Data States
    const [materials, setMaterials] = useState<{ id: string, name: string }[]>([]);
    const [occasionsList, setOccasionsList] = useState<{ id: string, name: string }[]>([]);
    const [colorsList, setColorsList] = useState<{ id: string, name: string }[]>([]);

    // Loading States for initial data
    const [isLoadingMaterials, setIsLoadingMaterials] = useState(false);
    const [isLoadingOccasions, setIsLoadingOccasions] = useState(false);
    const [isLoadingColors, setIsLoadingColors] = useState(false);

    // Location States
    const [states, setStates] = useState<{ id: string, name: string }[]>([]);
    const [isLoadingStates, setIsLoadingStates] = useState(false);

    // Initial Data Fetching
    useEffect(() => {
        // Materials
        setIsLoadingMaterials(true);
        fetch('/api/materials')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setMaterials(data);
            })
            .catch(err => console.error("Failed to fetch materials", err))
            .finally(() => setIsLoadingMaterials(false));

        // Occasions
        setIsLoadingOccasions(true);
        fetch('/api/occasions')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setOccasionsList(data);
            })
            .catch(err => console.error("Failed to fetch occasions", err))
            .finally(() => setIsLoadingOccasions(false));

        // Colors
        setIsLoadingColors(true);
        fetch('/api/colors')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setColorsList(data);
            })
            .catch(err => console.error("Failed to fetch colors", err))
            .finally(() => setIsLoadingColors(false));

        // States
        setIsLoadingStates(true);
        fetch('/api/locations/states')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setStates(data);
            })
            .catch(err => console.error("Failed to fetch states", err))
            .finally(() => setIsLoadingStates(false));
    }, []);



    // Handle Adding New Options (Optimistic)
    const handleAddNewOption = (type: 'material' | 'occasion' | 'color', value: string) => {
        if (!value.trim()) return;
        const val = value.trim();
        if (type === 'material') {
            const existing = materials.find(m => m.name.toLowerCase() === val.toLowerCase());
            if (existing) {
                onUpdate({ fabric: existing.name, materialId: existing.id });
            } else {
                onUpdate({ fabric: val, materialId: "" });
            }
        } else if (type === 'occasion') {
            const existing = occasionsList.find(o => o.name.toLowerCase() === val.toLowerCase());
            if (existing) {
                onUpdate({ occasion: existing.name, occasionId: existing.id });
            } else {
                onUpdate({ occasion: val, occasionId: "" });
            }
        } else if (type === 'color') {
            const existing = colorsList.find(c => c.name.toLowerCase() === val.toLowerCase());
            if (existing) {
                onUpdate({ color: existing.name, colorId: existing.id });
            } else {
                onUpdate({ color: val, colorId: "" });
            }
        }
    };

    // Colors
    const displayColors = colorsList.map(c => ({
        label: c.name,
        value: c.name,
        hex: (c as any).hexCode || ""
    }));

    const renderColorOption = (option: any) => {
        // Fallback map if hexCode missing from DB
        const simpleMap: Record<string, string> = {
            "Black": "#000000", "White": "#FFFFFF", "Blue": "#0000FF", "Red": "#FF0000",
            "Green": "#008000", "Yellow": "#FFFF00", "Orange": "#FFA500", "Purple": "#800080",
            "Pink": "#FFC0CB", "Grey": "#808080", "Brown": "#A52A2A", "Beige": "#F5F5DC",
        };
        const bg = option.hex || simpleMap[option.label] || '#eee';
        return (
            <div className="flex items-center gap-2">
                <span className="block h-4 w-4 rounded-full border border-gray-200 shrink-0" style={{ background: bg }} />
                <span>{option.label}</span>
            </div>
        );
    };

    // Get current selected dress style
    const selectedDressStyle = dressStyles.find(s => s.id === data.dressStyleId || s.name === data.dress);
    const isPendingDressSelected = selectedDressStyle?.isPending || false;

    // Handle dress style selection
    const handleDressSelect = (styleId: string, styleName: string, isPending: boolean) => {
        onUpdate({
            dress: styleName,
            dressStyleId: styleId,
            hasPendingStyle: isPending
        });
    };

    // Handle new style request creation
    const handleStyleRequested = (newStyle: DressStyleOption) => {
        setDressStyles(prev => [...prev, newStyle]);
        handleDressSelect(newStyle.id, newStyle.name, true);
        setShowRequestModal(false);
    };

    // Brands Logic (Existing)
    const [brands, setBrands] = useState<{ id: string, name: string }[]>([]);
    const [isLoadingBrands, setIsLoadingBrands] = useState(false);

    useEffect(() => {
        const fetchBrands = async () => {
            setIsLoadingBrands(true);
            try {
                const res = await fetch('/api/brands');
                const data = await res.json();
                if (Array.isArray(data)) {
                    setBrands(data);
                }
            } catch (error) {
                console.error('Failed to fetch brands', error);
            } finally {
                setIsLoadingBrands(false);
            }
        };
        fetchBrands();
    }, []);

    const handleAddBrand = (newBrand: string) => {
        if (!newBrand || !newBrand.trim()) return;
        const brandName = newBrand.trim();
        const existing = brands.find(b => b.name.toLowerCase() === brandName.toLowerCase());
        if (existing) {
            onUpdate({ brand: existing.name, brandId: existing.id });
        } else {
            onUpdate({ brand: brandName, brandId: "" });
        }
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-[1200px] pb-10 space-y-6">

            {/* Brand Dropdown */}
            <FormSelect
                label="Brand"
                value={data.brand || ""}
                onChange={(val) => {
                    const existing = brands.find(b => b.name === val);
                    onUpdate({ brand: val, brandId: existing?.id || "" });
                }}
                options={brands.map(b => b.name)}
                onAddNew={handleAddBrand}
                isLoading={isLoadingBrands}
                placeholder="Select or add brand"
                actionItem={{
                    label: "Add new brand",
                    onClick: async (query) => {
                        if (!query) return;
                        setIsLoadingBrands(true);
                        const newBrand = await createBrand(query);
                        setIsLoadingBrands(false);
                        if (newBrand) {
                            setBrands(prev => [...prev, newBrand]);
                            onUpdate({ brand: newBrand.name, brandId: newBrand.id });
                        }
                    }
                }}
                hideDefaultAddOption={true}
            />

            {/* Color Dropdown */}
            <FormSelect
                label="Color"
                value={data.color || ""}
                onChange={(val) => {
                    const existing = colorsList.find(c => c.name === val);
                    onUpdate({ color: val, colorId: existing?.id || "" });
                }}
                options={displayColors}
                renderOption={renderOption => renderColorOption(renderOption)}
                placeholder="Select color"
                searchable={false}
                isLoading={isLoadingColors}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Condition Dropdown */}
                <FormSelect
                    label="Condition"
                    placeholder="Select Condition"
                    value={data.condition}
                    options={["New", "Used - Like New", "Used - Good", "Used - Fair"]}
                    onChange={(val) => onUpdate({ condition: val })}
                    searchable={false}
                />

                {/* Gender Dropdown */}
                <FormSelect
                    label="Gender"
                    placeholder="Select Gender"
                    value={data.gender}
                    options={["Male", "Female", "Unisex"].filter(g => {
                        const cat = data.category?.toLowerCase();
                        if (cat === 'men' && g === 'Female') return false;
                        if (cat === 'women' && g === 'Male') return false;
                        return true;
                    })}
                    onChange={(val) => onUpdate({ gender: val })}
                    searchable={false}
                />
            </div>

            {/* Fabric Dropdown */}
            <FormSelect
                label="Fabric / Material"
                value={data.fabric || ""}
                onChange={(val) => {
                    const existing = materials.find(m => m.name === val);
                    onUpdate({ fabric: val, materialId: existing?.id || "" });
                }}
                options={materials.map(m => m.name)}
                onAddNew={(val) => handleAddNewOption('material', val)}
                placeholder="Select material"
                isLoading={isLoadingMaterials}
                actionItem={{
                    label: "Add new fabric",
                    onClick: async (query) => {
                        if (!query) return;
                        setIsLoadingMaterials(true);
                        const newMat = await createMaterial(query);
                        setIsLoadingMaterials(false);
                        if (newMat) {
                            setMaterials(prev => [...prev, newMat]);
                            onUpdate({ fabric: newMat.name, materialId: newMat.id });
                        }
                    }
                }}
                hideDefaultAddOption={true}
            />

            {/* Dress Style Dropdown */}
            <div className="grid grid-cols-1 gap-2">
                <Label className="text-sm font-semibold text-gray-900">Dress Style</Label>
                {!data.category ? (
                    <div className="h-14 w-full rounded-xl border border-gray-100 bg-gray-50 flex items-center px-4 text-gray-400 text-sm">
                        Please select a category first
                    </div>
                ) : (
                    <FormSelect
                        value={data.dress || ""}
                        renderValue={() => (
                            <div className="flex items-center gap-2">
                                <span>{data.dress || "Search or request style"}</span>
                                {isPendingDressSelected && (
                                    <Loader2 className="h-4 w-4 animate-spin text-orange-500" />
                                )}
                            </div>
                        )}
                        onChange={(val) => {
                            const style = dressStyles.find(s => s.name === val);
                            if (style) {
                                handleDressSelect(style.id, style.name, style.isPending);
                            }
                        }}
                        options={dressStyles.filter(s => s && s.name).map(s => s.name)}
                        onAddNew={(val) => {
                            setRequestedStyleName(val);
                            setShowRequestModal(true);
                        }}
                        isLoading={isLoadingStyles}
                        placeholder="Search or request style"
                        actionItem={{
                            label: "Request new style",
                            onClick: (query) => {
                                setRequestedStyleName(query);
                                setShowRequestModal(true);
                            }
                        }}
                        hideDefaultAddOption={true}
                        renderOption={(opt) => {
                            const style = dressStyles.find(s => s.name === opt.label);
                            return (
                                <div className="flex items-center justify-between w-full">
                                    <span>{opt.label}</span>
                                    {style?.isPending && (
                                        <span className="text-[10px] bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded-full uppercase tracking-wide font-bold">
                                            Pending
                                        </span>
                                    )}
                                </div>
                            );
                        }}
                    />
                )}

                {/* Warning for pending dress style */}
                {isPendingDressSelected && (
                    <div className="p-3 rounded-lg bg-orange-50 border border-orange-100 animate-in fade-in slide-in-from-top-2">
                        <p className="text-sm text-orange-700">
                            <strong>Note:</strong> This dress style is pending approval. Product is shown to the user after the dress style is approved.
                        </p>
                    </div>
                )}
            </div>

            {/* Occasion Dropdown */}
            <FormSelect
                label="Occasion"
                value={data.occasion || ""}
                onChange={(val) => {
                    const existing = occasionsList.find(o => o.name === val);
                    onUpdate({ occasion: val, occasionId: existing?.id || "" });
                }}
                options={occasionsList.map(o => o.name)}
                onAddNew={(val) => handleAddNewOption('occasion', val)}
                placeholder="Select Occasion"
                isLoading={isLoadingOccasions}
                actionItem={{
                    label: "Add new occasion",
                    onClick: async (query) => {
                        if (!query) return;
                        setIsLoadingOccasions(true);
                        const newOcc = await createOccasion(query);
                        setIsLoadingOccasions(false);
                        if (newOcc) {
                            setOccasionsList(prev => [...prev, newOcc]);
                            onUpdate({ occasion: newOcc.name, occasionId: newOcc.id });
                        }
                    }
                }}
                hideDefaultAddOption={true}
            />

            {/* Location Section */}
            <div className="mt-8 pt-6 border-t border-gray-100" />
            <h3 className="text-lg font-bold text-gray-900">Item Location</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormSelect
                    label="State"
                    value={data.state || ""}
                    onChange={(val) => {
                        onUpdate({ state: val });
                    }}
                    options={states.map(s => s.name)}
                    isLoading={isLoadingStates}
                    placeholder="Select State"
                />
            </div>

            {/* Request Dress Style Modal */}
            <RequestDressStyleModal
                isOpen={showRequestModal}
                onClose={() => setShowRequestModal(false)}
                categoryId={data.categoryId}
                categoryType={data.category || ''}
                onStyleRequested={handleStyleRequested}
                initialName={requestedStyleName}
            />
        </div>
    );
}
