import { Pagination as UIPagination } from "@/components/ui/pagination";

// Using the unified UI component which matches the interface and style of the application
interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    className?: string;
}

export default function Pagination(props: PaginationProps) {
    return (
        <UIPagination
            {...props}
            showPageNumbers={true}
        />
    );
}
