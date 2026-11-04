import type { ReactNode } from "react";

/** Native details preserves keyboard activation and expanded state without JS. */
export function Disclosure({ title, description, meta, children, className = "" }: {
  title: ReactNode;
  description?: string;
  meta?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <details className={`disclosure ${className}`}>
      <summary className="disclosure-summary">
        <span className="disclosure-summary-main">
          <span className="disclosure-title">{title}</span>
          {description && <span className="disclosure-description">{description}</span>}
        </span>
        {meta && <span className="disclosure-meta">{meta}</span>}
        <span className="disclosure-chevron" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
        </span>
      </summary>
      <div className="disclosure-body">{children}</div>
    </details>
  );
}
