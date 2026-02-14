"use client";

import { useParams } from 'next/navigation';
import AdminUserDetails from '@/components/admin/AdminUserDetails';

export default function AdminSellerPage() {
    const params = useParams();
    const id = params?.id as string;

    return <AdminUserDetails userId={id} />;
}
