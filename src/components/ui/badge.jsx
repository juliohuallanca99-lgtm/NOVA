import React from "react";
import { cn } from "@/lib/utils";

export function Badge({ className, ...props }) {
  return (
    <span
      className={cn(
        "inline-flex items-center border border-transparent bg-black px-2.5 py-0.5 text-xs font-semibold text-white",
        className
      )}
      {...props}
    />
  );
}
