import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './admin/AuthContext';
import AdminLayout from './admin/AdminLayout';
import Login from './admin/Login';
import Dashboard from './admin/Dashboard';
import Invoices from './admin/Invoices';
import Proposals from './admin/Proposals';
import Contracts from './admin/Contracts';
import { ArrowUpRight, ArrowRight, Plus } from 'lucide-react';

/* ────────────────────────────────────────────────────────────────────────────
   BERIX SYSTEMS — LANDING (REDESIGN: "EDITORIAL ENGINEERING")
   Cream paper · ink black · ember accent · Fraunces / Geist / Geist Mono
   ──────────────────────────────────────────────────────────────────────────── */

/* ── Reveal-on-scroll primitive ───────────────────────────────────────────── */
const Reveal = ({ children, delay = 0, as: Tag = 'div', className = '' }) => {
    const ref = useRef(null);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const io = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    el.classList.add('in');
                    io.unobserve(el);
                }
            },
            { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
        );
        io.observe(el);
        return () => io.disconnect();
    }, []);
    return (
        <Tag
            ref={ref}
            className={`reveal ${className}`}
            style={{ '--stagger': `${delay}ms`, transitionDelay: `${delay}ms` }}
        >
            {children}
        </Tag>
    );
};

/* ── Wordmark ─────────────────────────────────────────────────────────────── */
const Wordmark = ({ className = '' }) => (
    <span className={`font-display tracking-tightest leading-none ${className}`}>
        Berix
        <span className="font-display italic font-light text-ember"> Systems</span>
    </span>
);

/* ── Top navigation ───────────────────────────────────────────────────────── */
const TopNav = () => {
    const [scrolled, setScrolled] = useState(false);
    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 8);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);
    return (
        <header
            className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
                scrolled ? 'bg-paper/85 backdrop-blur-md border-b hairline' : 'bg-transparent'
            }`}
        >
            <div className="mx-auto max-w-[1400px] px-6 md:px-10 h-16 md:h-20 flex items-center justify-between">
                <a href="#top" className="flex items-baseline gap-3 group">
                    <Wordmark className="text-2xl md:text-[26px]" />
                    <span className="hidden md:inline text-[10px] font-mono uppercase tracking-[0.22em] text-inkmute mt-1">
                        / LLC · EST. 2024
                    </span>
                </a>

                <nav className="hidden md:flex items-center gap-10 text-[13px] font-mono uppercase tracking-[0.18em]">
                    <a href="#practice" className="link-underline text-ink/80 hover:text-ink">Practice</a>
                    <a href="#work"     className="link-underline text-ink/80 hover:text-ink">Work</a>
                    <a href="#approach" className="link-underline text-ink/80 hover:text-ink">Approach</a>
                    <a href="#contact"  className="link-underline text-ink/80 hover:text-ink">Contact</a>
                </nav>

                <a
                    href="#contact"
                    className="group inline-flex items-center gap-2 rounded-full border border-ink/80 px-4 md:px-5 py-2 md:py-2.5 text-[12px] font-mono uppercase tracking-[0.2em] text-ink hover:bg-ink hover:text-paper transition-colors duration-300"
                >
                    Start a project
                    <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" strokeWidth={2} />
                </a>
            </div>
        </header>
    );
};

/* ── Hero ────────────────────────────────────────────────────────────────── */
const Hero = () => {
    return (
        <section id="top" className="relative pt-32 md:pt-40 pb-24 md:pb-32">
            {/* paper grid backdrop, masked to fade out at edges */}
            <div
                aria-hidden
                className="absolute inset-0 paper-grid opacity-90 pointer-events-none"
                style={{
                    maskImage: 'radial-gradient(ellipse at 50% 20%, black 30%, transparent 75%)',
                    WebkitMaskImage: 'radial-gradient(ellipse at 50% 20%, black 30%, transparent 75%)',
                }}
            />

            <div className="relative mx-auto max-w-[1400px] px-6 md:px-10">
                {/* Issue line */}
                <Reveal>
                    <div className="flex items-center gap-4 mb-10 md:mb-14">
                        <span className="block w-10 h-px bg-ink/60" />
                        <span className="font-mono text-[11px] uppercase tracking-[0.32em] text-inkmute">
                            Vol. I · Bulletin №01 · {new Date().getFullYear()}
                        </span>
                    </div>
                </Reveal>

                {/* Headline grid */}
                <div className="grid grid-cols-12 gap-x-6 gap-y-10 items-end">
                    <Reveal delay={100} className="col-span-12 lg:col-span-9">
                        <h1 className="font-display text-ink leading-[0.92] tracking-tightest text-[12.5vw] sm:text-[13vw] md:text-[10.5vw] lg:text-[9.2vw] xl:text-[150px]">
                            We engineer the
                            <br />
                            <span className="italic font-light">quiet</span> systems behind
                            <br />
                            <span className="relative inline-block">
                                <span className="text-ember">serious</span>
                                <span
                                    aria-hidden
                                    className="absolute -bottom-1 left-0 right-0 h-[3px] bg-ember/30"
                                />
                            </span>{' '}
                            software.
                        </h1>
                    </Reveal>

                    <Reveal delay={250} className="col-span-12 lg:col-span-3">
                        <p className="font-sans text-[15px] md:text-base text-ink/75 leading-relaxed max-w-sm lg:pl-6 lg:border-l hairline">
                            A small studio for software, data, and applied AI engineering.
                            We partner with founders and operators to design,
                            build, and run the platforms their businesses depend on.
                        </p>
                        <div className="mt-8 flex items-center gap-3">
                            <a
                                href="#contact"
                                className="inline-flex items-center gap-2 bg-ink text-paper px-5 py-3 text-[12px] font-mono uppercase tracking-[0.2em] hover:bg-ember transition-colors duration-300 group"
                            >
                                Begin engagement
                                <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5" strokeWidth={2} />
                            </a>
                        </div>
                    </Reveal>
                </div>

                {/* Footnote strip */}
                <Reveal delay={400} className="mt-20 md:mt-28">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-y-6 gap-x-6 md:gap-x-12 border-t border-b hairline py-6">
                        <Footnote label="Discipline" value="Software · Data · AI" />
                        <Footnote label="Engagements" value="Build · Embed · Advise" />
                        <Footnote label="Coverage" value="Remote, US/EU hours" />
                        <Footnote label="Currently" value={<span className="inline-flex items-center gap-2"><span className="relative flex w-2 h-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-ember opacity-60" /><span className="relative inline-flex rounded-full h-2 w-2 bg-ember" /></span> Booking Q3</span>} />
                    </div>
                </Reveal>
            </div>
        </section>
    );
};

const Footnote = ({ label, value }) => (
    <div>
        <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-inkmute mb-2">{label}</div>
        <div className="font-sans text-sm md:text-base text-ink">{value}</div>
    </div>
);

/* ── Marquee strip ────────────────────────────────────────────────────────── */
const Marquee = () => {
    const items = [
        'Software Engineering', 'Data Platforms', 'Applied AI', 'Cloud Infrastructure',
        'API Design', 'LLM Systems', 'Streaming Pipelines', 'Internal Tooling',
        'Search & Retrieval', 'Reliability', 'Migrations', 'Observability',
    ];
    const doubled = [...items, ...items];
    return (
        <section aria-label="Capabilities" className="relative border-y hairline overflow-hidden bg-paperdeep/60">
            <div className="marquee-track flex whitespace-nowrap py-7 md:py-9">
                {doubled.map((t, i) => (
                    <span key={i} className="flex items-center gap-10 md:gap-14 pr-10 md:pr-14 font-display text-[36px] md:text-[56px] leading-none tracking-tighter2 text-ink/90">
                        {t}
                        <span className="text-ember">✦</span>
                    </span>
                ))}
            </div>
        </section>
    );
};

/* ── Practice (services) ─────────────────────────────────────────────────── */
const practiceData = [
    {
        n: '01',
        title: 'Software Engineering',
        lede: 'Production systems built to last beyond the launch — from first API to fifth migration.',
        items: ['Backend services (Python, Go, TypeScript)', 'API design & API gateways', 'Cloud-native deployment (GCP, AWS)', 'Internal platforms & developer tooling'],
    },
    {
        n: '02',
        title: 'Data Engineering',
        lede: 'Pipelines, warehouses, and streaming infrastructure that stay honest under load.',
        items: ['ETL/ELT (Airflow, dbt, Spark)', 'Real-time streaming (Kafka, Kinesis)', 'Lakehouse architecture (Databricks)', 'Analytics & semantic models'],
    },
    {
        n: '03',
        title: 'Applied AI',
        lede: 'LLM and ML systems wired into the actual seams of your product, not bolted on as a demo.',
        items: ['Retrieval-augmented systems', 'Fine-tuning & evaluation harnesses', 'Vector search (Pinecone, pgvector)', 'Agents, tooling & orchestration'],
    },
];

const Practice = () => (
    <section id="practice" className="relative py-28 md:py-40 mx-auto max-w-[1400px] px-6 md:px-10">
        <Reveal>
            <SectionLabel kicker="§ I" title="Practice" caption="Three disciplines, run as one team." />
        </Reveal>

        <div className="mt-16 md:mt-24 grid grid-cols-1 md:grid-cols-3 gap-px bg-line">
            {practiceData.map((p, i) => (
                <Reveal key={p.n} delay={120 * i} className="bg-paper p-8 md:p-10 group">
                    <div className="flex items-baseline justify-between mb-12">
                        <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-inkmute">{p.n} / 03</span>
                        <Plus className="w-3.5 h-3.5 text-ink/50 group-hover:text-ember group-hover:rotate-90 transition-all duration-500" strokeWidth={2} />
                    </div>
                    <h3 className="font-display text-[34px] md:text-[40px] leading-[1] tracking-tighter2 text-ink mb-6">
                        {p.title}
                    </h3>
                    <p className="font-sans text-[15px] leading-relaxed text-ink/75 mb-8 max-w-md">{p.lede}</p>
                    <ul className="space-y-2.5 font-mono text-[12px] uppercase tracking-[0.14em] text-inkmute">
                        {p.items.map((it) => (
                            <li key={it} className="flex items-start gap-3">
                                <span className="text-ember mt-1.5 leading-none">—</span>
                                <span>{it}</span>
                            </li>
                        ))}
                    </ul>
                </Reveal>
            ))}
        </div>
    </section>
);

/* ── Section label primitive ──────────────────────────────────────────────── */
const SectionLabel = ({ kicker, title, caption }) => (
    <div className="grid grid-cols-12 gap-6 items-end border-t hairline pt-8">
        <div className="col-span-2 md:col-span-1">
            <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-ember">{kicker}</span>
        </div>
        <div className="col-span-10 md:col-span-7">
            <h2 className="font-display text-[44px] md:text-[68px] leading-[0.95] tracking-tightest text-ink">
                {title}
            </h2>
        </div>
        <div className="hidden md:block md:col-span-4">
            <p className="font-sans text-[14px] text-ink/70 leading-relaxed border-l hairline pl-5 max-w-sm">
                {caption}
            </p>
        </div>
    </div>
);

/* ── Selected Work ───────────────────────────────────────────────────────── */
const workData = [
    {
        client: 'Global HR Platform',
        title: 'Payroll Integration Across 20+ Jurisdictions',
        body:
            'Designed and shipped an enterprise integration layer that unified disparate national payroll providers behind a single API, used in production across more than twenty countries. We owned the system end-to-end: contract design, idempotency, retries, observability, and the on-call playbooks that keep payroll quiet.',
        kpi: [
            { v: '20+', l: 'Countries live' },
            { v: '4 ms', l: 'p50 latency' },
            { v: '99.99%', l: 'API availability' },
        ],
        meta: '2024 — Build · Python · FastAPI · GCP',
    },
    {
        client: 'Legal-Tech B2B',
        title: 'Vector Search for Case Law & Contracts',
        body:
            'Built a retrieval system over a domain-specific legal corpus — embeddings, hybrid search, document chunking strategy, and a thin query layer that legal practitioners actually use. Replaced a sluggish keyword index that lawyers had stopped trusting.',
        kpi: [
            { v: '12 ms', l: 'Avg. query' },
            { v: '99.9%', l: 'Recall@10' },
            { v: '4M+', l: 'Documents indexed' },
        ],
        meta: '2025 — Build · Pinecone · pgvector · LangChain',
    },
    {
        client: 'Fintech (HFT-adjacent)',
        title: 'Real-Time Anomaly Detection at the Edge',
        body:
            'Streaming market-data pipeline with edge-deployed scoring logic for anomaly detection. Co-designed the feature engineering, model lifecycle, and the alerting surface that operators trust during volatile sessions.',
        kpi: [
            { v: '<1 ms', l: 'Edge latency' },
            { v: '128', l: 'Edge nodes' },
            { v: '24/7', l: 'In production' },
        ],
        meta: '2025 — Build · Kinesis · Kafka · ONNX',
    },
];

const Work = () => (
    <section id="work" className="relative py-28 md:py-40 mx-auto max-w-[1400px] px-6 md:px-10">
        <Reveal>
            <SectionLabel
                kicker="§ II"
                title={<>Selected <span className="italic font-light">Work</span></>}
                caption="A small set of recent engagements. Names of clients and proprietary numbers are withheld; outcomes are real."
            />
        </Reveal>

        <div className="mt-16 md:mt-24 space-y-px bg-line">
            {workData.map((w, i) => (
                <Reveal key={w.title} delay={i * 80} className="bg-paper">
                    <article className="grid grid-cols-12 gap-6 md:gap-10 px-2 md:px-4 py-10 md:py-14 group hover:bg-paperdeep/60 transition-colors duration-500">
                        <div className="col-span-12 md:col-span-1">
                            <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-inkmute num-tabular">
                                {String(i + 1).padStart(2, '0')}
                            </span>
                        </div>

                        <div className="col-span-12 md:col-span-5">
                            <div className="font-mono text-[11px] uppercase tracking-[0.24em] text-ember mb-4">{w.client}</div>
                            <h3 className="font-display text-[28px] md:text-[40px] leading-[1.02] tracking-tighter2 text-ink">
                                {w.title}
                                <ArrowUpRight className="inline-block w-6 h-6 md:w-8 md:h-8 ml-2 -mt-1 text-ink/50 group-hover:text-ember group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-500" strokeWidth={1.5} />
                            </h3>
                            <div className="mt-6 font-mono text-[11px] uppercase tracking-[0.22em] text-inkmute">
                                {w.meta}
                            </div>
                        </div>

                        <div className="col-span-12 md:col-span-4">
                            <p className="font-sans text-[15px] leading-relaxed text-ink/80">{w.body}</p>
                        </div>

                        <div className="col-span-12 md:col-span-2 md:border-l hairline md:pl-6">
                            <div className="grid grid-cols-3 md:grid-cols-1 gap-y-4 gap-x-3">
                                {w.kpi.map((k) => (
                                    <div key={k.l}>
                                        <div className="font-display text-[28px] md:text-[36px] leading-none tracking-tighter2 text-ember num-tabular">
                                            {k.v}
                                        </div>
                                        <div className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-inkmute">
                                            {k.l}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </article>
                </Reveal>
            ))}
        </div>
    </section>
);

/* ── By the numbers ──────────────────────────────────────────────────────── */
const numbersData = [
    { v: '11', l: 'Production systems shipped', sub: 'across consulting & build engagements' },
    { v: '6', l: 'Engineering disciplines', sub: 'backend, data, ML, infra, frontend, platform' },
    { v: '4 yrs', l: 'Average client tenure', sub: 'we stay through the second migration' },
    { v: '0', l: 'Outsourced delivery', sub: 'every line is written in-house' },
];

const Numbers = () => (
    <section className="relative py-24 md:py-32 bg-paperdeep/70 border-y hairline">
        <div className="mx-auto max-w-[1400px] px-6 md:px-10">
            <Reveal>
                <div className="font-mono text-[11px] uppercase tracking-[0.28em] text-inkmute mb-12">
                    § By the Numbers
                </div>
            </Reveal>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-px bg-line border hairline">
                {numbersData.map((n, i) => (
                    <Reveal key={n.l} delay={i * 100} className="bg-paperdeep/70 p-8 md:p-10">
                        <div className="font-display text-[64px] md:text-[88px] leading-[0.9] tracking-tightest text-ink num-tabular">
                            {n.v}
                        </div>
                        <div className="mt-6 font-display italic font-light text-[18px] md:text-[20px] text-ink/85 leading-snug">
                            {n.l}
                        </div>
                        <div className="mt-3 font-mono text-[11px] uppercase tracking-[0.22em] text-inkmute leading-relaxed">
                            {n.sub}
                        </div>
                    </Reveal>
                ))}
            </div>
        </div>
    </section>
);

/* ── Approach ────────────────────────────────────────────────────────────── */
const approachData = [
    { roman: 'I',   title: 'Frame', body: 'Two short conversations and a written brief. We agree on the actual problem before we agree on the solution. Most engagements are reshaped at this stage.' },
    { roman: 'II',  title: 'Design', body: 'A short technical write-up: architecture, data contracts, risks, and the failure modes we plan to avoid. You see what we will build before a line of code is written.' },
    { roman: 'III', title: 'Build', body: 'Weekly checkpoints, working software each cycle, and source access from day one. No demo theatre — what you see is what is running.' },
    { roman: 'IV',  title: 'Operate', body: 'Runbooks, observability, and the boring instrumentation that keeps a system honest. We hand off cleanly, or stay on under a retainer.' },
];

const Approach = () => (
    <section id="approach" className="relative py-28 md:py-40 mx-auto max-w-[1400px] px-6 md:px-10">
        <Reveal>
            <SectionLabel
                kicker="§ III"
                title="Approach"
                caption="A predictable shape across every engagement, regardless of stack or domain."
            />
        </Reveal>

        <div className="mt-16 md:mt-24 grid grid-cols-12 gap-y-10 gap-x-6 md:gap-x-10">
            {approachData.map((s, i) => (
                <Reveal key={s.roman} delay={i * 100} className="col-span-12 md:col-span-6 lg:col-span-3">
                    <div className="border-t-2 border-ink pt-6">
                        <div className="font-display italic text-ember text-[28px] leading-none mb-6">
                            {s.roman}.
                        </div>
                        <h3 className="font-display text-[32px] leading-none tracking-tighter2 text-ink mb-5">
                            {s.title}
                        </h3>
                        <p className="font-sans text-[14.5px] text-ink/75 leading-relaxed">
                            {s.body}
                        </p>
                    </div>
                </Reveal>
            ))}
        </div>
    </section>
);

/* ── Voice / pull-quote ───────────────────────────────────────────────────── */
const PullQuote = () => (
    <section className="relative py-24 md:py-36 border-y hairline bg-paperdeep/40">
        <div className="mx-auto max-w-[1100px] px-6 md:px-10">
            <Reveal>
                <p className="font-display text-[32px] md:text-[52px] leading-[1.08] tracking-tighter2 text-ink">
                    <span className="font-display italic font-light text-ember">“</span>
                    The best engineering work disappears into the business that uses it.
                    We measure ourselves not by how much we build, but by how little
                    of it our clients have to think about a year later.
                    <span className="font-display italic font-light text-ember">”</span>
                </p>
            </Reveal>
            <Reveal delay={120}>
                <div className="mt-10 flex items-center gap-4">
                    <span className="block w-10 h-px bg-ink/60" />
                    <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-inkmute">
                        Drinor Berisha · Founder, Berix Systems
                    </span>
                </div>
            </Reveal>
        </div>
    </section>
);

/* ── Contact ─────────────────────────────────────────────────────────────── */
const Contact = () => (
    <section id="contact" className="relative py-28 md:py-40 mx-auto max-w-[1400px] px-6 md:px-10">
        <Reveal>
            <div className="font-mono text-[11px] uppercase tracking-[0.28em] text-inkmute mb-10 flex items-center gap-3">
                <span className="block w-10 h-px bg-ink/60" />
                § Correspondence
            </div>
        </Reveal>

        <Reveal delay={80}>
            <h2 className="font-display text-[11vw] md:text-[9vw] lg:text-[140px] leading-[0.92] tracking-tightest text-ink">
                Have a system
                <br />
                <span className="italic font-light">worth</span> building?
            </h2>
        </Reveal>

        <div className="mt-14 md:mt-20 grid grid-cols-12 gap-y-10 gap-x-6 md:gap-x-10">
            <Reveal delay={160} className="col-span-12 md:col-span-6">
                <p className="font-sans text-[16px] md:text-[18px] text-ink/80 leading-relaxed max-w-lg">
                    Tell us what you are trying to ship, who it is for, and where it is stuck.
                    A two-paragraph email beats a thirty-slide deck. We reply within two business days.
                </p>
            </Reveal>

            <Reveal delay={240} className="col-span-12 md:col-span-6 md:pl-10 md:border-l hairline">
                <a
                    href="mailto:hello@berixsystems.com"
                    className="group inline-flex flex-wrap items-baseline gap-x-3 gap-y-1 font-display text-[clamp(22px,6vw,32px)] md:text-[44px] leading-[1.1] tracking-tighter2 text-ink hover:text-ember transition-colors duration-300 break-all max-w-full"
                >
                    hello@berixsystems.com
                    <ArrowUpRight className="w-6 h-6 md:w-9 md:h-9 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 shrink-0" strokeWidth={1.5} />
                </a>

                <dl className="mt-10 grid grid-cols-2 gap-y-6 gap-x-6">
                    <div>
                        <dt className="font-mono text-[10px] uppercase tracking-[0.28em] text-inkmute mb-2">Office</dt>
                        <dd className="font-sans text-[14.5px] text-ink/85">Remote · US/EU hours</dd>
                    </div>
                    <div>
                        <dt className="font-mono text-[10px] uppercase tracking-[0.28em] text-inkmute mb-2">Availability</dt>
                        <dd className="font-sans text-[14.5px] text-ink/85">Booking Q3 — limited</dd>
                    </div>
                    <div>
                        <dt className="font-mono text-[10px] uppercase tracking-[0.28em] text-inkmute mb-2">Engagements</dt>
                        <dd className="font-sans text-[14.5px] text-ink/85">Build · Embed · Advise</dd>
                    </div>
                    <div>
                        <dt className="font-mono text-[10px] uppercase tracking-[0.28em] text-inkmute mb-2">Response</dt>
                        <dd className="font-sans text-[14.5px] text-ink/85">Within 2 business days</dd>
                    </div>
                </dl>
            </Reveal>
        </div>
    </section>
);

/* ── Footer ──────────────────────────────────────────────────────────────── */
const Footer = () => (
    <footer className="relative bg-ink text-paper">
        <div className="mx-auto max-w-[1400px] px-6 md:px-10 pt-20 md:pt-28 pb-10">
            <div className="grid grid-cols-12 gap-y-12 gap-x-6 md:gap-x-10">
                <div className="col-span-12 md:col-span-6">
                    <span className="font-display text-[14vw] md:text-[8vw] lg:text-[120px] leading-[0.9] tracking-tightest">
                        Berix
                        <span className="font-display italic font-light text-ember/95"> Systems</span>
                    </span>
                </div>

                <div className="col-span-6 md:col-span-2">
                    <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-paper/50 mb-4">Studio</div>
                    <ul className="space-y-2.5 text-[14px] font-sans text-paper/85">
                        <li><a href="#practice" className="link-underline">Practice</a></li>
                        <li><a href="#work" className="link-underline">Work</a></li>
                        <li><a href="#approach" className="link-underline">Approach</a></li>
                    </ul>
                </div>

                <div className="col-span-6 md:col-span-2">
                    <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-paper/50 mb-4">Channels</div>
                    <ul className="space-y-2.5 text-[14px] font-sans text-paper/85">
                        <li><a href="mailto:hello@berixsystems.com" className="link-underline">Email</a></li>
                        <li><a href="https://github.com" target="_blank" rel="noreferrer" className="link-underline">GitHub</a></li>
                        <li><a href="https://linkedin.com" target="_blank" rel="noreferrer" className="link-underline">LinkedIn</a></li>
                    </ul>
                </div>

                <div className="col-span-12 md:col-span-2">
                    <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-paper/50 mb-4">Office</div>
                    <p className="text-[14px] font-sans text-paper/85 leading-relaxed">
                        Remote studio<br />US / EU hours<br />Reg. Berix Systems LLC
                    </p>
                </div>
            </div>

            <div className="mt-20 pt-6 border-t border-paper/15 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-paper/55">
                    © {new Date().getFullYear()} Berix Systems LLC · All rights reserved
                </div>
                <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-paper/55">
                    Designed & built in-house · Set in Fraunces & Geist
                </div>
            </div>
        </div>
    </footer>
);

/* ── Page ────────────────────────────────────────────────────────────────── */
function LandingPage() {
    return (
        <div className="relative bg-paper text-ink min-h-screen grain">
            <TopNav />
            <main>
                <Hero />
                <Marquee />
                <Practice />
                <Work />
                <Numbers />
                <PullQuote />
                <Approach />
                <Contact />
            </main>
            <Footer />
        </div>
    );
}

/* ── App / Router ────────────────────────────────────────────────────────── */
export default function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/admin/login" element={<Login />} />
                    <Route path="/admin" element={<AdminLayout />}>
                        <Route path="dashboard" element={<Dashboard />} />
                        <Route path="invoices" element={<Invoices />} />
                        <Route path="proposals" element={<Proposals />} />
                        <Route path="contracts" element={<Contracts />} />
                    </Route>
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}
