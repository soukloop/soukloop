'use client';

import useSWR from 'swr';
import { getMyRewardsAction } from '@/features/rewards/actions';

const fetcher = async ([_, page, limit]: [string, number, number]) => {
    const data = await getMyRewardsAction(page, limit);
    if (!data) throw new Error('Not authenticated');
    return data;
};

export function useRewards(page: number = 1, limit: number = 5, initialData?: any) {
    const { data, error, isLoading, mutate } = useSWR(['my-rewards', page, limit], fetcher, {
        revalidateOnFocus: false,
        dedupingInterval: 10000,
        keepPreviousData: true,
        fallbackData: page === 1 ? initialData : undefined,
    });

    return {
        balance: data?.balance || null,
        history: data?.history || [],
        pagination: data?.pagination || { total: 0, page: 1, limit: 5, totalPages: 1 },
        isLoading,
        error,
        mutate,
    };
}
