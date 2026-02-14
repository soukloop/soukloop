'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import DataTable, { Column } from '@/components/admin/DataTable'
import StatusBadge from '@/components/admin/StatusBadge'
import { Eye } from 'lucide-react'
import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface KYCApplication {
    id: string
    status: string
    submittedAt: string
    user: {
        id: string
        name: string
        email: string
    }
}

export default function AdminKYCPage() {
    const router = useRouter()
    const { data, isLoading } = useSWR('/api/admin/kyc/pending', fetcher)

    const verifications: KYCApplication[] = data?.verifications || []

    const columns: Column<KYCApplication>[] = [
        {
            key: 'user',
            header: 'Applicant',
            render: (app) => (
                <div>
                    <div className="font-medium text-gray-900">{app.user.name}</div>
                    <div className="text-sm text-gray-500">{app.user.email}</div>
                </div>
            )
        },
        {
            key: 'submittedAt',
            header: 'Submitted',
            render: (app) => (
                <span className="text-gray-600">
                    {new Date(app.submittedAt).toLocaleDateString()}
                </span>
            )
        },
        {
            key: 'status',
            header: 'Status',
            render: (app) => <StatusBadge status={app.status} type="kyc" />
        }
    ]

    const getActions = (app: KYCApplication) => [
        {
            label: 'Review Application',
            onClick: () => router.push(`/admin/kyc/${app.id}`)
        }
    ]

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">KYC Verification</h1>
                <p className="text-gray-600 mt-1">Review and approve seller applications</p>
            </div>

            <DataTable
                data={verifications}
                columns={columns}
                searchKeys={['user.name', 'user.email'] as any}
                isLoading={isLoading}
                emptyMessage="No pending applications"
                actions={getActions}
            />
        </div>
    )
}
