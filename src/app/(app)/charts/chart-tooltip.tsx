interface ChartTooltipProps {
    active?: boolean;
    payload?: Array<{ value: number; name: string }>;
    label?: string;
    formatLabel: (value: string) => string;
}

export const ChartTooltip = ({ active, payload, label, formatLabel }: ChartTooltipProps) => {
    if (!active || !payload || payload.length === 0) return null;
    
    return (
        <div className="flex flex-col gap-0.5 rounded-lg bg-primary-solid px-3 py-2 shadow-lg">
            <p className="text-xs font-semibold text-white">{formatLabel(label || '')}</p>
            <p className="text-xs text-tooltip-supporting-text">
                {payload[0].name}: {payload[0].value}
            </p>
        </div>
    );
};


