import { useState } from 'react';
import { Plus, Trash2, ArrowRight, Download } from 'lucide-react';
import {
    PageHeader,
    SubLabel,
    FieldGroup,
    Field,
    FieldArea,
    inputBoxCls,
    numCls,
} from './AdminUI';

/* ── Page ─────────────────────────────────────────────────────────────────── */
export default function Invoices() {
    const defaultDate = new Date().toISOString().split('T')[0];
    const [loading, setLoading] = useState(false);

    const [invoiceData, setInvoiceData] = useState({
        invoice_number: '6',
        invoice_date: defaultDate,
        billing_period: '01.01.2026 - 31.01.2026',
        client_name: 'Tekkli AB',
        client_business_number: '559381-4881',
        client_address: 'Redaregatan 48\\n25236 Helsingborg, Sweden',
        items: [
            { description: 'IT Consultancy Services', hours: 160, rate: 15, amount: 2400 }
        ],
        vat_amount: 0,
        total_amount: 2400,
    });

    const addItem = () => {
        setInvoiceData(prev => ({
            ...prev,
            items: [...prev.items, { description: '', hours: 0, rate: 0, amount: 0 }],
        }));
    };

    const removeItem = (index) => {
        setInvoiceData(prev => {
            const newItems = prev.items.filter((_, i) => i !== index);
            const newTotal =
                newItems.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0) +
                parseFloat(prev.vat_amount || 0);
            return { ...prev, items: newItems, total_amount: newTotal };
        });
    };

    const updateItem = (index, field, value) => {
        setInvoiceData(prev => {
            const newItems = [...prev.items];
            newItems[index][field] = value;

            if (field === 'hours' || field === 'rate') {
                const h = parseFloat(newItems[index].hours) || 0;
                const r = parseFloat(newItems[index].rate) || 0;
                if (h > 0 && r > 0) {
                    newItems[index].amount = h * r;
                }
            }

            const newTotal =
                newItems.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0) +
                parseFloat(prev.vat_amount || 0);

            return { ...prev, items: newItems, total_amount: newTotal };
        });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setInvoiceData(prev => {
            const nextState = { ...prev, [name]: value };
            if (name === 'vat_amount') {
                const itemsTotal = nextState.items.reduce(
                    (sum, item) => sum + (parseFloat(item.amount) || 0),
                    0
                );
                nextState.total_amount = itemsTotal + (parseFloat(value) || 0);
            }
            return nextState;
        });
    };

    const subtotal = invoiceData.items.reduce(
        (sum, item) => sum + (parseFloat(item.amount) || 0),
        0
    );

    const generateInvoice = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await fetch(
                import.meta.env.VITE_API_URL + '/api/generate/invoice',
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(invoiceData),
                }
            );

            if (!response.ok) throw new Error('Generation failed');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Invoice_${invoiceData.invoice_number}_${invoiceData.client_name}.pdf`;
            a.click();
        } catch (error) {
            console.error('Error generating invoice', error);
            alert('Error generating invoice. Follow the task to deploy the backend microservice first!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="pb-24">
            <PageHeader
                kicker="§ Composer"
                title="Invoice"
                caption={
                    <span className="flex flex-col items-end">
                        <span>№ {invoiceData.invoice_number || '—'}</span>
                        <span className="mt-1 text-ink/55 normal-case tracking-normal text-[11px] font-sans">
                            {invoiceData.client_name || 'Untitled client'}
                        </span>
                    </span>
                }
            />

            <form
                onSubmit={generateInvoice}
                className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14"
            >
                {/* ── Left column: metadata + bill to ─────────────────────────── */}
                <aside className="lg:col-span-4 space-y-12">
                    <FieldGroup title="§ Document">
                        <Field
                            label="Invoice number"
                            name="invoice_number"
                            value={invoiceData.invoice_number}
                            onChange={handleChange}
                        />
                        <Field
                            label="Date"
                            type="date"
                            name="invoice_date"
                            value={invoiceData.invoice_date}
                            onChange={handleChange}
                        />
                        <Field
                            label="Billing period"
                            name="billing_period"
                            value={invoiceData.billing_period}
                            onChange={handleChange}
                        />
                    </FieldGroup>

                    <FieldGroup title="§ Bill to">
                        <Field
                            label="Client name"
                            name="client_name"
                            value={invoiceData.client_name}
                            onChange={handleChange}
                        />
                        <Field
                            label="Business number"
                            name="client_business_number"
                            value={invoiceData.client_business_number}
                            onChange={handleChange}
                        />
                        <FieldArea
                            label="Address (use \n for line break)"
                            name="client_address"
                            value={invoiceData.client_address}
                            onChange={handleChange}
                            rows={3}
                        />
                    </FieldGroup>
                </aside>

                {/* ── Right column: line items + totals ───────────────────────── */}
                <section className="lg:col-span-8 space-y-10">
                    <div>
                        <div className="flex items-baseline justify-between mb-5">
                            <SubLabel>§ Line items</SubLabel>
                            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-inkmute num-tabular">
                                {invoiceData.items.length} {invoiceData.items.length === 1 ? 'row' : 'rows'}
                            </span>
                        </div>

                        {/* Header row — desktop only */}
                        <div className="hidden md:grid grid-cols-12 gap-3 px-1 pb-3 mb-3 border-b border-ink/15 font-mono text-[10px] uppercase tracking-[0.22em] text-inkmute">
                            <div className="col-span-5">Description</div>
                            <div className="col-span-2 text-right">Hours</div>
                            <div className="col-span-2 text-right">Rate (€)</div>
                            <div className="col-span-2 text-right">Amount (€)</div>
                            <div className="col-span-1" aria-hidden></div>
                        </div>

                        <div className="space-y-3 md:space-y-2.5">
                            {invoiceData.items.map((item, index) => (
                                <div
                                    key={index}
                                    className="border border-ink/15 md:border-0 p-3 md:p-0 md:grid md:grid-cols-12 md:gap-3 md:items-center bg-paperdeep/30 md:bg-transparent"
                                >
                                    {/* Mobile-only row index */}
                                    <div className="md:hidden flex items-center justify-between mb-2.5">
                                        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-inkmute num-tabular">
                                            Line {String(index + 1).padStart(2, '0')}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => removeItem(index)}
                                            aria-label="Remove row"
                                            className="text-ink/40 hover:text-ember transition-colors p-1 -mr-1"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" strokeWidth={1.8} />
                                        </button>
                                    </div>

                                    {/* Description */}
                                    <div className="md:col-span-5">
                                        <span className="md:hidden font-mono text-[10px] uppercase tracking-[0.22em] text-inkmute block mb-1.5">
                                            Description
                                        </span>
                                        <input
                                            value={item.description}
                                            onChange={(e) => updateItem(index, 'description', e.target.value)}
                                            className={inputBoxCls}
                                            placeholder="Service description"
                                        />
                                    </div>

                                    {/* Numeric trio — 3-up grid on mobile */}
                                    <div className="grid grid-cols-3 gap-2 mt-3 md:mt-0 md:contents">
                                        <div className="md:col-span-2">
                                            <span className="md:hidden font-mono text-[10px] uppercase tracking-[0.22em] text-inkmute block mb-1.5">
                                                Hours
                                            </span>
                                            <input
                                                type="number"
                                                step="0.1"
                                                inputMode="decimal"
                                                value={item.hours}
                                                onChange={(e) => updateItem(index, 'hours', e.target.value)}
                                                className={numCls}
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <span className="md:hidden font-mono text-[10px] uppercase tracking-[0.22em] text-inkmute block mb-1.5">
                                                Rate (€)
                                            </span>
                                            <input
                                                type="number"
                                                step="0.1"
                                                inputMode="decimal"
                                                value={item.rate}
                                                onChange={(e) => updateItem(index, 'rate', e.target.value)}
                                                className={numCls}
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <span className="md:hidden font-mono text-[10px] uppercase tracking-[0.22em] text-inkmute block mb-1.5">
                                                Amount (€)
                                            </span>
                                            <input
                                                type="number"
                                                step="0.1"
                                                inputMode="decimal"
                                                value={item.amount}
                                                onChange={(e) => updateItem(index, 'amount', e.target.value)}
                                                className={numCls}
                                            />
                                        </div>
                                    </div>

                                    {/* Trash — desktop only (mobile has it in the index row) */}
                                    <div className="hidden md:flex md:col-span-1 justify-end">
                                        <button
                                            type="button"
                                            onClick={() => removeItem(index)}
                                            aria-label="Remove row"
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
                            onClick={addItem}
                            className="mt-5 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-ink/70 hover:text-ember transition-colors py-2"
                        >
                            <Plus className="w-3.5 h-3.5" strokeWidth={2} /> Add line
                        </button>
                    </div>

                    {/* Totals ledger */}
                    <div className="border-t border-ink/15 pt-7 flex justify-end">
                        <div className="w-full max-w-md space-y-3.5">
                            <div className="flex items-baseline justify-between">
                                <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-inkmute">
                                    Subtotal
                                </span>
                                <span className="font-mono text-[14px] text-ink num-tabular">
                                    €{subtotal.toFixed(2)}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-inkmute">
                                    VAT (€)
                                </span>
                                <input
                                    type="number"
                                    name="vat_amount"
                                    value={invoiceData.vat_amount}
                                    onChange={handleChange}
                                    className="w-32 border-b border-ink/25 bg-transparent py-1.5 text-right text-[14px] num-tabular font-mono focus:outline-none focus:border-ink transition-colors"
                                />
                            </div>
                            <div className="flex items-baseline justify-between border-t-2 border-ink pt-4 mt-3">
                                <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink">
                                    Total due
                                </span>
                                <span className="font-display text-[40px] md:text-[44px] leading-none tracking-tightest text-ember num-tabular">
                                    €{invoiceData.total_amount.toFixed(2)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Submit */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-end gap-4">
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
