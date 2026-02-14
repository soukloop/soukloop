"use client";

import DataTable from "@/components/admin/DataTable";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface ChatsDataTableProps {
    data: any[];
}

export default function ChatsDataTable({ data }: ChatsDataTableProps) {
    const chatColumns = [
        {
            key: 'participants',
            header: 'Participants',
            render: (chat: any) => {
                const buyerImage = chat.buyer?.profile?.avatar || chat.buyer?.vendor?.logo || chat.buyer?.image;
                const sellerImage = chat.seller?.profile?.avatar || chat.seller?.vendor?.logo || chat.seller?.image;

                return (
                    <div className="flex items-center gap-3">
                        <div className="flex -space-x-2">
                            <div className="h-8 w-8 rounded-full border-2 border-white bg-blue-100 overflow-hidden relative">
                                {buyerImage ? (
                                    <img src={buyerImage} alt="Buyer" className="h-full w-full object-cover" />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center text-xs font-bold text-blue-600">B</div>
                                )}
                            </div>
                            <div className="h-8 w-8 rounded-full border-2 border-white bg-green-100 overflow-hidden relative">
                                {sellerImage ? (
                                    <img src={sellerImage} alt="Seller" className="h-full w-full object-cover" />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center text-xs font-bold text-green-600">S</div>
                                )}
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <span className="font-semibold text-sm text-gray-900">
                                {chat.buyer?.name || 'Buyer'} <span className="text-gray-400 font-normal">&</span> {chat.seller?.name || 'Seller'}
                            </span>
                        </div>
                    </div>
                );
            }
        },
        {
            key: 'lastMessage',
            header: 'Latest Activity',
            render: (chat: any) => (
                <div className="flex flex-col">
                    <span className="text-sm text-gray-900 truncate max-w-[240px] font-medium">
                        {chat.messages?.[0]?.message || (chat.messages?.[0]?.imageUrl ? 'Sent an image' : 'No messages')}
                    </span>
                    <span className="text-xs text-gray-500">
                        {chat.messages?.[0]?.createdAt ? new Date(chat.messages[0].createdAt).toLocaleDateString() : new Date(chat.createdAt).toLocaleDateString()}
                    </span>
                </div>
            )
        },
        {
            key: 'action',
            header: 'Action',
            render: (chat: any) => (
                <Link href={`/admin/chats/${chat.id}`}>
                    <Button
                        size="sm"
                        variant="ghost"
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    >
                        View Conversation <ArrowLeft className="ml-2 h-3.5 w-3.5 rotate-180" />
                    </Button>
                </Link>
            )
        }
    ];

    return (
        <DataTable
            columns={chatColumns}
            data={data}
            pageSize={10}
            emptyMessage="No conversations found for this product."
        />
    );
}
