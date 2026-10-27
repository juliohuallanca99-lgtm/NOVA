import React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef(function Input({ className, type = "text", ...props }, ref) {
  return (
    <input
      ref={ref}
      type={type}
      className={cn(
        "flex h-10 w-full border border-black/15 bg-white px-4 py-2 text-sm outline-none placeholder:text-black/40 focus-visible:ring-2 focus-visible:ring-black/30 disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
});
