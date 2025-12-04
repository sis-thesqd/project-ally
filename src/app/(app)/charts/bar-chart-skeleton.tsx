export const BarChartSkeleton = () => {
    const bars = [40, 65, 45, 80, 55, 70, 50, 85, 60, 75, 45, 90];
    
    return (
        <div className="flex h-full w-full items-end justify-between gap-2 px-2">
            {bars.map((height, index) => (
                <div
                    key={index}
                    className="flex-1 animate-pulse rounded-t-md bg-quaternary"
                    style={{ height: `${height}%` }}
                />
            ))}
        </div>
    );
};

