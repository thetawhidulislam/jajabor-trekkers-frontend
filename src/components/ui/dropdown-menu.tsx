"use client";

import { useEffect, useRef, type ReactNode } from "react";

type DropdownTriggerProps = {
  type: "button";
  "aria-haspopup": "menu";
  "aria-expanded": boolean;
  onClick: () => void;
};

type DropdownMenuProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger: (props: DropdownTriggerProps) => ReactNode;
  children: ReactNode;
  className?: string;
};

export function DropdownMenu({
  open,
  onOpenChange,
  trigger,
  children,
  className = "",
}: DropdownMenuProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function closeOutside(event: PointerEvent) {
      if (event.target instanceof Node && !rootRef.current?.contains(event.target)) {
        onOpenChange(false);
      }
    }
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") onOpenChange(false);
    }
    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open, onOpenChange]);

  return (
    <div ref={rootRef} className={`ui-dropdown-menu ${className}`.trim()} data-state={open ? "open" : "closed"}>
      {trigger({
        type: "button",
        "aria-haspopup": "menu",
        "aria-expanded": open,
        onClick: () => onOpenChange(!open),
      })}
      {open && children}
    </div>
  );
}
