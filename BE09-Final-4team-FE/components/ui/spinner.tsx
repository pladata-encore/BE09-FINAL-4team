"use client"

import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import React from "react";

const spinnerVariants = cva(
  "text-gray-500 animate-spin",
  {
    variants: {
      size: {
        default: "h-4 w-4",
        sm: "h-3 w-3",
        lg: "h-6 w-6",
        xl: "h-8 w-8",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
);

interface SpinnerProps extends React.SVGAttributes<SVGElement>, VariantProps<typeof spinnerVariants> {}

const Spinner = React.forwardRef<SVGSVGElement, SpinnerProps>(
  ({ className, size, ...props }, ref) => (
    <Loader2
      ref={ref}
      className={cn(spinnerVariants({ size, className }))}
      {...props}
    />
  )
);
Spinner.displayName = "Spinner";

export { Spinner };