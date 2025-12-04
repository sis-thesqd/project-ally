export const BarChartSkeleton = () => {
    const bars = [40, 65, 45, 80, 55, 70, 50, 85, 60, 75, 45, 90];
    
    return (
        <div className="flex h-full w-full items-end justify-around gap-1 px-2 lg:gap-3">
            {bars.map((height, index) => (
                <div
                    key={index}
                    className="w-5 max-w-14 flex-1 animate-pulse rounded-t-md bg-quaternary lg:w-12"
                    style={{ height: `${height}%` }}
                />
            ))}
        </div>
    );
};

