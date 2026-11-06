import type { ComponentProps } from "react";

type ButtonProps = ComponentProps<"button"> & {
  variant?: "default" | "primary" | "outline" | "ghost";
  size?: "default" | "sm";
};

export function Button({
  className = "",
  variant = "default",
  size = "default",
  ...props
}: ButtonProps) {
  return (
    <button
      className={`ui-button ui-button-${variant} ui-button-${size} ${className}`.trim()}
      {...props}
    />
  );
}
