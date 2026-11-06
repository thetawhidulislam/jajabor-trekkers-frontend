import type { ComponentProps } from "react";

export function Label({ className = "", ...props }: ComponentProps<"label">) {
  return <label className={`ui-label ${className}`.trim()} {...props} />;
}
