import { useAuth } from './AuthContext';
import { Link } from 'react-router-dom';
import { Activity, FileText, Server, ArrowUpRight } from 'lucide-react';
import { PageHeader, SubLabel } from './AdminUI';

export default function Dashboard() {
    const { user } = useAuth();
    const today = new Date().toLocaleDateString(undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    return (
        <div>
            <PageHeader
                kicker="§ Overview"
                title="Dashboard"
                caption={
                    <span className="flex flex-col items-end">
                        <span>{today}</span>
                        <span className="mt-1 text-ink/55 normal-case tracking-normal text-[11px] font-sans">
                            {user.email}
                        </span>
                    </span>
                }
            />

            <section className="mt-12">
                <SubLabel>§ I — System pulse</SubLabel>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-ink/12 border border-ink/12">
                    <StatCard
                        label="System status"
                        value="Online"
                        sub="All API nodes operational"
                        icon={Activity}
                        tone="ember"
                        live
                    />
                    <StatCard
                        label="Invoices generated"
                        value="—"
                        sub="Live counter pending"
                        icon={FileText}
                    />
                    <StatCard
                        label="Cloud Run nodes"
                        value="01"
                        sub="LaTeX compiler microservice"
                        icon={Server}
                    />
                </div>
            </section>

            <section className="mt-16">
                <SubLabel>§ II — Quick actions</SubLabel>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-ink/12 border border-ink/12">
                    <ActionTile
                        to="/admin/invoices"
                        title="Generate invoice"
                        body="Compose a new invoice and compile to PDF via the LaTeX microservice."
                    />
                    <ActionTile
                        to="/admin/proposals"
                        title="Send proposal"
                        body="Draft a project proposal: scope, phases, pricing, validity. Streams a signed PDF."
                    />
                    <ActionTile
                        to="/admin/contracts"
                        title="Draft contract"
                        body="Compose a Statement of Work — deliverables, milestones, fees, acceptance criteria."
                    />
                </div>
            </section>
        </div>
    );
}

const StatCard = ({ label, value, sub, icon: Icon, tone, live }) => (
    <div className="bg-paper p-7 md:p-8">
        <div className="flex items-center justify-between mb-10">
            <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-inkmute">
                {label}
            </span>
            <Icon className="w-4 h-4 text-ink/45" strokeWidth={1.6} />
        </div>
        <div
            className={`font-display text-[44px] md:text-[52px] leading-none tracking-tightest num-tabular ${
                tone === 'ember' ? 'text-ember' : 'text-ink'
            }`}
        >
            {value}
        </div>
        <div className="mt-4 flex items-center gap-2 text-[13px] text-ink/65">
            {live && (
                <span className="relative inline-flex w-1.5 h-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-ember opacity-60" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-ember" />
                </span>
            )}
            {sub}
        </div>
    </div>
);

const ActionTile = ({ to, title, body }) => (
    <Link
        to={to}
        className="bg-paper p-7 md:p-8 group hover:bg-paperdeep/50 transition-colors"
    >
        <div className="flex justify-between items-start gap-4 mb-3">
            <h3 className="font-display text-[26px] md:text-[28px] leading-none tracking-tighter2 text-ink">
                {title}
            </h3>
            <ArrowUpRight
                className="w-4 h-4 text-ink/45 group-hover:text-ember group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300"
                strokeWidth={2}
            />
        </div>
        <p className="text-[13.5px] text-ink/70 leading-relaxed">{body}</p>
    </Link>
);
