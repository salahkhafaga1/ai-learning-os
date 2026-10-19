"use client";

import {
  useEffect,
  useRef,
  type MouseEvent,
  type ReactNode,
} from "react";

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  actions?: ReactNode;
}

export function Dialog({ open, onClose, title, children, actions }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) {
      return;
    }
    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) {
      return;
    }
    const handleCancel = (event: Event) => {
      event.preventDefault();
      onClose();
    };
    dialog.addEventListener("cancel", handleCancel);
    return () => dialog.removeEventListener("cancel", handleCancel);
  }, [onClose]);

  const handleBackdropClick = (event: MouseEvent<HTMLDialogElement>) => {
    if (event.target === ref.current) {
      onClose();
    }
  };

  return (
    <dialog
      ref={ref}
      onClick={handleBackdropClick}
      className="m-auto w-[min(30rem,calc(100vw-2rem))] rounded-2xl border border-edge bg-surface p-0 text-ink backdrop:bg-black/50"
    >
      <div className="p-5">
        <h2 className="text-base font-semibold text-ink">{title}</h2>
        <div className="mt-3 text-sm text-ink-2">{children}</div>
        {actions ? (
          <div className="mt-5 flex flex-wrap justify-end gap-2">{actions}</div>
        ) : null}
      </div>
    </dialog>
  );
}
