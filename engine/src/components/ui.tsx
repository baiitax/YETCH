import type { ReactNode } from 'react';
import { messageFor } from '@/lib/errors';

export function Notice({ kind = 'info', children }: { kind?: 'info' | 'success' | 'warning' | 'error'; children: ReactNode }) {
  return (
    <div className={`notice ${kind}`} role={kind === 'error' ? 'alert' : 'status'}>
      {children}
    </div>
  );
}

/** Shows a success message only when the server has confirmed the change (the page is rendered from ?notice=). */
export function ResultNotice({ notice, error }: { notice?: string; error?: string }) {
  if (error) return <Notice kind="error">{messageFor(error) ?? messageFor('failed')}</Notice>;
  if (notice) return <Notice kind="success">{notice}</Notice>;
  return null;
}

export function PageHead({ title, description, children }: { title: string; description?: string; children?: ReactNode }) {
  return (
    <div className="page-head">
      <div>
        <h1>{title}</h1>
        {description ? <p>{description}</p> : null}
      </div>
      {children ? <div className="actions">{children}</div> : null}
    </div>
  );
}

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="empty">
      <strong style={{ color: 'var(--ink)' }}>{title}</strong>
      {children ? <p style={{ marginTop: 6 }}>{children}</p> : null}
    </div>
  );
}

export function Stat({ label, value, hint }: { label: string; value: ReactNode; hint?: string }) {
  return (
    <div className="card stat">
      <div className="label">{label}</div>
      <div className="value">{value}</div>
      {hint ? <div className="hint">{hint}</div> : null}
    </div>
  );
}

export function Badge({ children, tone }: { children: ReactNode; tone?: 'ok' | 'bad' | 'warn' | 'muted' | 'won' | 'lost' }) {
  return <span className={`badge${tone ? ' ' + tone : ''}`}>{children}</span>;
}

export function Field({
  label,
  name,
  error,
  hint,
  children,
  wide,
}: {
  label: string;
  name: string;
  error?: string | undefined;
  hint?: string;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <div className={`field${wide ? ' wide' : ''}`}>
      <label htmlFor={name}>{label}</label>
      {children}
      {hint ? <span className="hint">{hint}</span> : null}
      {error ? <span className="field-error" id={`${name}-error`}>{error}</span> : null}
    </div>
  );
}
