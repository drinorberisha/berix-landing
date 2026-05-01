import React from 'react';
import { Plus, Trash2 } from 'lucide-react';

/* ── Shared input class names ─────────────────────────────────────────────── */
export const inputBoxCls =
    'w-full border border-ink/15 bg-paper px-3.5 py-2.5 text-[14px] text-ink placeholder:text-ink/30 focus:outline-none focus:border-ink focus:bg-paperdeep/40 transition-colors';

export const numCls =
    'w-full border border-ink/15 bg-paper px-3 py-2.5 text-[14px] text-ink num-tabular font-mono text-right focus:outline-none focus:border-ink transition-colors';

export const selectCls =
    'w-full border border-ink/15 bg-paper px-3.5 py-2.5 pr-9 text-[14px] text-ink focus:outline-none focus:border-ink focus:bg-paperdeep/40 transition-colors appearance-none cursor-pointer';

/* ── Page header (used across Dashboard / Invoices / Proposals / Contracts) */
export const PageHeader = ({ kicker, title, caption, right }) => (
    <header className="border-b border-ink/12 pb-8">
        {kicker && (
            <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-ember mb-4">
                {kicker}
            </div>
        )}
        <div className="flex items-end justify-between gap-6 flex-wrap">
            <h1 className="font-display text-[44px] md:text-[64px] leading-[0.95] tracking-tightest text-ink">
                {title}
            </h1>
            {right ? (
                <div>{right}</div>
            ) : caption ? (
                <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-inkmute pb-1">
                    {caption}
                </div>
            ) : null}
        </div>
    </header>
);

/* ── Sub-label / section heading ──────────────────────────────────────────── */
export const SubLabel = ({ children }) => (
    <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-ember mb-4">
        {children}
    </div>
);

export const FieldGroup = ({ title, children }) => (
    <div>
        <SubLabel>{title}</SubLabel>
        <div className="space-y-5">{children}</div>
    </div>
);

/* ── Field primitives ─────────────────────────────────────────────────────── */
export const Field = ({ label, name, value, onChange, type = 'text', placeholder, step }) => (
    <label className="block">
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-inkmute block mb-1.5">
            {label}
        </span>
        <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            step={step}
            className={inputBoxCls}
        />
    </label>
);

export const FieldArea = ({ label, name, value, onChange, rows = 3, placeholder }) => (
    <label className="block">
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-inkmute block mb-1.5">
            {label}
        </span>
        <textarea
            name={name}
            value={value}
            onChange={onChange}
            rows={rows}
            placeholder={placeholder}
            className={`${inputBoxCls} resize-none leading-relaxed`}
        />
    </label>
);

export const FieldSelect = ({ label, name, value, onChange, options }) => (
    <label className="block">
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-inkmute block mb-1.5">
            {label}
        </span>
        <div className="relative">
            <select
                name={name}
                value={value}
                onChange={onChange}
                className={selectCls}
            >
                {options.map((o) => {
                    const v = typeof o === 'string' ? o : o.value;
                    const l = typeof o === 'string' ? o : o.label;
                    return (
                        <option key={v} value={v}>
                            {l}
                        </option>
                    );
                })}
            </select>
            <svg
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-ink/55"
                viewBox="0 0 12 12"
                fill="none"
                aria-hidden
            >
                <path
                    d="M2 4.5L6 8.5L10 4.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        </div>
    </label>
);

/* ── RepeatableSimple ─ single-line description list (deliverables, criteria) */
export const RepeatableSimple = ({
    label,
    items,
    placeholder,
    onAdd,
    onRemove,
    onUpdate,
    addLabel = 'Add item',
    countNoun = 'item',
}) => {
    /* countNoun may be "item" or ["criterion", "criteria"] */
    const [singular, plural] = Array.isArray(countNoun)
        ? countNoun
        : [countNoun, `${countNoun}s`];
    const noun = items.length === 1 ? singular : plural;
    return (
        <div>
            <div className="flex items-baseline justify-between mb-5">
                <SubLabel>{label}</SubLabel>
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-inkmute num-tabular">
                    {items.length} {noun}
                </span>
            </div>
            <div className="space-y-2.5">
                {items.map((it, i) => (
                    <div key={i} className="flex items-stretch gap-2">
                        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-inkmute pt-3 w-8 num-tabular shrink-0">
                            {String(i + 1).padStart(2, '0')}
                        </span>
                        <input
                            value={it.description}
                            onChange={(e) => onUpdate(i, e.target.value)}
                            placeholder={placeholder}
                            className={`${inputBoxCls} flex-1`}
                        />
                        <button
                            type="button"
                            onClick={() => onRemove(i)}
                            aria-label="Remove"
                            className="text-ink/40 hover:text-ember transition-colors p-2 self-start"
                        >
                            <Trash2 className="w-3.5 h-3.5" strokeWidth={1.8} />
                        </button>
                    </div>
                ))}
            </div>
            <button
                type="button"
                onClick={onAdd}
                className="mt-5 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-ink/70 hover:text-ember transition-colors py-2"
            >
                <Plus className="w-3.5 h-3.5" strokeWidth={2} /> {addLabel}
            </button>
        </div>
    );
};

