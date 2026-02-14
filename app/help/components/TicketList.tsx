import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import StatusBadge from "@/components/admin/StatusBadge" // Reusing your existing badge component
import { format } from "date-fns"

interface TicketListProps {
    userId: string
}

export async function TicketList({ userId }: TicketListProps) {
    if (!userId) return null

    const tickets = await prisma.supportTicket.findMany({
        where: {
            userId: userId
        },
        orderBy: {
            createdAt: 'desc'
        },
        take: 10 // Limit to recent 10 tickets for performance
    })

    if (tickets.length === 0) {
        return (
            <div className="mt-8 rounded-lg border bg-gray-50 p-8 text-center">
                <h3 className="text-lg font-medium text-gray-900">No Tickets Yet</h3>
                <p className="text-gray-500">You haven&apos;t submitted any support requests.</p>
            </div>
        )
    }

    return (
        <div className="mt-12">
            <h2 className="mb-6 text-xl font-bold text-gray-900">My Support Tickets</h2>
            <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 font-medium text-gray-500">Ticket ID</th>
                                <th className="px-6 py-3 font-medium text-gray-500">Subject</th>
                                <th className="px-6 py-3 font-medium text-gray-500">Status</th>
                                <th className="px-6 py-3 font-medium text-gray-500">Date</th>
                                <th className="px-6 py-3 font-medium text-gray-500">Last Reply</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {tickets.map((ticket) => (
                                <tr key={ticket.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 font-mono text-xs text-gray-500">
                                        #{ticket.id.slice(0, 8)}...
                                    </td>
                                    <td className="px-6 py-4 font-medium text-gray-900">
                                        {ticket.subject}
                                    </td>
                                    <td className="px-6 py-4">
                                        <StatusBadge status={ticket.status} type="ticket" />
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">
                                        {format(ticket.createdAt, 'MMM d, yyyy')}
                                    </td>
                                    <td className="px-6 py-4 text-gray-500 truncate max-w-[200px]">
                                        {ticket.adminReply || "-"}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
