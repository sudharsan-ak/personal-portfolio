import React, { ButtonHTMLAttributes, ReactNode, forwardRef } from "react";

interface InteractiveButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: string;
  size?: string;
  asChild?: boolean;
}

const InteractiveButton = forwardRef<HTMLButtonElement, InteractiveButtonProps>(
  ({ children, className = "", variant: _variant, size, asChild, ...props }, ref) => {
    const isIcon = size === "icon";
    if (asChild) {
      const child = children as React.ReactElement<React.HTMLAttributes<HTMLElement> & { ref?: React.Ref<HTMLElement> }>;
      return (
        <child.type
          {...child.props}
          {...props}
          ref={ref}
          className={`relative overflow-hidden transition-all duration-300 group
            rounded-md ${isIcon ? "p-2" : "px-4 py-2"} font-medium
            bg-background text-foreground border border-border
            hover:bg-primary/10 hover:shadow-lg hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary
            ${className} ${(child.props.className as string) ?? ""}`}
        />
      );
    }
    return (
      <button
        ref={ref}
        {...props}
        className={`relative overflow-hidden transition-all duration-300 group
          rounded-md ${isIcon ? "p-2" : "px-4 py-2"} font-medium
          bg-background text-foreground border border-border
          hover:bg-primary/10 hover:shadow-lg hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary
          ${className}`}
      >
        {children}
        <span className="absolute inset-0 bg-gradient-to-tr from-blue-400 via-transparent to-transparent opacity-0 group-hover:opacity-20 transition-opacity rounded-md pointer-events-none" />
      </button>
    );
  }
);

InteractiveButton.displayName = "InteractiveButton";

export default InteractiveButton;
