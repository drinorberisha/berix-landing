import { useState } from 'react';
import { FileText, Plus, Trash2, DownloadCloud, Target } from 'lucide-react';

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
        total_amount: 0
    });

    const addItem = () => {
        setInvoiceData(prev => ({
            ...prev,
            items: [...prev.items, { description: '', hours: 0, rate: 0, amount: 0 }]
        }));
    };

    const removeItem = (index) => {
        setInvoiceData(prev => {
            const newItems = prev.items.filter((_, i) => i !== index);
            const newTotal = newItems.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0) + parseFloat(prev.vat_amount || 0);
            return { ...prev, items: newItems, total_amount: newTotal };
        });
    };

    const updateItem = (index, field, value) => {
        setInvoiceData(prev => {
            const newItems = [...prev.items];
            newItems[index][field] = value;

            // Auto calculate amount if hours and rate are provided
            if (field === 'hours' || field === 'rate') {
                const h = parseFloat(newItems[index].hours) || 0;
                const r = parseFloat(newItems[index].rate) || 0;
                if (h > 0 && r > 0) {
                    newItems[index].amount = h * r;
                }
            }

            const newTotal = newItems.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0) + parseFloat(prev.vat_amount || 0);

            return { ...prev, items: newItems, total_amount: newTotal };
        });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setInvoiceData(prev => {
            const nextState = { ...prev, [name]: value };
            if (name === 'vat_amount') {
                const itemsTotal = nextState.items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
                nextState.total_amount = itemsTotal + (parseFloat(value) || 0);
            }
            return nextState;
        });
    };

    const generateInvoice = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // This will call the Cloud Run Microservice
            const response = await fetch(import.meta.env.VITE_API_URL + '/api/generate/invoice', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(invoiceData)
            });

            if (!response.ok) throw new Error('Generation failed');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Invoice_${invoiceData.invoice_number}_${invoiceData.client_name}.pdf`;
            a.click();
        } catch (error) {
            console.error("Error generating invoice", error);
            alert("Error generating invoice. Follow the task to deploy the backend microservice first!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 animate-fade-in pb-20">
            <header className="flex justify-between items-end mb-12 border-b border-cyan-900/30 pb-6">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-widest uppercase flex items-center gap-3">
                        <FileText className="w-6 h-6 text-cyan-500" /> Generate Invoice
                    </h1>
                    <p className="text-cyan-600 text-[10px] uppercase tracking-widest mt-2">Inject parameters to compile LaTeX structural output</p>
                </div>
            </header>

            <form onSubmit={generateInvoice} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Client Data */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-black/60 border border-cyan-900/50 p-6 relative">
                        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-cyan-500/50"></div>
                        <h3 className="text-amber-400 text-xs font-bold tracking-widest uppercase mb-6 flex items-center gap-2">
                            <Target className="w-3 h-3" /> Metadata
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-cyan-500 text-[9px] tracking-widest uppercase mb-1">Invoice Number</label>
                                <input name="invoice_number" value={invoiceData.invoice_number} onChange={handleChange} className="w-full bg-cyan-950/20 border border-cyan-900/50 p-2 text-cyan-50 text-xs focus:outline-none focus:border-cyan-400" />
                            </div>
                            <div>
                                <label className="block text-cyan-500 text-[9px] tracking-widest uppercase mb-1">Date</label>
                                <input name="invoice_date" value={invoiceData.invoice_date} onChange={handleChange} className="w-full bg-cyan-950/20 border border-cyan-900/50 p-2 text-cyan-50 text-xs focus:outline-none focus:border-cyan-400" />
                            </div>
                            <div>
                                <label className="block text-cyan-500 text-[9px] tracking-widest uppercase mb-1">Billing Period</label>
                                <input name="billing_period" value={invoiceData.billing_period} onChange={handleChange} className="w-full bg-cyan-950/20 border border-cyan-900/50 p-2 text-cyan-50 text-xs focus:outline-none focus:border-cyan-400" />
                            </div>

                            <hr className="border-cyan-900/30 py-2" />

                            <div>
                                <label className="block text-cyan-500 text-[9px] tracking-widest uppercase mb-1">Client Name</label>
                                <input name="client_name" value={invoiceData.client_name} onChange={handleChange} className="w-full bg-cyan-950/20 border border-cyan-900/50 p-2 text-cyan-50 text-xs focus:outline-none focus:border-cyan-400" />
                            </div>
                            <div>
                                <label className="block text-cyan-500 text-[9px] tracking-widest uppercase mb-1">Client Business Number</label>
                                <input name="client_business_number" value={invoiceData.client_business_number} onChange={handleChange} className="w-full bg-cyan-950/20 border border-cyan-900/50 p-2 text-cyan-50 text-xs focus:outline-none focus:border-cyan-400" />
                            </div>
                            <div>
                                <label className="block text-cyan-500 text-[9px] tracking-widest uppercase mb-1">Address Lines (\\n for break)</label>
                                <textarea name="client_address" value={invoiceData.client_address} onChange={handleChange} rows="3" className="w-full bg-cyan-950/20 border border-cyan-900/50 p-2 text-cyan-50 text-xs focus:outline-none focus:border-cyan-400" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Line Items */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-black/60 border border-cyan-900/50 p-6 relative">
                        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-cyan-500/50"></div>
                        <h3 className="text-amber-400 text-xs font-bold tracking-widest uppercase mb-6 flex items-center gap-2">
                            <Target className="w-3 h-3" /> Service Telemetry Array
                        </h3>

                        <div className="space-y-3">
                            {/* Headers */}
                            <div className="grid grid-cols-12 gap-2 text-cyan-600 text-[9px] uppercase tracking-widest mb-2 px-2">
                                <div className="col-span-5">Description</div>
                                <div className="col-span-2">Hours</div>
                                <div className="col-span-2">Rate (€)</div>
                                <div className="col-span-2">Amount (€)</div>
                                <div className="col-span-1 border"></div>
                            </div>

                            {invoiceData.items.map((item, index) => (
                                <div key={index} className="grid grid-cols-12 gap-2 items-center">
                                    <div className="col-span-5">
                                        <input value={item.description} onChange={(e) => updateItem(index, 'description', e.target.value)} className="w-full bg-cyan-950/20 border border-cyan-900/50 p-2 text-cyan-50 text-xs focus:outline-none focus:border-cyan-400" placeholder="Service Desc" />
                                    </div>
                                    <div className="col-span-2">
                                        <input type="number" step="0.1" value={item.hours} onChange={(e) => updateItem(index, 'hours', e.target.value)} className="w-full bg-cyan-950/20 border border-cyan-900/50 p-2 text-cyan-50 text-xs focus:outline-none focus:border-cyan-400" />
                                    </div>
                                    <div className="col-span-2">
                                        <input type="number" step="0.1" value={item.rate} onChange={(e) => updateItem(index, 'rate', e.target.value)} className="w-full bg-cyan-950/20 border border-cyan-900/50 p-2 text-cyan-50 text-xs focus:outline-none focus:border-cyan-400" />
                                    </div>
                                    <div className="col-span-2">
                                        <input type="number" step="0.1" value={item.amount} onChange={(e) => updateItem(index, 'amount', e.target.value)} className="w-full bg-cyan-950/20 border border-cyan-900/50 p-2 text-cyan-50 text-xs focus:outline-none focus:border-cyan-400" />
                                    </div>
                                    <div className="col-span-1">
                                        <button type="button" onClick={() => removeItem(index)} className="p-2 text-red-500 hover:text-red-400 transition-colors">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button type="button" onClick={addItem} className="mt-4 flex items-center gap-2 text-cyan-400 hover:text-amber-400 text-[10px] uppercase tracking-widest transition-colors py-2">
                            <Plus className="w-3 h-3" /> Add Service Row
                        </button>

                        <div className="mt-8 pt-6 border-t border-cyan-900/30 flex justify-end">
                            <div className="w-64 space-y-3 text-right">
                                <div className="flex justify-between text-cyan-500 text-xs tracking-widest">
                                    <span>VAT (€):</span>
                                    <input type="number" name="vat_amount" value={invoiceData.vat_amount} onChange={handleChange} className="w-24 bg-cyan-950/20 border border-cyan-900/50 p-1 text-right text-cyan-50 text-xs focus:outline-none" />
                                </div>
                                <div className="flex justify-between text-white font-bold text-lg tracking-widest">
                                    <span>TOTAL (€):</span>
                                    <span>{invoiceData.total_amount.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-12 flex justify-end">
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-cyan-950/50 hover:bg-cyan-900/80 border border-cyan-500/50 hover:border-cyan-400 text-cyan-400 px-8 py-4 text-xs font-bold uppercase tracking-[0.2em] transition-all disabled:opacity-50 flex items-center gap-3"
                            >
                                {loading ? 'COMPILING.TEX...' : <><DownloadCloud className="w-5 h-5" /> INITIATE COMPILE</>}
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
