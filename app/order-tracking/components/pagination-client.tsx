"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Pagination } from "@/components/ui/pagination";

interface OrderTrackingPaginationProps {
    totalPages: number;
    currentPage: number;
}

export function OrderTrackingPagination({ totalPages, currentPage }: OrderTrackingPaginationProps) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const router = useRouter();

    const createPageURL = (pageNumber: number) => {
        const params = new URLSearchParams(searchParams?.toString());
        params.set("page", pageNumber.toString());
        return `${pathname}?${params.toString()}`;
    };

    const onPageChange = (page: number) => {
        router.push(createPageURL(page));
    };

    return (
        <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
            className="mt-8"
        />
    );
}
