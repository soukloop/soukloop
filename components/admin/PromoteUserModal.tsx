"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Shield, User, Check } from 'lucide-react';
import { useAsyncAction } from '@/hooks/useAsyncAction';
import { toast } from 'sonner';

interface UserResult {
    id: string;
    name: string;
    email: string;
    image: string;
    role: string;
}

interface PromoteUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function PromoteUserModal({ isOpen, onClose, onSuccess }: PromoteUserModalProps) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<UserResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserResult | null>(null);
    const [selectedRole, setSelectedRole] = useState('ADMIN');

    const { execute, isLoading } = useAsyncAction();

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (query.length < 2) return;

        setIsSearching(true);
        try {
            const res = await fetch(`/api/admin/users?scope=all&query=${encodeURIComponent(query)}`);
            const data = await res.json();
            setResults(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error(error);
            toast.error('Failed to search users');
        } finally {
            setIsSearching(false);
        }
    };

    const handlePromote = async () => {
        if (!selectedUser) return;

        await execute(async () => {
            const res = await fetch(`/api/admin/subadmins/${selectedUser.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    role: selectedRole
                    // Permissions can be set later via Edit Permissions
                })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to promote user');
            }
        }, {
            successMessage: `${selectedUser.name || 'User'} promoted successfully`,
            onSuccess: () => {
                onClose();
                onSuccess();
                setQuery('');
                setResults([]);
                setSelectedUser(null);
            }
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={(val) => !val && onClose()}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-orange-500" />
                        Promote User to Admin
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Search Section */}
                    <form onSubmit={handleSearch} className="flex gap-2">
                        <Input
                            placeholder="Search by email or name..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="flex-1"
                        />
                        <Button type="submit" disabled={isSearching || query.length < 2}>
                            <Search className="h-4 w-4" />
                        </Button>
                    </form>

                    {/* Results List */}
                    <div className="min-h-[200px] max-h-[300px] overflow-y-auto border rounded-md p-2 bg-gray-50">
                        {isSearching ? (
                            <div className="flex justify-center py-4 text-gray-500 text-sm">Searching...</div>
                        ) : results.length > 0 ? (
                            <div className="space-y-2">
                                {results.map(user => (
                                    <div
                                        key={user.id}
                                        onClick={() => setSelectedUser(user)}
                                        className={`flex items-center justify-between p-3 rounded-lg cursor-pointer border transition-colors ${selectedUser?.id === user.id
                                                ? 'bg-orange-50 border-orange-200 ring-1 ring-orange-300'
                                                : 'bg-white hover:bg-gray-100 border-gray-200'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                                                <User className="h-4 w-4 text-gray-500" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm text-gray-900">{user.name || 'Unnamed'}</p>
                                                <p className="text-xs text-gray-500">{user.email}</p>
                                            </div>
                                        </div>
                                        {selectedUser?.id === user.id && (
                                            <Check className="h-4 w-4 text-orange-600" />
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-gray-400 text-sm">
                                <User className="h-8 w-8 mb-2 opacity-50" />
                                {query ? 'No users found' : 'Search for a user to promote'}
                            </div>
                        )}
                    </div>

                    {/* Role Selection & Action */}
                    {selectedUser && (
                        <div className="space-y-3 pt-2 border-t">
                            <div>
                                <label className="text-sm font-medium text-gray-700">Assign Role</label>
                                <div className="grid grid-cols-3 gap-2 mt-1">
                                    {['ADMIN', 'MODERATOR', 'SUPPORT'].map((role) => (
                                        <button
                                            key={role}
                                            onClick={() => setSelectedRole(role)}
                                            className={`px-3 py-2 text-xs font-medium rounded-md border transition-all ${selectedRole === role
                                                    ? 'bg-gray-900 text-white border-gray-900'
                                                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                                                }`}
                                        >
                                            {role}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <Button
                                onClick={handlePromote}
                                disabled={isLoading}
                                className="w-full bg-orange-500 hover:bg-orange-600"
                            >
                                {isLoading ? 'Promoting...' : `Promote ${selectedUser.name}`}
                            </Button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
