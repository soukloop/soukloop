"use client";

import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, UploadCloud } from "lucide-react";

interface EditSellerModalProps {
    isOpen: boolean;
    onClose: () => void;
    verificationId: string;
    initialData: {
        govIdType?: string;
        govIdNumber?: string;
        taxIdType?: string;
        taxId?: string;
    };
    onSuccess: () => void;
}

export function EditSellerModal({ isOpen, onClose, verificationId, initialData, onSuccess }: EditSellerModalProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        govIdType: initialData.govIdType || 'cnic',
        govIdNumber: initialData.govIdNumber || '',
        taxIdType: initialData.taxIdType || '',
        taxId: initialData.taxId || ''
    });

    const [files, setFiles] = useState<{ [key: string]: File | null }>({
        govIdFront: null,
        govIdBack: null
    });

    const fileInputRefs = {
        govIdFront: useRef<HTMLInputElement>(null),
        govIdBack: useRef<HTMLInputElement>(null)
    };

    const handleFileChange = (key: string, e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFiles(prev => ({ ...prev, [key]: e.target.files![0] }));
        }
    };

    const uploadFile = async (file: File) => {
        return new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = error => reject(error);
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // If ID Type changed, we might want to force upload, but for now we just upload if files selected
            const updates: any = { ...formData };

            if (files.govIdFront) {
                updates.govIdFrontUrl = await uploadFile(files.govIdFront);
            }
            if (files.govIdBack) {
                updates.govIdBackUrl = await uploadFile(files.govIdBack);
            }

            const res = await fetch(`/api/admin/kyc/${verificationId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'update_details',
                    details: updates
                })
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message || 'Failed to update details');
            }

            toast.success("Seller details updated successfully");
            onSuccess();
            onClose();
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const renderFileUpload = (key: 'govIdFront' | 'govIdBack', label: string) => (
        <div className="space-y-2">
            <Label>{label}</Label>
            <div
                onClick={() => fileInputRefs[key].current?.click()}
                className="border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors h-32"
            >
                {files[key] ? (
                    <div className="text-center">
                        <p className="text-sm font-medium text-green-600 truncate max-w-[200px]">{files[key]?.name}</p>
                        <p className="text-xs text-gray-400">Click to change</p>
                    </div>
                ) : (
                    <div className="text-center text-gray-500">
                        <UploadCloud className="h-6 w-6 mx-auto mb-2 text-gray-400" />
                        <p className="text-xs">Click to upload</p>
                    </div>
                )}
                <input
                    type="file"
                    ref={fileInputRefs[key]}
                    onChange={(e) => handleFileChange(key, e)}
                    accept="image/*"
                    className="hidden"
                />
            </div>
        </div>
    );

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Seller Details</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* ID Section */}
                        <div className="space-y-4">
                            <h4 className="font-medium text-gray-900 border-b pb-2">Identity Details</h4>
                            <div className="space-y-2">
                                <Label>ID Type</Label>
                                <Select
                                    value={formData.govIdType}
                                    onValueChange={(val) => setFormData(prev => ({ ...prev, govIdType: val }))}
                                >
                                    <SelectTrigger className="focus:ring-[#E87A3F] focus:border-[#E87A3F]">
                                        <SelectValue placeholder="Select ID Type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="DRIVERS_LICENSE">Driving License</SelectItem>
                                        <SelectItem value="PASSPORT">Passport</SelectItem>
                                        <SelectItem value="NATIONAL_ID">National ID / CNIC</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>ID Number</Label>
                                <Input
                                    value={formData.govIdNumber}
                                    onChange={(e) => setFormData(prev => ({ ...prev, govIdNumber: e.target.value }))}
                                    placeholder="Enter ID Number"
                                    className="focus-visible:ring-[#E87A3F]"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                {renderFileUpload('govIdFront', 'ID Front Image')}
                                {renderFileUpload('govIdBack', 'ID Back Image')}
                            </div>
                        </div>

                        {/* Tax Section (Optional) */}
                        <div className="space-y-4">
                            <h4 className="font-medium text-gray-900 border-b pb-2">Tax Details</h4>
                            <div className="space-y-2">
                                <Label>Tax ID Type</Label>
                                <Select
                                    value={formData.taxIdType}
                                    onValueChange={(val) => setFormData(prev => ({ ...prev, taxIdType: val }))}
                                >
                                    <SelectTrigger className="focus:ring-[#E87A3F] focus:border-[#E87A3F]">
                                        <SelectValue placeholder="Select Tax ID Type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="SSN">SSN</SelectItem>
                                        <SelectItem value="EIN">EIN</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Tax ID</Label>
                                <Input
                                    value={formData.taxId}
                                    onChange={(e) => setFormData(prev => ({ ...prev, taxId: e.target.value }))}
                                    placeholder={formData.taxIdType === 'SSN' ? 'XXX-XX-XXXX' : 'XX-XXXXXXX'}
                                    className="focus-visible:ring-[#E87A3F]"
                                />
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose} className="hover:bg-gray-50 border-gray-200 text-gray-700">Cancel</Button>
                        <Button type="submit" disabled={loading} className="bg-[#E87A3F] hover:bg-[#d96d34] text-white">
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Changes
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
