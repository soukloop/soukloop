'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Modal from '@/components/ui/Modal';
import { toast } from 'sonner';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface GenericModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    action: (data: any) => Promise<{ success?: boolean; error?: string }>;
    initialData?: { id?: string; name: string;[key: string]: any } | null;
    fields: { name: string; label: string; type?: 'text' | 'select' | 'color'; options?: string[] }[];
}

export default function GenericAttributeModal({ isOpen, onClose, title, action, initialData, fields }: GenericModalProps) {
    const [formData, setFormData] = useState<any>(initialData || {});
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            if (!formData.name?.trim()) {
                toast.error('Name is required');
                setLoading(false);
                return;
            }

            const res = await action(formData);
            if (res?.error) {
                toast.error(res.error);
            } else {
                toast.success('Saved successfully');
                onClose();
            }
        } catch (error) {
            toast.error('Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <div className="space-y-6 pt-2">
                {fields.map((field) => (
                    <div key={field.name} className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-gray-700">{field.label}</label>
                        {field.type === 'select' ? (
                            <Select
                                value={formData[field.name] || ''}
                                onValueChange={(value) => setFormData({ ...formData, [field.name]: value })}
                            >
                                <SelectTrigger className="w-full h-11">
                                    <SelectValue placeholder={`Select ${field.label}`} />
                                </SelectTrigger>
                                <SelectContent className="max-h-[200px]">
                                    {field.options?.map(opt => (
                                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        ) : field.type === 'color' ? (
                            <div className="flex gap-3 items-center">
                                <Input
                                    type="color"
                                    className="w-14 h-11 p-1 cursor-pointer rounded-lg"
                                    value={formData[field.name] || '#000000'}
                                    onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                                />
                                <Input
                                    placeholder="#000000"
                                    className="h-11 font-mono uppercase"
                                    value={formData[field.name] || ''}
                                    onChange={(e) => {
                                        setFormData({ ...formData, [field.name]: e.target.value });
                                    }}
                                />
                            </div>
                        ) : (
                            <Input
                                className="h-11"
                                value={formData[field.name] || ''}
                                onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                                placeholder={field.label}
                            />
                        )}
                    </div>
                ))}

                <div className="flex justify-end gap-3 mt-8">
                    <Button variant="outline" size="lg" onClick={onClose} disabled={loading}>Cancel</Button>
                    <Button
                        size="lg"
                        onClick={handleSubmit}
                        disabled={loading || !formData.name}
                        className="bg-[#E87A3F] hover:bg-[#d66a2e] text-white"
                    >
                        {loading ? 'Saving...' : 'Save'}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
