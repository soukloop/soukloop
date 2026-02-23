"use client";

import { useState, useEffect } from "react";
import { FormSelect } from "@/components/ui/FormSelect";
import { ProductData } from "./types";
import RequestDressStyleModal from "./request-dress-style-modal";
import AddOptionModal from "./add-option-modal";
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

// Controls which "Add" modal is currently open
type AddModalType = "brand" | "material" | "occasion" | null;

export default function ProductDetailsStep({ data, onUpdate }: ProductDetailsStepProps) {
    const [dressStyles, setDressStyles] = useState<DressStyleOption[]>([]);
    const [isLoadingStyles, setIsLoadingStyles] = useState(false);
    const [showRequestModal, setShowRequestModal] = useState(false);
    const [requestedStyleName, setRequestedStyleName] = useState("");

    // ── Add-option modal state (shared for Brand / Material / Occasion) ──
    const [addModalType, setAddModalType] = useState<AddModalType>(null);
    const [addModalInitialName, setAddModalInitialName] = useState("");

    const openAddModal = (type: AddModalType, prefilledName = "") => {
        setAddModalType(type);
        setAddModalInitialName(prefilledName);
    };
    const closeAddModal = () => {
        setAddModalType(null);
        setAddModalInitialName("");
    };

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
                    setDressStyles(styles.map((s: any) => ({
                        ...s,
                        status: s.status || "approved",
                        isPending: s.status === "pending"
                    })));
                }
            } catch (error) {
                console.error("Failed to fetch dress styles:", error);
            } finally {
                setIsLoadingStyles(false);
            }
        };
        fetchDressStyles();
    }, [data.categoryId]);

    // Reset gender if incompatible with category
    useEffect(() => {
        const cat = data.category?.toLowerCase();
        if (cat === "men" && data.gender === "Female") onUpdate({ gender: "" });
        if (cat === "women" && data.gender === "Male") onUpdate({ gender: "" });
    }, [data.category, data.gender]);

    // Fetched Data States
    const [materials, setMaterials] = useState<{ id: string; name: string }[]>([]);
    const [occasionsList, setOccasionsList] = useState<{ id: string; name: string }[]>([]);
    const [colorsList, setColorsList] = useState<{ id: string; name: string }[]>([]);
    const [brands, setBrands] = useState<{ id: string; name: string }[]>([]);

    const [isLoadingMaterials, setIsLoadingMaterials] = useState(false);
    const [isLoadingOccasions, setIsLoadingOccasions] = useState(false);
    const [isLoadingColors, setIsLoadingColors] = useState(false);
    const [isLoadingBrands, setIsLoadingBrands] = useState(false);

    // Initial Data Fetching
    useEffect(() => {
        setIsLoadingMaterials(true);
        fetch("/api/materials")
            .then(res => res.json())
            .then(d => { if (Array.isArray(d)) setMaterials(d); })
            .catch(err => console.error("Failed to fetch materials", err))
            .finally(() => setIsLoadingMaterials(false));

        setIsLoadingOccasions(true);
        fetch("/api/occasions")
            .then(res => res.json())
            .then(d => { if (Array.isArray(d)) setOccasionsList(d); })
            .catch(err => console.error("Failed to fetch occasions", err))
            .finally(() => setIsLoadingOccasions(false));

        setIsLoadingColors(true);
        fetch("/api/colors")
            .then(res => res.json())
            .then(d => { if (Array.isArray(d)) setColorsList(d); })
            .catch(err => console.error("Failed to fetch colors", err))
            .finally(() => setIsLoadingColors(false));



        setIsLoadingBrands(true);
        fetch("/api/brands")
            .then(res => res.json())
            .then(d => { if (Array.isArray(d)) setBrands(d); })
            .catch(err => console.error("Failed to fetch brands", err))
            .finally(() => setIsLoadingBrands(false));
    }, []);

    // ── Dress Style helpers ──
    const selectedDressStyle = dressStyles.find(s => s.id === data.dressStyleId || s.name === data.dress);
    const isPendingDressSelected = selectedDressStyle?.isPending || false;

    const handleDressSelect = (styleId: string, styleName: string, isPending: boolean) => {
        onUpdate({ dress: styleName, dressStyleId: styleId, hasPendingStyle: isPending });
    };

    const handleStyleRequested = (newStyle: DressStyleOption) => {
        setDressStyles(prev => [...prev, newStyle]);
        handleDressSelect(newStyle.id, newStyle.name, true);
        setShowRequestModal(false);
    };

    // ── Color rendering ──
    const displayColors = colorsList.map(c => ({
        label: c.name,
        value: c.name,
        hex: (c as any).hexCode || ""
    }));

    const renderColorOption = (option: any) => {
        const simpleMap: Record<string, string> = {
            "Black": "#000000", "White": "#FFFFFF", "Blue": "#0000FF", "Red": "#FF0000",
            "Green": "#008000", "Yellow": "#FFFF00", "Orange": "#FFA500", "Purple": "#800080",
            "Pink": "#FFC0CB", "Grey": "#808080", "Brown": "#A52A2A", "Beige": "#F5F5DC",
        };
        const bg = option.hex || simpleMap[option.label] || "#eee";
        return (
            <div className="flex items-center gap-2">
                <span className="block h-4 w-4 rounded-full border border-gray-200 shrink-0" style={{ background: bg }} />
                <span>{option.label}</span>
            </div>
        );
    };

    // ── Modal confirm handlers ──
    const handleConfirmAddBrand = async (brandName: string) => {
        setIsLoadingBrands(true);
        const newBrand = await createBrand(brandName);
        setIsLoadingBrands(false);
        if (newBrand) {
            setBrands(prev => {
                // Avoid duplicates if it already exists
                if (prev.find(b => b.id === newBrand.id)) return prev;
                return [...prev, newBrand];
            });
            onUpdate({ brand: newBrand.name, brandId: newBrand.id });
        }
        closeAddModal();
    };

    const handleConfirmAddMaterial = async (materialName: string) => {
        setIsLoadingMaterials(true);
        const newMat = await createMaterial(materialName);
        setIsLoadingMaterials(false);
        if (newMat) {
            setMaterials(prev => {
                if (prev.find(m => m.id === newMat.id)) return prev;
                return [...prev, newMat];
            });
            onUpdate({ fabric: newMat.name, materialId: newMat.id });
        }
        closeAddModal();
    };

    const handleConfirmAddOccasion = async (occasionName: string) => {
        setIsLoadingOccasions(true);
        const newOcc = await createOccasion(occasionName);
        setIsLoadingOccasions(false);
        if (newOcc) {
            setOccasionsList(prev => {
                if (prev.find(o => o.id === newOcc.id)) return prev;
                return [...prev, newOcc];
            });
            onUpdate({ occasion: newOcc.name, occasionId: newOcc.id });
        }
        closeAddModal();
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
                isLoading={isLoadingBrands}
                placeholder="Select or add brand"
                actionItem={{
                    label: "Add new brand",
                    onClick: (query) => openAddModal("brand", query)
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
                        if (cat === "men" && g === "Female") return false;
                        if (cat === "women" && g === "Male") return false;
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
                placeholder="Select material"
                isLoading={isLoadingMaterials}
                actionItem={{
                    label: "Add new fabric",
                    onClick: (query) => openAddModal("material", query)
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

                {isPendingDressSelected && (
                    <div className="p-3 rounded-lg bg-orange-50 border border-orange-100 animate-in fade-in slide-in-from-top-2">
                        <p className="text-sm text-orange-700">
                            <strong>Note:</strong> This dress style is pending approval. Your product will be shown after the style is approved.
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
                placeholder="Select Occasion"
                isLoading={isLoadingOccasions}
                actionItem={{
                    label: "Add new occasion",
                    onClick: (query) => openAddModal("occasion", query)
                }}
                hideDefaultAddOption={true}
            />



            {/* ── Modals ── */}

            {/* Request Dress Style Modal */}
            <RequestDressStyleModal
                isOpen={showRequestModal}
                onClose={() => setShowRequestModal(false)}
                categoryId={data.categoryId}
                categoryName={data.category || ""}
                onStyleRequested={handleStyleRequested}
                initialName={requestedStyleName}
            />

            {/* Generic Add-Option Modal — shared for Brand / Material / Occasion */}
            <AddOptionModal
                isOpen={addModalType !== null}
                onClose={closeAddModal}
                label={
                    addModalType === "brand" ? "Brand" :
                        addModalType === "material" ? "Fabric" :
                            addModalType === "occasion" ? "Occasion" : ""
                }
                existingOptions={
                    addModalType === "brand" ? brands.map(b => b.name) :
                        addModalType === "material" ? materials.map(m => m.name) :
                            addModalType === "occasion" ? occasionsList.map(o => o.name) : []
                }
                onConfirm={
                    addModalType === "brand" ? handleConfirmAddBrand :
                        addModalType === "material" ? handleConfirmAddMaterial :
                            addModalType === "occasion" ? handleConfirmAddOccasion :
                                async () => { }
                }
                initialName={addModalInitialName}
                isLoading={
                    addModalType === "brand" ? isLoadingBrands :
                        addModalType === "material" ? isLoadingMaterials :
                            addModalType === "occasion" ? isLoadingOccasions : false
                }
            />
        </div>
    );
}
