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
const futureISO = (days) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
};

export default function Proposals() {
    const [loading, setLoading] = useState(false);

    const [data, setData] = useState({
        proposal_number: '01',
        proposal_date: todayISO(),
        valid_until: futureISO(30),

        client_name: '',
        client_business_number: '',
        client_address: '',

        project_title: '',
        executive_summary: '',
        problem_statement: '',
        proposed_approach: '',

        deliverables: [{ description: '' }],
        phases: [{ name: '', duration: '', deliverable: '' }],

        pricing_model: 'Fixed-bid',
        pricing_amount: 0,
        pricing_currency: 'EUR',
        pricing_notes: '',

        contact_name: 'Drinor Berisha',
        contact_email: 'hello@berixsystems.com',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setData((prev) => ({ ...prev, [name]: value }));
    };

    /* Deliverables */
    const addDeliverable = () =>
        setData((p) => ({ ...p, deliverables: [...p.deliverables, { description: '' }] }));
    const removeDeliverable = (i) =>
        setData((p) => ({ ...p, deliverables: p.deliverables.filter((_, idx) => idx !== i) }));
    const updateDeliverable = (i, value) =>
        setData((p) => {
            const next = [...p.deliverables];
            next[i] = { ...next[i], description: value };
            return { ...p, deliverables: next };
        });

    /* Phases */
    const addPhase = () =>
        setData((p) => ({ ...p, phases: [...p.phases, { name: '', duration: '', deliverable: '' }] }));
    const removePhase = (i) =>
        setData((p) => ({ ...p, phases: p.phases.filter((_, idx) => idx !== i) }));
    const updatePhase = (i, field, value) =>
        setData((p) => {
            const next = [...p.phases];
            next[i] = { ...next[i], [field]: value };
            return { ...p, phases: next };
        });

    const generate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await fetch(
                import.meta.env.VITE_API_URL + '/api/generate/proposal',
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
            a.download = `Proposal_${data.proposal_number}_${data.client_name || 'untitled'}.pdf`;
            a.click();
        } catch (err) {
            console.error('Error generating proposal', err);
            alert(
                'Error generating proposal. Make sure the backend microservice is deployed with a proposal LaTeX template (POST /api/generate/proposal).'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="pb-24">
            <PageHeader
                kicker="§ Composer"
                title="Proposal"
                caption={
                    <span className="flex flex-col items-end">
                        <span>№ {data.proposal_number || '—'}</span>
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
                            label="Proposal number"
                            name="proposal_number"
                            value={data.proposal_number}
                            onChange={handleChange}
                        />
                        <Field
                            label="Date"
                            type="date"
                            name="proposal_date"
                            value={data.proposal_date}
                            onChange={handleChange}
                        />
                        <Field
                            label="Valid until"
                            type="date"
                            name="valid_until"
                            value={data.valid_until}
                            onChange={handleChange}
                        />
                    </FieldGroup>

                    <FieldGroup title="§ Prepared for">
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
                    </FieldGroup>

                    <FieldGroup title="§ Pricing">
                        <FieldSelect
                            label="Engagement model"
                            name="pricing_model"
                            value={data.pricing_model}
                            onChange={handleChange}
                            options={['Fixed-bid', 'Time & Materials', 'Hybrid', 'Retainer']}
                        />
                        <div className="grid grid-cols-3 gap-3">
                            <div className="col-span-2">
                                <Field
                                    label="Amount"
                                    type="number"
                                    step="0.01"
                                    name="pricing_amount"
                                    value={data.pricing_amount}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <FieldSelect
                                    label="Currency"
                                    name="pricing_currency"
                                    value={data.pricing_currency}
                                    onChange={handleChange}
                                    options={['EUR', 'USD', 'SEK', 'GBP']}
                                />
                            </div>
                        </div>
                        <FieldArea
                            label="Pricing notes"
                            name="pricing_notes"
                            value={data.pricing_notes}
                            onChange={handleChange}
                            rows={3}
                            placeholder="e.g. Payable in 3 milestones of 33%, invoiced on completion of each phase."
                        />
                    </FieldGroup>

                    <FieldGroup title="§ Point of contact">
                        <Field
                            label="Name"
                            name="contact_name"
                            value={data.contact_name}
                            onChange={handleChange}
                        />
                        <Field
                            label="Email"
                            type="email"
                            name="contact_email"
                            value={data.contact_email}
                            onChange={handleChange}
                        />
                    </FieldGroup>
                </aside>

                {/* ── Right column ────────────────────────────────────────── */}
                <section className="lg:col-span-8 space-y-12">
                    <FieldGroup title="§ Project">
                        <Field
                            label="Project title"
                            name="project_title"
                            value={data.project_title}
                            onChange={handleChange}
                            placeholder="Real-time anomaly detection pipeline"
                        />
                        <FieldArea
                            label="Executive summary"
                            name="executive_summary"
                            value={data.executive_summary}
                            onChange={handleChange}
                            rows={3}
                            placeholder="Two or three sentences. What this is, who it's for, the headline outcome."
                        />
                        <FieldArea
                            label="Problem statement"
                            name="problem_statement"
                            value={data.problem_statement}
                            onChange={handleChange}
                            rows={4}
                            placeholder="Frame the problem in the client's terms — what's at stake, what's failing today."
                        />
                        <FieldArea
                            label="Proposed approach"
                            name="proposed_approach"
                            value={data.proposed_approach}
                            onChange={handleChange}
                            rows={5}
                            placeholder="Architecture, methodology, and the order in which the system comes together."
                        />
                    </FieldGroup>

                    {/* Deliverables */}
                    <RepeatableSimple
                        label="§ Deliverables"
                        items={data.deliverables}
                        placeholder="e.g. End-to-end ingestion pipeline with replay capability"
                        onAdd={addDeliverable}
                        onRemove={removeDeliverable}
                        onUpdate={updateDeliverable}
                        addLabel="Add deliverable"
                        countNoun="item"
                    />

                    {/* Phases */}
                    <div>
                        <div className="flex items-baseline justify-between mb-5">
                            <SubLabel>§ Timeline phases</SubLabel>
                            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-inkmute num-tabular">
                                {data.phases.length} {data.phases.length === 1 ? 'phase' : 'phases'}
                            </span>
                        </div>

                        <div className="hidden md:grid grid-cols-12 gap-3 px-1 pb-3 mb-3 border-b border-ink/15 font-mono text-[10px] uppercase tracking-[0.22em] text-inkmute">
                            <div className="col-span-1">#</div>
                            <div className="col-span-3">Phase name</div>
                            <div className="col-span-2">Duration</div>
                            <div className="col-span-5">Key deliverable</div>
                            <div className="col-span-1" aria-hidden></div>
                        </div>

                        <div className="space-y-3 md:space-y-2.5">
                            {data.phases.map((p, i) => (
                                <div
                                    key={i}
                                    className="border border-ink/15 md:border-0 p-3 md:p-0 md:grid md:grid-cols-12 md:gap-3 md:items-center bg-paperdeep/30 md:bg-transparent"
                                >
                                    <div className="md:hidden flex items-center justify-between mb-2.5">
                                        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-inkmute num-tabular">
                                            Phase {String(i + 1).padStart(2, '0')}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => removePhase(i)}
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
                                            Phase name
                                        </span>
                                        <input
                                            value={p.name}
                                            onChange={(e) => updatePhase(i, 'name', e.target.value)}
                                            placeholder="Discovery"
                                            className={inputBoxCls}
                                        />
                                    </div>

                                    <div className="md:col-span-2 mt-3 md:mt-0">
                                        <span className="md:hidden font-mono text-[10px] uppercase tracking-[0.22em] text-inkmute block mb-1.5">
                                            Duration
                                        </span>
                                        <input
                                            value={p.duration}
                                            onChange={(e) => updatePhase(i, 'duration', e.target.value)}
                                            placeholder="2 weeks"
                                            className={inputBoxCls}
                                        />
                                    </div>

                                    <div className="md:col-span-5 mt-3 md:mt-0">
                                        <span className="md:hidden font-mono text-[10px] uppercase tracking-[0.22em] text-inkmute block mb-1.5">
                                            Key deliverable
                                        </span>
                                        <input
                                            value={p.deliverable}
                                            onChange={(e) =>
                                                updatePhase(i, 'deliverable', e.target.value)
                                            }
                                            placeholder="Architecture write-up + risk register"
                                            className={inputBoxCls}
                                        />
                                    </div>

                                    <div className="hidden md:flex md:col-span-1 justify-end">
                                        <button
                                            type="button"
                                            onClick={() => removePhase(i)}
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
                            onClick={addPhase}
                            className="mt-5 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-ink/70 hover:text-ember transition-colors py-2"
                        >
                            <Plus className="w-3.5 h-3.5" strokeWidth={2} /> Add phase
                        </button>
                    </div>

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
