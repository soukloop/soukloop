"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Send, Sparkles } from 'lucide-react';
import StatusBadge from '@/components/admin/StatusBadge';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { format } from 'date-fns';

import { Textarea } from '@/components/ui/textarea';

interface TicketData {
    // ...
    id: string;
    subject: string;
    status: string;
    priority: string;
    createdAt: string;
    assignedTo: string;
    user: {
        name: string;
        email: string;
        isGuest: boolean;
    };
    messages: {
        id: string;
        content: string;
        isFromAdmin: boolean;
        createdAt: string;
    }[];
}

const QUICK_RESPONSES = [
    {
        label: "Investigating",
        text: "Thanks for reaching out. We are currently investigating this issue and will update you shortly."
    },
    {
        label: "Need Info",
        text: "Hi, could you please provide more details regarding this issue so we can better assist you?"
    },
    {
        label: "Resolved",
        text: "We are pleased to inform you that this issue has been resolved. Please let us know if you need anything else."
    }
];

export default function TicketDetailClient({ ticket }: { ticket: TicketData }) {
    const router = useRouter();
    const [replyMessage, setReplyMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [showResolveModal, setShowResolveModal] = useState(false);

    const handleSendReply = async () => {
        if (!replyMessage.trim()) return;

        setIsSending(true);
        try {
            const res = await fetch('/api/admin/support/reply', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ticketId: ticket.id, message: replyMessage })
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.message || 'Failed to send reply');

            toast.success(`Reply sent to ${ticket.user.email}`);
            setReplyMessage('');
            router.refresh();
        } catch (error) {
            toast.error("Failed to send reply");
            console.error(error);
        } finally {
            setIsSending(false);
        }
    };

    const handleResolve = async () => {
        try {
            const res = await fetch('/api/admin/support', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: ticket.id, status: 'resolved' })
            });

            if (!res.ok) throw new Error('Failed to resolve');

            toast.success('Ticket marked as resolved');
            setShowResolveModal(false);
            router.refresh();
        } catch (error) {
            toast.error('Failed to resolve ticket');
        }
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => router.back()}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200"
                >
                    <ArrowLeft className="h-5 w-5" />
                </button>
                <div>
                    <div className="mb-1 flex items-center gap-2 text-sm text-gray-500">
                        <span>Support Tickets</span>
                        <span>›</span>
                        <span className="text-gray-900 font-mono">{ticket.id.slice(0, 8)}...</span>
                        {ticket.user.isGuest && <span className="rounded bg-blue-100 px-2 py-0.5 text-xs text-blue-800">Guest</span>}
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">{ticket.subject}</h1>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Messages */}
                    <div className="rounded-xl border bg-white p-6 shadow-sm">
                        <h2 className="mb-4 text-lg font-semibold text-gray-900">Message Thread</h2>
                        <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2">
                            {ticket.messages.length === 0 ? (
                                <p className="text-gray-500 italic">No messages yet.</p>
                            ) : (
                                ticket.messages.map((message) => (
                                    <div
                                        key={message.id}
                                        className={`flex flex-col ${message.isFromAdmin ? 'items-end' : 'items-start'}`}
                                    >
                                        <div
                                            className={`max-w-[85%] rounded-2xl px-5 py-4 ${message.isFromAdmin
                                                ? 'bg-orange-500 text-white rounded-tr-none'
                                                : 'bg-gray-100 text-gray-900 rounded-tl-none'
                                                }`}
                                        >
                                            <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                                        </div>
                                        <p className="mt-1.5 text-xs text-gray-500 px-1">
                                            {message.isFromAdmin ? 'Admin' : ticket.user.name} • {format(new Date(message.createdAt), 'MMM d, h:mm a')}
                                        </p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>


                    {/* Reply Box */}
                    <div className="rounded-xl border bg-white p-6 shadow-sm">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-gray-900">Reply via Email</h2>
                            <div className="flex gap-2">
                                {QUICK_RESPONSES.map((qr) => (
                                    <button
                                        key={qr.label}
                                        onClick={() => setReplyMessage(qr.text)}
                                        className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
                                    >
                                        <Sparkles className="h-3 w-3 text-orange-400" />
                                        {qr.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <Textarea
                            value={replyMessage}
                            onChange={(e) => setReplyMessage(e.target.value)}
                            placeholder={`Type your custom reply to ${ticket.user.email}...`}
                            className="min-h-[150px] resize-y focus-visible:ring-orange-500"
                        />

                        <div className="mt-4 flex justify-end gap-3">
                            <Button
                                variant="outline"
                                onClick={() => setReplyMessage('')}
                                disabled={isSending}
                            >
                                Clear
                            </Button>
                            <Button
                                onClick={handleSendReply}
                                disabled={isSending || !replyMessage.trim()}
                                className="bg-orange-500 hover:bg-orange-600 text-white"
                            >
                                <Send className="mr-2 h-4 w-4" />
                                {isSending ? 'Sending...' : 'Send Reply'}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Ticket Info */}
                    <div className="rounded-xl border bg-white p-6 shadow-sm">
                        <h2 className="mb-4 text-lg font-semibold text-gray-900">Ticket Details</h2>
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-gray-500">Status</p>
                                <StatusBadge status={ticket.status} type="ticket" className="mt-1" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Priority</p>
                                <div className={`mt-1 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${ticket.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                                    ticket.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                                        ticket.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-blue-100 text-blue-800'
                                    }`}>
                                    {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                                </div>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Assigned To</p>
                                <p className="font-medium text-gray-900">{ticket.assignedTo}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Created</p>
                                <p className="text-gray-900">{format(new Date(ticket.createdAt), 'PPP p')}</p>
                            </div>
                        </div>
                    </div>

                    {/* Customer Info */}
                    <div className="rounded-xl border bg-white p-6 shadow-sm">
                        <h2 className="mb-4 text-lg font-semibold text-gray-900">Customer Info</h2>
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-gray-500">Name</p>
                                <p className="font-medium text-gray-900">{ticket.user.name}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Email</p>
                                <p className="text-gray-900 break-all">{ticket.user.email}</p>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="rounded-xl border bg-white p-6 shadow-sm">
                        <h2 className="mb-4 text-lg font-semibold text-gray-900">Actions</h2>
                        <div className="space-y-3">
                            {ticket.status !== 'resolved' && (
                                <Button
                                    onClick={() => setShowResolveModal(true)}
                                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                                >
                                    Mark as Resolved
                                </Button>
                            )}
                            {ticket.status === 'resolved' && (
                                <div className="rounded bg-green-50 p-3 text-center text-sm text-green-700 border border-green-200">
                                    Ticket is resolved
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Resolve Modal */}
            <ConfirmDialog
                isOpen={showResolveModal}
                onClose={() => setShowResolveModal(false)}
                onConfirm={handleResolve}
                title="Resolve Ticket"
                message="Are you sure you want to mark this ticket as resolved? A confirmation email will be sent to the customer."
                confirmText="Resolve Ticket"
                type="success"
            />
        </div>
    );
}

