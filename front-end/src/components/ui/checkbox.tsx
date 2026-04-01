import * as React from "react"

const Checkbox = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
    ({ className, ...props }, ref) => (
        <input
            type="checkbox"
            ref={ref}
            className={`h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-600 ${className}`}
            {...props}
        />
    )
)
Checkbox.displayName = "Checkbox"
export { Checkbox }