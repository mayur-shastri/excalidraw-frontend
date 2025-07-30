import React, { useEffect, useRef, useState, createContext, useContext } from "react";
import { createPortal } from "react-dom";

type DialogContextValue = {
  onOpenChange?: (open: boolean) => void;
  setTitleId: (id: string) => void;
  titleId?: string;
};

const DialogContext = createContext<DialogContextValue>({
  setTitleId: () => { },
});

function useDialogCtx() {
  return useContext(DialogContext);
}

type DialogProps = {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
};

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  const [mounted, setMounted] = useState(false);
  const [titleId, setTitleId] = useState<string | undefined>(undefined);

  // Portal mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // ESC to close
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onOpenChange?.(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onOpenChange]);

  // Scroll lock
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open || !mounted) return null;

  return createPortal(
    <DialogContext.Provider value={{ onOpenChange, setTitleId, titleId }}>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-[1px]"
        onClick={() => onOpenChange?.(false)}
        aria-hidden="true"
      />
      {/* Container (centers content) */}
      <div
        className="fixed inset-0 z-[101] flex items-center justify-center p-4"
        // Prevent overlay click from closing when clicking inside content
        onMouseDown={(e) => {
          // If click starts on container (not content), allow it to pass to overlay
          // We prevent closing when the click starts inside content.
          const target = e.target as HTMLElement;
          if (target.closest("[data-dialog-content]")) {
            e.stopPropagation();
          }
        }}
      >
        {children}
      </div>
    </DialogContext.Provider>,
    document.body
  );
}

type DialogContentProps = {
  className?: string;
  children: React.ReactNode;
};

export function DialogContent({ className, children }: DialogContentProps) {
  const { titleId } = useDialogCtx();
  const contentRef = useRef<HTMLDivElement | null>(null);

  // Width presets (optional): keep if you want responsive caps
  const sizeClasses = "max-w-4xl md:max-w-5xl"; // change to taste

  useEffect(() => {
    contentRef.current?.focus();
  }, []);

  return (
    <div
      data-dialog-content
      ref={contentRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      tabIndex={-1}
      className={[
        // Layout & box
        "w-full bg-white rounded-2xl shadow-lg ring-1 ring-black/5 outline-none",
        // Animate
        "animate-[dialog-fade-in_120ms_ease-out]",
        // Full-height growth inside the padded container (container has p-4 = 1rem)
        "flex flex-col overflow-hidden",
        "h-[calc(100svh-2rem)] max-h-[calc(100svh-2rem)]",
        // On larger screens you may want a little breathing room
        "sm:max-h-[90svh]",
        // Width caps
        sizeClasses,
        className || "",
      ].join(" ")}
      onClick={(e) => e.stopPropagation()}
    >
      {children}

      <style>{`
        @keyframes dialog-fade-in {
          from { opacity: 0; transform: translateY(8px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}

type DialogHeaderProps = {
  className?: string;
  children: React.ReactNode;
};
export function DialogHeader({ className, children }: DialogHeaderProps) {
  return (
    <div className={["px-5 pt-5", className || ""].join(" ")}>
      {children}
    </div>
  );
}

type DialogTitleProps = {
  className?: string;
  children: React.ReactNode;
};
export function DialogTitle({ className, children }: DialogTitleProps) {
  const { setTitleId } = useDialogCtx();
  const titleRef = useRef<HTMLHeadingElement | null>(null);

  useEffect(() => {
    const id = titleRef.current?.id || `dialog-title-${Math.random().toString(36).slice(2)}`;
    if (titleRef.current && !titleRef.current.id) {
      titleRef.current.id = id;
    }
    setTitleId(titleRef.current?.id || undefined);
  }, [setTitleId]);

  return (
    <h3
      ref={titleRef}
      className={["text-lg font-semibold leading-6 text-gray-900", className || ""].join(" ")}
    >
      {children}
    </h3>
  );
}

type DialogFooterProps = {
  className?: string;
  children: React.ReactNode;
};
export function DialogFooter({ className, children }: DialogFooterProps) {
  return (
    <div className={["px-5 pb-5 pt-4 flex items-center justify-end gap-2", className || ""].join(" ")}>
      {children}
    </div>
  );
}
