import React from 'react';

/**
 * Skeleton loader for InsightCard - displays animated placeholders while insights are loading
 */
const InsightCardSkeleton = () => {
    return (
        <div className="relative bg-[#141414] rounded-[24px] p-6 border border-[#222] animate-pulse">
            {/* Top Glow Shimmer */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-[1px] bg-gradient-to-r from-transparent via-[#333] to-transparent" />

            <div className="flex items-start justify-between mb-4">
                {/* Icon placeholder */}
                <div className="w-12 h-12 rounded-2xl bg-[#222]" />

                {/* Impact badge and timestamp placeholder */}
                <div className="flex flex-col items-end gap-1.5">
                    <div className="w-20 h-6 rounded-full bg-[#222]" />
                    <div className="w-14 h-3 rounded bg-[#1a1a1a]" />
                </div>
            </div>

            {/* Title placeholder */}
            <div className="h-6 w-3/4 bg-[#222] rounded mb-3" />

            {/* Message lines placeholder */}
            <div className="space-y-2 mb-6">
                <div className="h-4 w-full bg-[#1a1a1a] rounded" />
                <div className="h-4 w-5/6 bg-[#1a1a1a] rounded" />
                <div className="h-4 w-4/6 bg-[#1a1a1a] rounded" />
            </div>

            {/* Button placeholder */}
            <div className="h-5 w-28 bg-[#222] rounded" />
        </div>
    );
};

/**
 * Grid of skeleton cards for the insights section
 */
export const InsightSkeletonGrid = ({ count = 3 }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: count }).map((_, index) => (
                <InsightCardSkeleton key={index} />
            ))}
        </div>
    );
};

export default InsightCardSkeleton;
