import { cn } from "../../lib/utils";

export function Card({ className, children, ...props }) {
    return (
        <div
            className={cn(
                "bg-white/70 backdrop-blur-xl border border-white/20 shadow-sm rounded-2xl p-6 transition-all duration-300 hover:shadow-md",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}
