import { useState } from 'react';
import { Plus, Trash2, ArrowRight, Download } from 'lucide-react';
import {
    PageHeader,
    SubLabel,
    FieldGroup,
    Field,
    FieldArea,
    FieldSelect,
    RepeatableSimple,
    inputBoxCls,
} from './AdminUI';

const todayISO = () => new Date().toISOString().split('T')[0];

export default function Contracts() {
    const [loading, setLoading] = useState(false);

    const [data, setData] = useState({
        sow_number: '01',
        effective_date: todayISO(),
        end_date: '',
        msa_reference: '',

        client_name: '',
        client_business_number: '',
        client_address: '',
        client_signatory_name: '',
        client_signatory_title: '',

        scope_summary: '',
        deliverables: [{ description: '' }],
        milestones: [{ date: '', description: '' }],
        acceptance_criteria: [{ description: '' }],

        fee_type: 'Fixed',
        fee_amount: 0,
        fee_currency: 'EUR',
        billing_cadence: 'Monthly',
        payment_terms_days: 14,

        governing_law: 'Sweden',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setData((prev) => ({ ...prev, [name]: value }));
    };

    /* Generic list helpers (deliverables, milestones, acceptance_criteria) */
    const addItem = (key, blank) =>
        setData((p) => ({ ...p, [key]: [...p[key], blank] }));
    const removeItem = (key, i) =>
        setData((p) => ({ ...p, [key]: p[key].filter((_, idx) => idx !== i) }));
    const updateItem = (key, i, field, value) =>
        setData((p) => {
            const next = [...p[key]];
            next[i] = { ...next[i], [field]: value };
            return { ...p, [key]: next };
        });

    const generate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await fetch(
                import.meta.env.VITE_API_URL + '/api/generate/contract',
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data),
                }
            );
            if (!response.ok) throw new Error('Generation failed');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `SOW_${data.sow_number}_${data.client_name || 'untitled'}.pdf`;
            a.click();
        } catch (err) {
            console.error('Error generating SOW', err);
            alert(
                'Error generating contract. Make sure the backend microservice is deployed with a contract LaTeX template (POST /api/generate/contract).'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="pb-24">
            <PageHeader
                kicker="§ Composer"
                title="Statement of Work"
                caption={
                    <span className="flex flex-col items-end">
                        <span>SOW № {data.sow_number || '—'}</span>
                        <span className="mt-1 text-ink/55 normal-case tracking-normal text-[11px] font-sans">
                            {data.client_name || 'Untitled client'}
                        </span>
                    </span>
                }
            />

            <form
                onSubmit={generate}
                className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14"
            >
                {/* ── Left column ─────────────────────────────────────────── */}
                <aside className="lg:col-span-4 space-y-12">
                    <FieldGroup title="§ Document">
                        <Field
                            label="SOW number"
                            name="sow_number"
                            value={data.sow_number}
                            onChange={handleChange}
                        />
                        <Field
                            label="Effective date"
                            type="date"
                            name="effective_date"
                            value={data.effective_date}
                            onChange={handleChange}
                        />
                        <Field
                            label="End date (optional)"
                            type="date"
                            name="end_date"
                            value={data.end_date}
                            onChange={handleChange}
                        />
                        <Field
                            label="MSA reference (optional)"
                            name="msa_reference"
                            value={data.msa_reference}
                            onChange={handleChange}
                            placeholder="MSA-2025-001"
                        />
                    </FieldGroup>

                    <FieldGroup title="§ Client">
                        <Field
                            label="Client name"
                            name="client_name"
                            value={data.client_name}
                            onChange={handleChange}
                            placeholder="Acme AB"
                        />
                        <Field
                            label="Business number"
                            name="client_business_number"
                            value={data.client_business_number}
                            onChange={handleChange}
                        />
                        <FieldArea
                            label="Address (use \n for line break)"
                            name="client_address"
                            value={data.client_address}
                            onChange={handleChange}
                            rows={3}
                        />
                        <Field
                            label="Signatory name"
                            name="client_signatory_name"
                            value={data.client_signatory_name}
                            onChange={handleChange}
                            placeholder="Jane Doe"
                        />
                        <Field
                            label="Signatory title"
                            name="client_signatory_title"
                            value={data.client_signatory_title}
                            onChange={handleChange}
                            placeholder="Chief Technology Officer"
                        />
                    </FieldGroup>

                    <FieldGroup title="§ Fees & terms">
                        <FieldSelect
                            label="Fee type"
                            name="fee_type"
                            value={data.fee_type}
                            onChange={handleChange}
                            options={['Fixed', 'Hourly', 'Retainer']}
                        />
                        <div className="grid grid-cols-3 gap-3">
                            <div className="col-span-2">
                                <Field
                                    label="Amount"
                                    type="number"
                                    step="0.01"
                                    name="fee_amount"
                                    value={data.fee_amount}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <FieldSelect
                                    label="Currency"
                                    name="fee_currency"
                                    value={data.fee_currency}
                                    onChange={handleChange}
                                    options={['EUR', 'USD', 'SEK', 'GBP']}
                                />
                            </div>
                        </div>
                        <FieldSelect
                            label="Billing cadence"
                            name="billing_cadence"
                            value={data.billing_cadence}
                            onChange={handleChange}
                            options={['Monthly', 'On milestone', 'Upfront', 'Net on completion']}
                        />
                        <Field
                            label="Payment terms (net days)"
                            type="number"
                            name="payment_terms_days"
                            value={data.payment_terms_days}
                            onChange={handleChange}
                        />
                        <Field
                            label="Governing law"
                            name="governing_law"
                            value={data.governing_law}
                            onChange={handleChange}
                            placeholder="Sweden"
                        />
                    </FieldGroup>
                </aside>

                {/* ── Right column ────────────────────────────────────────── */}
                <section className="lg:col-span-8 space-y-12">
                    <FieldGroup title="§ Scope">
                        <FieldArea
                            label="Scope summary"
                            name="scope_summary"
                            value={data.scope_summary}
                            onChange={handleChange}
                            rows={5}
                            placeholder="One paragraph summarising what is in scope and what is explicitly out of scope."
                        />
                    </FieldGroup>

                    {/* Deliverables */}
                    <RepeatableSimple
                        label="§ Deliverables"
                        items={data.deliverables}
                        placeholder="e.g. Production deployment of streaming pipeline"
                        onAdd={() => addItem('deliverables', { description: '' })}
                        onRemove={(i) => removeItem('deliverables', i)}
                        onUpdate={(i, value) => updateItem('deliverables', i, 'description', value)}
                        addLabel="Add deliverable"
                        countNoun="item"
                    />

                    {/* Milestones */}
                    <div>
                        <div className="flex items-baseline justify-between mb-5">
                            <SubLabel>§ Milestones</SubLabel>
                            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-inkmute num-tabular">
                                {data.milestones.length}{' '}
                                {data.milestones.length === 1 ? 'milestone' : 'milestones'}
                            </span>
                        </div>

                        <div className="hidden md:grid grid-cols-12 gap-3 px-1 pb-3 mb-3 border-b border-ink/15 font-mono text-[10px] uppercase tracking-[0.22em] text-inkmute">
                            <div className="col-span-1">#</div>
                            <div className="col-span-3">Date</div>
                            <div className="col-span-7">Description</div>
                            <div className="col-span-1" aria-hidden></div>
                        </div>

                        <div className="space-y-3 md:space-y-2.5">
                            {data.milestones.map((m, i) => (
                                <div
                                    key={i}
                                    className="border border-ink/15 md:border-0 p-3 md:p-0 md:grid md:grid-cols-12 md:gap-3 md:items-center bg-paperdeep/30 md:bg-transparent"
                                >
                                    <div className="md:hidden flex items-center justify-between mb-2.5">
                                        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-inkmute num-tabular">
                                            Milestone {String(i + 1).padStart(2, '0')}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => removeItem('milestones', i)}
                                            aria-label="Remove"
                                            className="text-ink/40 hover:text-ember transition-colors p-1 -mr-1"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" strokeWidth={1.8} />
                                        </button>
                                    </div>

                                    <div className="hidden md:block md:col-span-1">
                                        <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-inkmute num-tabular">
                                            {String(i + 1).padStart(2, '0')}
                                        </span>
                                    </div>

                                    <div className="md:col-span-3">
                                        <span className="md:hidden font-mono text-[10px] uppercase tracking-[0.22em] text-inkmute block mb-1.5">
                                            Date
                                        </span>
                                        <input
                                            type="date"
                                            value={m.date}
                                            onChange={(e) =>
                                                updateItem('milestones', i, 'date', e.target.value)
                                            }
                                            className={inputBoxCls}
                                        />
                                    </div>

                                    <div className="md:col-span-7 mt-3 md:mt-0">
                                        <span className="md:hidden font-mono text-[10px] uppercase tracking-[0.22em] text-inkmute block mb-1.5">
                                            Description
                                        </span>
                                        <input
                                            value={m.description}
                                            onChange={(e) =>
                                                updateItem(
                                                    'milestones',
                                                    i,
                                                    'description',
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Phase 1 hand-off — staging deployment"
                                            className={inputBoxCls}
                                        />
                                    </div>

                                    <div className="hidden md:flex md:col-span-1 justify-end">
                                        <button
                                            type="button"
                                            onClick={() => removeItem('milestones', i)}
                                            aria-label="Remove"
                                            className="text-ink/40 hover:text-ember transition-colors p-2"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" strokeWidth={1.8} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button
                            type="button"
                            onClick={() =>
                                addItem('milestones', { date: '', description: '' })
                            }
                            className="mt-5 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-ink/70 hover:text-ember transition-colors py-2"
                        >
                            <Plus className="w-3.5 h-3.5" strokeWidth={2} /> Add milestone
                        </button>
                    </div>

                    {/* Acceptance criteria */}
                    <RepeatableSimple
                        label="§ Acceptance criteria"
                        items={data.acceptance_criteria}
                        placeholder="e.g. p99 latency < 50 ms under sustained 10k req/s"
                        onAdd={() => addItem('acceptance_criteria', { description: '' })}
                        onRemove={(i) => removeItem('acceptance_criteria', i)}
                        onUpdate={(i, value) =>
                            updateItem('acceptance_criteria', i, 'description', value)
                        }
                        addLabel="Add criterion"
                        countNoun={['criterion', 'criteria']}
                    />

                    {/* Submit */}
                    <div className="border-t border-ink/15 pt-7 flex flex-col md:flex-row md:items-center md:justify-end gap-4">
                        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-inkmute md:mr-auto">
                            Compiled server-side via LaTeX · streamed as PDF
                        </p>
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-ink text-paper px-8 py-4 font-mono text-[12px] uppercase tracking-[0.22em] hover:bg-ember transition-colors disabled:opacity-50 disabled:cursor-wait flex items-center gap-3 group"
                        >
                            {loading ? (
                                <>Compiling LaTeX…</>
                            ) : (
                                <>
                                    <Download className="w-3.5 h-3.5" strokeWidth={2} />
                                    Compile & download PDF
                                    <ArrowRight
                                        className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5"
                                        strokeWidth={2}
                                    />
                                </>
                            )}
                        </button>
                    </div>
                </section>
            </form>
        </div>
    );
}
