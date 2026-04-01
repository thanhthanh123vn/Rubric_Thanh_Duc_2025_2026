import * as React from "react"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, ...props }, ref) => {
        return (
            <button
                className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:opacity-50 disabled:pointer-events-none bg-emerald-800 text-white hover:bg-emerald-900 h-11 px-8 w-full ${className}`}
                ref={ref}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"
export { Button }