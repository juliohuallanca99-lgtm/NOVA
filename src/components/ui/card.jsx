import React from "react";
import { cn } from "@/lib/utils";

export const Card = React.forwardRef(function Card({ className, ...props }, ref) {
  return <div ref={ref} className={cn("rounded-xl border bg-white shadow-sm", className)} {...props} />;
});

export const CardContent = React.forwardRef(function CardContent({ className, ...props }, ref) {
  return <div ref={ref} className={cn("p-6", className)} {...props} />;
});
