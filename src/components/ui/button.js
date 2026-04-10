import * as React from "react"
import { cn } from "@/lib/utils"

const Button = React.forwardRef(({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
  const Comp = asChild ? "div" : "button";
  
  // Base brutal styles
  const baseStyles = "inline-flex items-center justify-center whitespace-nowrap rounded-none text-sm font-bold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brutal-black disabled:pointer-events-none disabled:opacity-50 border-3 border-brutal-black active:translate-x-[2px] active:translate-y-[2px] active:shadow-none";
  
  // Variants mapping
  const variants = {
    default: "bg-brutal-yellow text-brutal-black hover:bg-yellow-400 shadow-brutal",
    pink: "bg-brutal-pink text-brutal-black hover:bg-pink-400 shadow-brutal",
    mint: "bg-brutal-mint text-brutal-black hover:bg-teal-300 shadow-brutal",
    white: "bg-brutal-white text-brutal-black shadow-brutal hover:bg-slate-100",
    outline: "bg-transparent text-brutal-black border-brutal-black shadow-brutal hover:bg-brutal-black hover:text-white",
    ghost: "border-transparent shadow-none hover:bg-brutal-black hover:text-white active:translate-x-0 active:translate-y-0 relative !border-0",
  };

  // Sizes mapping
  const sizes = {
    default: "h-12 px-6 py-2",
    sm: "h-9 px-3 text-xs",
    lg: "h-14 px-8 text-base",
    icon: "h-12 w-12",
  };

  return (
    <Comp
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      ref={ref}
      {...props}
    />
  )
});
Button.displayName = "Button"

export { Button }
