import { Badge } from "@/components/ui/badge";

interface RoleBadgeProps {
    role: string;
    className?: string;
}

export default function RoleBadge({ role, className = '' }: RoleBadgeProps) {
    const roleLower = role?.toLowerCase() || '';

    let styles = 'bg-gray-100 text-gray-800 hover:bg-gray-200'; // Default

    if (roleLower === 'admin' || roleLower === 'super_admin' || roleLower === 'super admin') {
        styles = 'bg-black text-white hover:bg-gray-800 border-transparent';
    } else if (roleLower === 'seller') {
        styles = 'bg-orange-100 text-orange-800 hover:bg-orange-200 border-orange-200';
    } else if (roleLower === 'user') {
        styles = 'bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200';
    }

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border ${styles} ${className}`}>
            {role}
        </span>
    );
}
