"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DataTable, { Column, FilterOption } from '@/components/admin/DataTable';
import StatusBadge from '@/components/admin/StatusBadge';
import { CopyButton } from "@/components/ui/copy-button";
import { toast } from 'sonner';

interface SupportTicket {
    id: string;
    userId: string;
    subject: string;
    description: string;
    status: string;
    priority: string;
    assignedTo: string | null;
    createdAt: string;
    updatedAt: string;
    user: {
        id: string;
        name: string | null;
        email: string;
    };
    guestName?: string | null;
    guestEmail?: string | null;
}

interface SupportTicketsClientProps {
    initialTickets: SupportTicket[];
}

export default function SupportTicketsClient({ initialTickets }: SupportTicketsClientProps) {
    const router = useRouter();
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    // Format for display
    const formattedTickets = initialTickets.map(t => ({
        id: `#${t.id.slice(0, 6).toUpperCase()}`,
        originalId: t.id,
        userSeller: t.guestName || t.user?.name || t.guestEmail || t.user?.email || 'Unknown',
        subject: t.subject,
        createdOn: new Date(t.createdAt).toLocaleDateString(),
        lastUpdated: new Date(t.updatedAt).toLocaleDateString(),
        assignedTo: t.assignedTo || 'Unassigned',
        status: t.status.charAt(0).toUpperCase() + t.status.slice(1).replace(' ', ' '),
        priority: t.priority,
        rawStatus: t.status
    }));

    // Table columns
    const columns: Column<typeof formattedTickets[0]>[] = [
        {
            key: 'id',
            header: 'Ticket ID',
            render: (ticket) => (
                <div className="group/ticket-id flex items-center gap-2">
                    <span className="font-medium text-blue-600">{ticket.id}</span>
                    <CopyButton value={ticket.originalId} hoverOnly className="h-3 w-3 text-gray-400 hover:text-blue-600" />
                </div>
            )
        },
        {
            key: 'userSeller',
            header: 'User/Seller',
            render: (ticket) => <span className="text-gray-900">{ticket.userSeller}</span>,
        },
        {
            key: 'subject',
            header: 'Subject',
            render: (ticket) => <span className="text-gray-900">{ticket.subject}</span>,
        },
        {
            key: 'priority',
            header: 'Priority',
            render: (ticket) => (
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${ticket.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                    ticket.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                        ticket.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                    }`}>
                    {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                </span>
            ),
        },
        {
            key: 'createdOn',
            header: 'Created On',
            render: (ticket) => <span className="text-gray-600">{ticket.createdOn}</span>,
        },
        {
            key: 'assignedTo',
            header: 'Assigned To',
            render: (ticket) => (
                <span className={ticket.assignedTo === 'Unassigned' ? 'text-red-500' : 'text-gray-600'}>
                    {ticket.assignedTo}
                </span>
            ),
        },
        {
            key: 'status',
            header: 'Status',
            render: (ticket) => <StatusBadge status={ticket.status} type="ticket" />,
        },
    ];

    // Row actions
    const getActions = (ticket: typeof formattedTickets[0]) => [
        {
            label: 'View Details',
            onClick: () => router.push(`/admin/support/${ticket.originalId}`),
        },
        ...(ticket.rawStatus !== 'resolved' && ticket.rawStatus !== 'closed' ? [
            {
                label: 'Mark as Resolved',
                onClick: async () => {
                    setUpdatingId(ticket.originalId);
                    try {
                        const res = await fetch('/api/admin/support', {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ id: ticket.originalId, status: 'resolved' })
                        });
                        if (!res.ok) throw new Error('Failed to update ticket');
                        toast.success('Ticket marked as resolved');
                        router.refresh();
                    } catch (error) {
                        toast.error('Failed to update ticket');
                    } finally {
                        setUpdatingId(null);
                    }
                },
                className: 'text-green-600',
            }
        ] : []),
        ...(ticket.rawStatus === 'resolved' ? [
            {
                label: 'Close Ticket',
                onClick: async () => {
                    setUpdatingId(ticket.originalId);
                    try {
                        const res = await fetch('/api/admin/support', {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ id: ticket.originalId, status: 'closed' })
                        });
                        if (!res.ok) throw new Error('Failed to update ticket');
                        toast.success('Ticket closed');
                        router.refresh();
                    } catch (error) {
                        toast.error('Failed to update ticket');
                    } finally {
                        setUpdatingId(null);
                    }
                },
                className: 'text-gray-600',
            }
        ] : []),
    ];

    // Filter options
    const filterOptions: FilterOption<typeof formattedTickets[0]>[] = [
        {
            key: 'status',
            label: 'Status',
            options: [
                { label: 'Open', value: 'Open' },
                { label: 'In Progress', value: 'In progress' },
                { label: 'Resolved', value: 'Resolved' },
                { label: 'Closed', value: 'Closed' },
            ]
        },
        {
            key: 'priority',
            label: 'Priority',
            options: [
                { label: 'Urgent', value: 'urgent' },
                { label: 'High', value: 'high' },
                { label: 'Medium', value: 'medium' },
                { label: 'Low', value: 'low' },
            ]
        }
    ];

    // Stats
    const openCount = initialTickets.filter(t => t.status === 'open').length;
    const inProgressCount = initialTickets.filter(t => t.status === 'in progress').length;
    const resolvedCount = initialTickets.filter(t => t.status === 'resolved').length;

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Support Tickets</h1>
            </div>

            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-4">
                <div className="rounded-xl border bg-white p-4">
                    <p className="text-sm text-gray-600">Total Tickets</p>
                    <p className="text-2xl font-bold text-gray-900">{initialTickets.length}</p>
                </div>
                <div className="rounded-xl border bg-white p-4">
                    <p className="text-sm text-gray-600">Open</p>
                    <p className="text-2xl font-bold text-red-600">{openCount}</p>
                </div>
                <div className="rounded-xl border bg-white p-4">
                    <p className="text-sm text-gray-600">In Progress</p>
                    <p className="text-2xl font-bold text-yellow-600">{inProgressCount}</p>
                </div>
                <div className="rounded-xl border bg-white p-4">
                    <p className="text-sm text-gray-600">Resolved</p>
                    <p className="text-2xl font-bold text-green-600">{resolvedCount}</p>
                </div>
            </div>

            {/* Data Table */}
            <DataTable
                data={formattedTickets}
                columns={columns}
                pageSize={15}
                searchable
                searchPlaceholder="Search tickets..."
                searchKeys={['id', 'userSeller', 'subject']}
                filterOptions={filterOptions}
                actions={getActions}
            />
        </div>
    );
}
