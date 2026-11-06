import type { ComponentProps } from "react";

export function Card({ className = "", ...props }: ComponentProps<"section">) {
  return <section className={`ui-card ${className}`.trim()} {...props} />;
}

export function CardHeader({ className = "", ...props }: ComponentProps<"div">) {
  return <div className={`ui-card-header ${className}`.trim()} {...props} />;
}

export function CardTitle({ className = "", ...props }: ComponentProps<"h2">) {
  return <h2 className={`ui-card-title ${className}`.trim()} {...props} />;
}

export function CardDescription({ className = "", ...props }: ComponentProps<"p">) {
  return <p className={`ui-card-description ${className}`.trim()} {...props} />;
}

export function CardContent({ className = "", ...props }: ComponentProps<"div">) {
  return <div className={`ui-card-content ${className}`.trim()} {...props} />;
}

export function CardFooter({ className = "", ...props }: ComponentProps<"div">) {
  return <div className={`ui-card-footer ${className}`.trim()} {...props} />;
}
