import React from "react";
import { cn } from "@/lib/utils";

const variants = {
  default: "bg-black text-white hover:bg-black/85",
  outline: "border border-black/20 bg-transparent hover:bg-black hover:text-white",
};

const sizes = {
  default: "h-10 px-4 py-2 text-sm",
  lg: "h-12 px-8 text-base",
};

export const Button = React.forwardRef(function Button(
  { className, variant = "default", size = "default", type = "button", ...props },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/40 disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
});
