import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Modal from "@/components/ui/Modal";
import LocationSelector from "@/components/ui/LocationSelector";
import { Star } from "lucide-react";
import { toast } from "sonner";

export interface TestimonialData {
    id?: string;
    name: string;
    location?: string;
    rating: number;
    text: string;
    profileImage?: string;
    isActive: boolean;
}

interface TestimonialFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialData?: TestimonialData | null;
    onSave: (data: TestimonialData) => Promise<void>;
}

export default function TestimonialFormModal({
    isOpen,
    onClose,
    initialData,
    onSave
}: TestimonialFormModalProps) {
    const [formData, setFormData] = useState<TestimonialData>({
        name: '',
        location: '',
        rating: 5,
        text: '',
        profileImage: '',
        isActive: true
    });

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                // Ensure we copy all fields
                setFormData({
                    id: initialData.id,
                    name: initialData.name || '',
                    location: initialData.location || '',
                    rating: initialData.rating || 5,
                    text: initialData.text || '',
                    profileImage: initialData.profileImage || '',
                    isActive: initialData.isActive ?? true
                });
            } else {
                // Reset for new entry
                setFormData({
                    name: '',
                    location: '',
                    rating: 5,
                    text: '',
                    profileImage: '',
                    isActive: true
                });
            }
        }
    }, [isOpen, initialData]);

    // Use callbacks to prevent unnecessary re-renders of child components (esp. LocationSelector)
    const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, name: e.target.value }));
    }, []);

    const handleLocationChange = useCallback((val: string) => {
        setFormData(prev => ({ ...prev, location: val }));
    }, []);

    const handleRatingChange = useCallback((rating: number) => {
        setFormData(prev => ({ ...prev, rating }));
    }, []);

    const handleTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, text: e.target.value }));
    }, []);

    const handleImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, profileImage: e.target.value }));
    }, []);

    const handleActiveChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, isActive: e.target.checked }));
    }, []);

    const handleSave = async () => {
        try {
            await onSave(formData);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={initialData?.id ? "Edit Testimonial" : "Add Testimonial"}>
            <div className="space-y-5 px-1 py-1">
                <div>
                    <label className="text-sm font-medium mb-1 block">Name</label>
                    <Input
                        value={formData.name}
                        onChange={handleNameChange}
                        placeholder="John Doe"
                    />
                </div>

                <div>
                    <label className="text-sm font-medium mb-1 block">Location</label>
                    <LocationSelector
                        type="state"
                        value={formData.location || ''}
                        onChange={handleLocationChange}
                        placeholder="Select State"
                    />
                </div>

                <div>
                    <label className="text-sm font-medium mb-2 block">Rating</label>
                    <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                onClick={() => handleRatingChange(star)}
                                className="focus:outline-none transition-transform hover:scale-110"
                            >
                                <Star
                                    size={28}
                                    className={`${(formData.rating || 0) >= star ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                                />
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="text-sm font-medium mb-1 block">Review Text</label>
                    <textarea
                        value={formData.text}
                        onChange={handleTextChange}
                        className="w-full border border-input px-3 py-2 rounded-md h-28 resize-none focus:outline-none focus:ring-1 focus:ring-ring text-sm"
                        placeholder="Write the review here..."
                    />
                </div>

                <div>
                    <label className="text-sm font-medium mb-1 block">Profile Image URL</label>
                    <Input
                        value={formData.profileImage}
                        onChange={handleImageChange}
                        placeholder="/path/to/image.jpg"
                    />
                </div>

                <div className="flex items-center gap-2 pt-2">
                    <input
                        type="checkbox"
                        id="isActive"
                        checked={formData.isActive}
                        onChange={handleActiveChange}
                        className="h-4 w-4 rounded border-gray-300 text-[#E87A3F] focus:ring-[#E87A3F]"
                    />
                    <label htmlFor="isActive" className="text-sm font-medium cursor-pointer">Active (Visible on Homepage)</label>
                </div>

                <div className="flex justify-end gap-2 mt-6">
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSave} className="bg-[#E87A3F]">Save</Button>
                </div>
            </div>
        </Modal>
    );
}
