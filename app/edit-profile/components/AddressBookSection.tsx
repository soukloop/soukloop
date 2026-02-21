'use client'

import React, { useState } from 'react'
import { Loader2, AlertCircle, Edit2, Plus, X } from 'lucide-react'
import BillingAddressForm, { BillingAddressFormData } from '@/components/forms/BillingAddressForm'
import { FormSkeleton } from "@/components/ui/skeletons"
import { useProfile, Address } from '@/hooks/useProfile'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import ConfirmDialog from '@/components/ui/ConfirmDialog'

export default function AddressBookSection({ userId }: { userId?: string }) {
    const {
        profile,
        addresses,
        addressesLoading,
        addressesError,
        createAddress,
        updateAddress,
        deleteAddress,
        isAuthenticated,
    } = useProfile(userId)

    const [editingAddressId, setEditingAddressId] = useState<string | null>(null)
    const [deletingAddressId, setDeletingAddressId] = useState<string | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)
    const [showForm, setShowForm] = useState(false)
    const [initialFormData, setInitialFormData] = useState<Partial<BillingAddressFormData> | undefined>(undefined)
    const formRef = React.useRef<HTMLDivElement>(null)

    // Get user name from profile
    const userName = profile?.firstName && profile?.lastName
        ? `${profile.firstName} ${profile.lastName}`
        : profile?.user?.name || 'User'
    const userPhone = profile?.phone || ''

    // Reset form when switching modes
    // Logic for visibility
    const userRole = profile?.user?.role;
    const canManageSellerAddress = ['SELLER', 'ADMIN', 'SUPER_ADMIN'].includes(userRole || '');
    const excludeFields: (keyof BillingAddressFormData)[] = ['email', 'firstName', 'lastName', 'phone'];
    if (!canManageSellerAddress) {
        excludeFields.push('isSellerAddress');
    }

    // Handle editing
    const handleEdit = (addressId: string) => {
        if (addresses) {
            const addressToEdit = addresses.find((a: Address) => a.id === addressId)
            if (addressToEdit) {
                setInitialFormData({
                    address1: addressToEdit.address1,
                    city: addressToEdit.city,
                    state: addressToEdit.state,
                    postalCode: addressToEdit.postalCode,
                    country: addressToEdit.country,
                    email: 'placeholder@example.com',
                    isSellerAddress: addressToEdit.isSellerAddress
                })
            }
        }
        setEditingAddressId(addressId)
        setShowForm(true)
        // Scroll to form after a short delay to allow rendering
        setTimeout(() => {
            formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }, 100)
    }

    // Handle save (create or update)
    const handleSave = async (data: BillingAddressFormData) => {
        const addressData = {
            address1: data.address1,
            city: data.city,
            state: data.state,
            postalCode: data.postalCode,
            country: data.country,
            isDefault: false,
            isShipping: true, // Default to shipping when adding from Address Book
            isSellerAddress: data.isSellerAddress || false, // Capture the seller flag
        }

        try {
            // Enforce Exclusivity: If setting as seller address, unset others first
            if (data.isSellerAddress && addresses) {
                const otherSellerAddresses = addresses.filter((a: Address) =>
                    a.isSellerAddress && a.id !== editingAddressId
                )

                // Update them sequentially to avoid race conditions or use Promise.all
                await Promise.all(otherSellerAddresses.map((addr: Address) =>
                    updateAddress(addr.id, { isSellerAddress: false })
                ))
            }

            if (editingAddressId) {
                await updateAddress(editingAddressId, addressData)
                toast.success('Address updated successfully')
            } else {
                await createAddress(addressData)
                toast.success('Address created successfully')
            }
            setEditingAddressId(null)
            setShowForm(false)
            setInitialFormData(undefined)
        } catch (error) {
            console.error('Failed to save address', error)
            toast.error('Failed to save address')
        }
    }

    const handleAddNew = () => {
        setEditingAddressId(null)
        setInitialFormData(undefined)
        setShowForm(true)
        // Scroll to form
        setTimeout(() => {
            formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }, 100)
    }

    const handleCancel = () => {
        setEditingAddressId(null)
        setShowForm(false)
        setInitialFormData(undefined)
    }

    const handleDelete = (addressId: string) => {
        setDeletingAddressId(addressId)
    }

    const handleConfirmDelete = async () => {
        if (!deletingAddressId) return

        setIsDeleting(true)
        try {
            await deleteAddress(deletingAddressId)
            toast.success('Address deleted successfully')
            setDeletingAddressId(null)
        } catch (error) {
            console.error('Failed to delete address', error)
            toast.error('Failed to delete address')
        } finally {
            setIsDeleting(false)
        }
    }

    // Loading state
    if (addressesLoading) {
        return (
            <div className="flex justify-center px-4 sm:px-6">
                <div className="w-full max-w-6xl rounded-lg bg-white p-4 shadow-sm">
                    <FormSkeleton />
                </div>
            </div>
        )
    }

    // Error state
    if (addressesError || !isAuthenticated) {
        return (
            <div className="flex justify-center px-4 sm:px-6">
                <div className="flex h-[400px] w-full max-w-6xl items-center justify-center rounded-lg bg-white p-4 shadow-sm">
                    <div className="flex flex-col items-center gap-3 text-center">
                        <AlertCircle className="size-10 text-red-500" />
                        <div>
                            <p className="font-semibold text-gray-900">
                                {!isAuthenticated ? 'Please sign in to view your address book' : 'Failed to load address book'}
                            </p>
                            <p className="text-sm text-gray-600">
                                {addressesError?.message || 'Please try again later'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    const savedAddresses = (addresses || []) as Address[]

    return (
        <div className="flex justify-center px-4 sm:px-6">
            <div className="w-full max-w-6xl space-y-6">
                {/* Address Form Section */}
                {showForm && (
                    <div ref={formRef} className="rounded-lg bg-white p-4 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-4 md:mb-6">
                            <h2 className="text-lg md:text-xl font-semibold text-gray-900">
                                {editingAddressId ? 'Edit Address' : 'Add New Address'}
                            </h2>
                            <button
                                onClick={handleCancel}
                                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X className="size-5" />
                            </button>
                        </div>
                        <BillingAddressForm
                            key={editingAddressId || 'new'}
                            initialData={initialFormData}
                            onSave={handleSave}
                            isLoading={addressesLoading}
                            mode="profile"
                            showTitle={false}
                            submitButtonText={editingAddressId ? 'Update Address' : 'Save Address'}
                            showDiscardButton={true}
                            onDiscard={handleCancel}
                            excludeFields={excludeFields}
                        />
                    </div>
                )}

                {/* Add New Address Button (when form is hidden) */}
                {!showForm && (
                    <Button
                        onClick={handleAddNew}
                        className="w-full h-14 rounded-xl bg-[#E87A3F] hover:bg-[#d96d34] text-white font-semibold text-base"
                    >
                        <Plus className="size-5 mr-2" />
                        Add New Address
                    </Button>
                )}

                {/* Saved Addresses Grid */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Saved Addresses</h3>
                    {savedAddresses.length === 0 ? (
                        <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
                            <p className="text-gray-500">No saved addresses yet.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            {savedAddresses.map((address) => {
                                // Get name/phone from profile (address.user.profile)
                                const displayName = address.user?.profile?.firstName && address.user?.profile?.lastName
                                    ? `${address.user.profile.firstName} ${address.user.profile.lastName}`
                                    : address.user?.name || userName
                                const displayPhone = address.user?.profile?.phone || userPhone

                                return (
                                    <div
                                        key={address.id}
                                        className={`relative rounded-xl border p-4 transition-all ${address.isDefault
                                            ? 'border-[#E87A3F] bg-orange-50'
                                            : 'border-gray-200 bg-white hover:border-gray-300'
                                            }`}
                                    >
                                        {address.isDefault && (
                                            <span className="absolute top-2 right-2 inline-flex items-center rounded-full bg-[#E87A3F] px-2 py-0.5 text-xs font-semibold text-white">
                                                Default
                                            </span>
                                        )}
                                        <div className="space-y-1 text-sm text-gray-700 pr-16">
                                            <p className="font-semibold text-gray-900">
                                                {displayName}
                                            </p>
                                            <p>{address.address1}</p>
                                            <p>
                                                {address.city}, {address.state} {address.postalCode}
                                            </p>
                                            <p>{address.country}</p>
                                            {displayPhone && <p className="text-gray-500">{displayPhone}</p>}
                                            {/* Purpose badges */}
                                            <div className="flex flex-wrap gap-1 mt-2">
                                                {canManageSellerAddress && address.isSellerAddress && (
                                                    <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">Seller Address</span>
                                                )}
                                                {address.isShipping && (
                                                    <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">Shipping</span>
                                                )}
                                                {address.isBilling && (
                                                    <span className="inline-flex items-center rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700">Billing</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="mt-4 flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleEdit(address.id)}
                                                className="flex-1 rounded-lg border-gray-200 text-gray-700 hover:bg-gray-100 hover:text-[#E87A3F] hover:border-[#E87A3F]/30"
                                            >
                                                <Edit2 className="size-4 mr-1" />
                                                Edit
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleDelete(address.id)}
                                                className="rounded-lg border-red-200 text-red-600 hover:bg-red-50 px-3"
                                            >
                                                <X className="size-4" />
                                            </Button>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>

                <ConfirmDialog
                    isOpen={!!deletingAddressId}
                    onClose={() => setDeletingAddressId(null)}
                    onConfirm={handleConfirmDelete}
                    title="Delete Address"
                    message="Are you sure you want to delete this address? This action cannot be undone."
                    type="danger"
                    confirmText="Delete"
                    isLoading={isDeleting}
                />
            </div>
        </div>
    )
}
