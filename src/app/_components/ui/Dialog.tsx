import type { MouseEvent, ReactNode } from "react";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  actions?: ReactNode;
}

export function Dialog({ open, onClose, title, children, actions }: DialogProps) {
  if (!open) return null;
  const stop = (e: MouseEvent) => e.stopPropagation();
  return (
    <div className="dialog-backdrop" onClick={onClose}>
      <div className="dialog" onClick={stop}>
        <div className="dialog-title">{title}</div>
        <div className="dialog-body">{children}</div>
        {actions ? <div className="dialog-actions">{actions}</div> : null}
      </div>
    </div>
  );
}
