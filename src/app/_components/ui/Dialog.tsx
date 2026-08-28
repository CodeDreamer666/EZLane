import type { MouseEvent, ReactNode } from "react";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  actions?: ReactNode;
}

export default function Dialog({
  open,
  onClose,
  title,
  children,
  actions,
}: DialogProps) {
  if (!open) return null;
  const stop = (e: MouseEvent) => e.stopPropagation();
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-neutral-900/50 p-4"
      onClick={onClose}
    >
      <div
        className="border-divider bg-surface flex w-[min(440px,100%)] flex-col gap-3 rounded-lg border p-4 shadow-lg max-sm:max-h-[88vh] max-sm:w-[calc(100vw-26px)] max-sm:overflow-y-auto"
        onClick={stop}
      >
        <div className="font-heading text-xl font-semibold">{title}</div>
        <div className="text-sm opacity-85">{children}</div>
        {actions ? (
          <div className="mt-2 flex justify-end gap-2">{actions}</div>
        ) : null}
      </div>
    </div>
  );
}
