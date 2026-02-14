'use client'

import React, { useState, useEffect } from 'react'
import { Loader2, Plus, Trash2, Edit2, CheckCircle2, Building2, User, CreditCard } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
    saveBankAccount,
    updateBankAccount,
    deleteBankAccount
} from '@/src/features/withdrawals/actions'
// Actually, I'll use a local fetch or useSWR for listing.

export interface BankAccount {
    id: string
    bankName: string
    accountHolder: string
    accountNumber: string
    routingNumber?: string | null
    isDefault: boolean
}

export default function BankAccountsSection() {
    const [accounts, setAccounts] = useState<BankAccount[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [showForm, setShowForm] = useState(false)
    const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null)

    // Form state
    const [formData, setFormData] = useState({
        bankName: '',
        accountHolder: '',
        accountNumber: '',
        routingNumber: '',
        isDefault: false
    })

    const fetchAccounts = async () => {
        setIsLoading(true)
        try {
            const res = await fetch('/api/vendor/bank-accounts')
            if (!res.ok) throw new Error('Failed to fetch bank accounts')
            const data = await res.json()
            setAccounts(data)
        } catch (error) {
            console.error(error)
            toast.error('Failed to load bank accounts')
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchAccounts()
    }, [])

    const handleEdit = (account: BankAccount) => {
        setEditingAccount(account)
        setFormData({
            bankName: account.bankName,
            accountHolder: account.accountHolder,
            accountNumber: '', // Clear for security, force re-entry if they want to change it
            routingNumber: '',
            isDefault: account.isDefault
        })
        setShowForm(true)
    }

    const resetForm = () => {
        setFormData({
            bankName: '',
            accountHolder: '',
            accountNumber: '',
            routingNumber: '',
            isDefault: false
        })
        setEditingAccount(null)
        setShowForm(false)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSaving(true)
        try {
            if (editingAccount) {
                await updateBankAccount(editingAccount.id, formData)
                toast.success('Bank account updated')
            } else {
                await saveBankAccount(formData)
                toast.success('Bank account added')
            }
            await fetchAccounts()
            resetForm()
        } catch (error: any) {
            toast.error(error.message || 'Failed to save bank account')
        } finally {
            setIsSaving(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this bank account?')) return
        try {
            await deleteBankAccount(id)
            toast.success('Bank account deleted')
            await fetchAccounts()
        } catch (error: any) {
            toast.error(error.message || 'Failed to delete bank account')
        }
    }

    if (isLoading && accounts.length === 0) {
        return (
            <div className="flex h-48 items-center justify-center">
                <Loader2 className="size-8 animate-spin text-[#E87A3F]" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">Bank Accounts</h3>
                {!showForm && (
                    <Button
                        onClick={() => setShowForm(true)}
                        className="bg-[#E87A3F] hover:bg-[#d66d34] text-white"
                    >
                        <Plus className="mr-2 size-4" /> Add Account
                    </Button>
                )}
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="rounded-xl border border-gray-100 bg-gray-50 p-6 space-y-4 animate-in fade-in slide-in-from-top-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="bankName">Bank Name</Label>
                            <div className="relative">
                                <Building2 className="absolute left-3 top-3 size-4 text-gray-400" />
                                <Input
                                    id="bankName"
                                    placeholder="e.g. Chase Bank"
                                    className="pl-10"
                                    value={formData.bankName}
                                    onChange={e => setFormData({ ...formData, bankName: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="accountHolder">Account Holder Name</Label>
                            <div className="relative">
                                <User className="absolute left-3 top-3 size-4 text-gray-400" />
                                <Input
                                    id="accountHolder"
                                    placeholder="Full Name"
                                    className="pl-10"
                                    value={formData.accountHolder}
                                    onChange={e => setFormData({ ...formData, accountHolder: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="accountNumber">Account Number</Label>
                            <div className="relative">
                                <CreditCard className="absolute left-3 top-3 size-4 text-gray-400" />
                                <Input
                                    id="accountNumber"
                                    placeholder={editingAccount ? "Enter new number to update" : "12345678"}
                                    className="pl-10"
                                    value={formData.accountNumber}
                                    onChange={e => setFormData({ ...formData, accountNumber: e.target.value })}
                                    required={!editingAccount} // Only required if adding new, or maybe always required if they want to save? If they leave it empty during edit, should we keep old?
                                    // Complex. Simplest approach: Delete and Add New is better.
                                    // But if we support Edit, and they leave it blank, we need to handle that in backend (keep existing).
                                    // My backend `updateBankAccount` overrides it. 
                                    // Let's make it required. They have to re-enter it to verify/change.
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="routingNumber">Routing Number (Optional)</Label>
                            <Input
                                id="routingNumber"
                                placeholder="9-digit code"
                                value={formData.routingNumber}
                                onChange={e => setFormData({ ...formData, routingNumber: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="flex items-center space-x-2 pt-2">
                        <Checkbox
                            id="isDefault"
                            checked={formData.isDefault}
                            onCheckedChange={(checked) => setFormData({ ...formData, isDefault: !!checked })}
                        />
                        <label htmlFor="isDefault" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            Set as primary payout account
                        </label>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="ghost" onClick={resetForm} disabled={isSaving}>
                            Cancel
                        </Button>
                        <Button type="submit" className="bg-[#E87A3F] hover:bg-[#d66d34] text-white" disabled={isSaving}>
                            {isSaving ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
                            {editingAccount ? 'Update Account' : 'Save Account'}
                        </Button>
                    </div>
                </form>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
                {isLoading ? (
                    // Skeletons
                    [1, 2].map(i => (
                        <div key={i} className="rounded-xl border border-gray-100 bg-white p-5 md:p-6 space-y-3">
                            <div className="flex justify-between items-start">
                                <div className="space-y-2 w-full">
                                    <div className="h-4 bg-gray-100 rounded w-1/3" />
                                    <div className="h-3 bg-gray-100 rounded w-1/2" />
                                    <div className="h-4 bg-gray-100 rounded w-2/3 mt-2" />
                                </div>
                                <div className="h-8 w-8 bg-gray-100 rounded-full" />
                            </div>
                        </div>
                    ))
                ) : accounts.length === 0 && !showForm ? (
                    <div className="col-span-full rounded-xl border border-dashed border-gray-200 p-12 text-center">
                        <Building2 className="mx-auto size-12 text-gray-300 mb-4" />
                        <p className="text-gray-500 font-medium">No bank accounts added yet.</p>
                        <p className="text-sm text-gray-400 mt-1">Add your account details to receive payouts.</p>
                    </div>
                ) : (
                    accounts.map(account => (
                        <div
                            key={account.id}
                            className={`group relative rounded-xl border p-5 transition-all md:p-6 ${account.isDefault
                                ? 'border-[#E87A3F] bg-orange-50/30'
                                : 'border-gray-100 bg-white hover:border-gray-200'
                                }`}
                        >
                            <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <p className="font-bold text-gray-900">{account.bankName}</p>
                                        {account.isDefault && (
                                            <span className="inline-flex items-center rounded-full bg-[#E87A3F] px-2 py-0.5 text-[10px] font-black uppercase text-white">
                                                Primary
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-600">{account.accountHolder}</p>
                                    <p className="text-sm font-mono text-gray-500 mt-2">
                                        **** {account.accountNumber.slice(-4)}
                                    </p>
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button variant="ghost" size="icon" className="size-8" onClick={() => handleEdit(account)}>
                                        <Edit2 className="size-4 text-gray-500" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="size-8 hover:bg-red-50" onClick={() => handleDelete(account.id)}>
                                        <Trash2 className="size-4 text-red-500" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
