import { cn } from "cn"
import { RiLoaderLine } from "@remixicon/react"

function Spinner({ className, children: _children, ...props }: React.ComponentProps<"svg">) {
  return (
    <RiLoaderLine data-slot="spinner" role="status" aria-label="Loading" className={cn("size-4 animate-spin", className)} {...(props as object)} />
  )
}

export { Spinner }
