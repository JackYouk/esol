import { Rabbit } from "lucide-react";
import { cn } from "../../lib/utils";


export function Logo({ className, iconClassName }: { className?: string, iconClassName?: string }) {
    return (
        <div className={cn("font-bold flex text-2xl items-end", className)}>
            <span>ESOLe &#x311;</span><Rabbit className={cn("pb-1", iconClassName)}  /><span>p</span>
        </div>
    )
}