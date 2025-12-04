export const ProgressCircleSkeleton = () => {
    return (
        <div className="flex flex-col items-center gap-6 lg:gap-8">
            {/* Half circle skeleton */}
            <div className="relative h-[100px] w-[200px]">
                <div className="absolute inset-0 overflow-hidden">
                    <div 
                        className="h-[200px] w-[200px] animate-pulse rounded-full border-[16px] border-quaternary"
                        style={{ clipPath: 'inset(0 0 50% 0)' }}
                    />
                </div>
                {/* Center value skeleton */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
                    <div className="h-8 w-12 animate-pulse rounded bg-quaternary" />
                </div>
            </div>
            
            {/* Text skeletons */}
            <div className="flex flex-col items-center gap-2">
                <div className="h-5 w-32 animate-pulse rounded bg-quaternary" />
                <div className="h-4 w-48 animate-pulse rounded bg-quaternary" />
            </div>
        </div>
    );
};

