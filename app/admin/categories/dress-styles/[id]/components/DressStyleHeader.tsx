"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Edit2, Save, X, Trash2, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import StatusBadge from "@/components/admin/StatusBadge";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

interface DressStyle {
    id: string;
    name: string;
    categoryType: string;
    status: string;
    createdAt: string;
    _count?: {
        products: number;
    };
}

interface DressStyleHeaderProps {
    style: DressStyle;
}

export default function DressStyleHeader({ style }: DressStyleHeaderProps) {
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState(style.name);
    const [editCategory, setEditCategory] = useState(style.categoryType);
    const [saving, setSaving] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch(`/api/admin/dress-styles/${style.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: editName, categoryType: editCategory })
            });

            if (res.ok) {
                setIsEditing(false);
                toast.success("Style updated successfully");
                router.refresh();
            } else {
                toast.error("Failed to update style");
            }
        } catch (error) {
            toast.error("Failed to update style");
        } finally {
            setSaving(false);
        }
    };

    const handleStatusChange = async (action: 'approve' | 'reject' | 'suspend' | 'activate') => {
        try {
            const res = await fetch('/api/admin/dress-styles', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: style.id, action })
            });

            if (res.ok) {
                toast.success(`Style ${action}d successfully`);
                router.refresh();
            } else {
                toast.error("Failed to update status");
            }
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    const handleDelete = () => {
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        setIsDeleting(true);
        setIsDeleteDialogOpen(false);
        try {
            const res = await fetch(`/api/admin/dress-styles/${style.id}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                toast.success("Style deleted");
                router.push('/admin/categories?tab=dress-styles');
            } else {
                const err = await res.json();
                toast.error(err.error || "Failed deletion");
            }
        } catch (error) {
            toast.error("Failed to delete style");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    {isEditing ? (
                        <div className="space-y-4 max-w-md">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Style Name</label>
                                <Input
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    placeholder="Style name"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                <select
                                    value={editCategory}
                                    onChange={(e) => setEditCategory(e.target.value)}
                                    className="w-full border border-gray-200 rounded-lg p-2"
                                >
                                    <option value="Women">Women</option>
                                    <option value="Men">Men</option>
                                    <option value="Kids">Kids</option>
                                </select>
                            </div>
                            <div className="flex gap-2">
                                <Button onClick={handleSave} disabled={saving} className="bg-[#E87A3F]">
                                    <Save className="mr-2 h-4 w-4" /> {saving ? 'Saving...' : 'Save'}
                                </Button>
                                <Button variant="outline" onClick={() => setIsEditing(false)}>
                                    <X className="mr-2 h-4 w-4" /> Cancel
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Style Information</h3>
                                <p className="text-sm text-gray-500">
                                    Created: {new Date(style.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                </p>
                                <p className="text-sm text-gray-500 mt-1">
                                    Total Products: {style._count?.products || 0}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
                {!isEditing && (
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                            <Edit2 className="mr-2 h-4 w-4" /> Edit
                        </Button>
                        {style.status === 'pending' && (
                            <>
                                <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleStatusChange('approve')}>
                                    <CheckCircle className="mr-2 h-4 w-4" /> Approve
                                </Button>
                                <Button size="sm" variant="destructive" onClick={() => handleStatusChange('reject')}>
                                    <XCircle className="mr-2 h-4 w-4" /> Reject
                                </Button>
                            </>
                        )}
                        {style.status === 'approved' && (
                            <Button size="sm" variant="outline" onClick={() => handleStatusChange('suspend')}>
                                Suspend
                            </Button>
                        )}
                        {style.status === 'suspended' && (
                            <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleStatusChange('activate')}>
                                Activate
                            </Button>
                        )}
                        <Button size="sm" variant="ghost" className="text-red-600 hover:bg-red-50" onClick={handleDelete}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                )}
            </div>

            <ConfirmDialog
                isOpen={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Dress Style"
                message="Are you sure you want to delete this style? Products using it will need to be reassigned."
                type="danger"
                confirmText="Delete"
                isLoading={isDeleting}
            />
        </div>
    );
}
