import { cn } from "../../lib/utils";

export function ProgressBar({ value = 0, max = 100, className, colorClass = "bg-blue-500" }) {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    return (
        <div className={cn("w-full h-2 bg-gray-200/50 rounded-full overflow-hidden", className)}>
            <div
                className={cn("h-full transition-all duration-1000 ease-out rounded-full", colorClass)}
                style={{ width: `${percentage}%` }}
            />
        </div>
    );
}
