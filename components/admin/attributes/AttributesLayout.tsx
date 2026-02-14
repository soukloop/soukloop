'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useRef, useState, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

const TABS = [
    { id: 'categories', label: 'Main Categories' },
    { id: 'dress-styles', label: 'Dress Styles' },
    { id: 'brands', label: 'Brands' },
    { id: 'colors', label: 'Colors' },
    { id: 'fabrics', label: 'Fabrics' },
    { id: 'occasions', label: 'Occasions' },
];

export default function AttributesLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const activeTab = searchParams?.get('tab') || 'categories';
    const [mobileOpen, setMobileOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const activeLabel = TABS.find(t => t.id === activeTab)?.label || 'Main Categories';

    const createQueryString = useCallback(
        (name: string, value: string) => {
            const params = new URLSearchParams(searchParams?.toString());
            params.set(name, value);
            // Reset page when switching tabs
            params.delete('page');
            params.delete('search');
            params.delete('status');
            return params.toString();
        },
        [searchParams]
    );

    const handleTabChange = (tabId: string) => {
        router.push('?' + createQueryString('tab', tabId));
        setMobileOpen(false);
    };

    // Close dropdown on outside click
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setMobileOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-4 md:space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-xl md:text-2xl font-bold">Attributes Management</h1>
            </div>

            {/* Mobile: Dropdown Tab Selector */}
            <div className="md:hidden" ref={dropdownRef}>
                <div className="relative">
                    <button
                        onClick={() => setMobileOpen(!mobileOpen)}
                        className={`flex h-12 w-full items-center justify-between rounded-xl border bg-white px-4 text-sm font-medium outline-none transition-all ${mobileOpen
                                ? 'border-[#E87A3F] ring-2 ring-[#E87A3F]'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                        style={{ boxShadow: '0px 2px 4px rgba(0,0,0,0.02)' }}
                    >
                        <span className="text-[#E87A3F] font-semibold">{activeLabel}</span>
                        <ChevronDown className={`ml-2 h-4 w-4 text-gray-400 transition-transform ${mobileOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {mobileOpen && (
                        <div className="absolute top-full z-30 mt-2 w-full overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xl animate-in fade-in zoom-in-95 duration-200">
                            <div className="max-h-[350px] overflow-y-auto custom-scrollbar p-1.5">
                                {TABS.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => handleTabChange(tab.id)}
                                        className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 my-0.5 text-sm cursor-pointer transition-colors ${activeTab === tab.id
                                                ? 'bg-[#FEF3EC] text-[#E87A3F] font-semibold'
                                                : 'text-gray-600 hover:bg-orange-50 hover:text-[#E87A3F]'
                                            }`}
                                    >
                                        <span>{tab.label}</span>
                                        {activeTab === tab.id && <Check className="h-4 w-4" />}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Desktop: Tab Bar */}
            <div className="hidden md:flex gap-4 border-b border-gray-200 overflow-x-auto">
                {TABS.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => handleTabChange(tab.id)}
                        className={`pb-3 px-1 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${activeTab === tab.id
                            ? 'border-[#E87A3F] text-[#E87A3F]'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="min-h-[500px]">
                {children}
            </div>
        </div>
    );
}
