import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { ArrowRight, ArrowUpRight, Check, Copy, Minus, Plus } from 'lucide-react';
import { KnowledgeExample, WorkflowExample } from './SoftwareVisuals';
import './landing.css';

const CaseStudyShowcase = lazy(() => import('./MotionStudies').then((module) => ({ default: module.CaseStudyShowcase })));

const EMAIL = 'hello@berixsystems.com';
const CONTACT_URL = `mailto:${EMAIL}?subject=Project%20enquiry`;
const navItems = [
    { href: '#work', label: 'Work' },
    { href: '#expertise', label: 'Expertise' },
    { href: '#approach', label: 'How we work' },
    { href: '#about', label: 'About' },
];

function useAppearance() {
    const [preference, setPreference] = useState(() => {
        try {
            const value = localStorage.getItem('berix-appearance');
            return ['light', 'dark'].includes(value) ? value : 'system';
        } catch {
            return 'system';
        }
    });
    const [systemDark, setSystemDark] = useState(() => window.matchMedia('(prefers-color-scheme: dark)').matches);

    useEffect(() => {
        const media = window.matchMedia('(prefers-color-scheme: dark)');
        const onChange = (event) => setSystemDark(event.matches);
        media.addEventListener('change', onChange);
        return () => media.removeEventListener('change', onChange);
    }, []);

    useEffect(() => {
        try {
            if (preference === 'system') localStorage.removeItem('berix-appearance');
            else localStorage.setItem('berix-appearance', preference);
        } catch {
            // Appearance still works when browser storage is unavailable.
        }
    }, [preference]);

    return { preference, setPreference, theme: preference === 'system' ? (systemDark ? 'dark' : 'light') : preference };
}

function Wordmark({ footer = false }) {
    return <span className={`berix-wordmark${footer ? ' berix-wordmark-footer' : ''}`}>BERIX</span>;
}

function Header() {
    const [open, setOpen] = useState(false);
    const menuButton = useRef(null);
    const menu = useRef(null);

    useEffect(() => {
        if (!open) return;
        menu.current?.querySelector('a')?.focus();
        const onKeyDown = (event) => {
            if (event.key === 'Escape') {
                setOpen(false);
                menuButton.current?.focus();
            }
        };
        document.addEventListener('keydown', onKeyDown);
        return () => document.removeEventListener('keydown', onKeyDown);
    }, [open]);

    return (
        <header className="berix-header">
            <div className="berix-container berix-header-inner">
                <a href="#top" className="berix-brand-link" aria-label="BERIX, back to top"><Wordmark /></a>
                <nav className="berix-desktop-nav" aria-label="Main navigation">
                    {navItems.map(({ href, label }) => <a href={href} key={href}>{label}</a>)}
                </nav>
                <a className="berix-nav-contact" href="#contact">Start a conversation <ArrowUpRight size={16} aria-hidden="true" /></a>
                <button ref={menuButton} className="berix-menu-button" type="button" aria-expanded={open} aria-controls="berix-mobile-nav" onClick={() => setOpen(!open)}>
                    {open ? 'Close' : 'Menu'} {open ? <Minus size={18} aria-hidden="true" /> : <Plus size={18} aria-hidden="true" />}
                </button>
            </div>
            <nav ref={menu} id="berix-mobile-nav" className="berix-mobile-nav" aria-label="Mobile navigation" hidden={!open}>
                {navItems.map(({ href, label }) => <a href={href} key={href} onClick={() => setOpen(false)}>{label}<ArrowUpRight size={20} aria-hidden="true" /></a>)}
                <a href="#contact" onClick={() => setOpen(false)}>Start a conversation <ArrowUpRight size={20} aria-hidden="true" /></a>
            </nav>
        </header>
    );
}

function Hero() {
    return (
        <section className="berix-hero berix-container" aria-labelledby="hero-title">
            <p className="berix-eyebrow"><span className="berix-cherry-mark" aria-hidden="true" /> Software. Data. Applied AI.</p>
            <div className="berix-hero-copy">
                <h1 id="hero-title">Software built for<br /><span>the long term.</span></h1>
                <div className="berix-hero-intro">
                    <p>We build software, data platforms, and applied AI that simplify operations and support your business as it grows.</p>
                    <div className="berix-hero-actions"><a href="#contact" className="berix-button">Start a conversation <ArrowUpRight size={18} aria-hidden="true" /></a></div>
                </div>
            </div>
            <div id="work"><Suspense fallback={<div className="berix-work-loading" aria-busy="true">Loading selected work…</div>}><CaseStudyShowcase /></Suspense></div>
        </section>
    );
}

function About() {
    return (
        <section className="berix-about berix-container" id="about" aria-labelledby="about-title">
            <h2 id="about-title">Technology should make<br className="berix-desktop-break" />{' '}<span>work simpler.</span></h2>
            <p>BERIX is a software engineering partner for international companies. We bring software, data, and applied AI together to make operations simpler, with clear decisions and close collaboration throughout.</p>
        </section>
    );
}

const expertise = [
    {
        title: 'Software engineering',
        summary: 'A stronger foundation for your business.',
        description: 'From a new platform to an existing system that needs care. We design and build software around your operations, your team, and the people who use it.',
        capabilities: ['Platforms & APIs', 'Cloud infrastructure', 'Internal tools', 'System modernization'],
    },
    {
        title: 'Data engineering',
        summary: 'Data you can use and depend on.',
        description: 'Bring scattered sources into a dependable foundation. We build pipelines, data platforms, and reporting models that help your team work with a shared understanding.',
        capabilities: ['Data pipelines', 'Streaming systems', 'Analytics platforms', 'Data modeling'],
    },
    {
        title: 'Applied AI',
        summary: 'Useful intelligence, grounded in your work.',
        description: 'Turn a specific business need into a practical AI system. We connect search, models, and automation to your workflows, with evaluation and human oversight built in.',
        capabilities: ['Search & retrieval', 'Workflow automation', 'Model evaluation', 'AI integration'],
    },
];

function Expertise() {
    return (
        <section className="berix-expertise" id="expertise" aria-labelledby="expertise-title">
            <span id="practice" className="berix-legacy-anchor" aria-hidden="true" />
            <div className="berix-container berix-expertise-layout">
                <div className="berix-expertise-heading">
                    <h2 id="expertise-title">Specialist expertise.<br />Shared purpose.</h2>
                    <p>Software, data, and AI work best when they work together.</p>
                    <a className="berix-text-link" href="#applications">See the possibilities <ArrowRight size={17} aria-hidden="true" /></a>
                </div>
                <div className="berix-expertise-list">
                    {expertise.map((item, index) => (
                        <details className="berix-expertise-item" name="berix-expertise" key={item.title} open={index === 0}>
                            <summary>
                                <h3>{item.title}<span className="berix-service-summary">{item.summary}</span></h3>
                                <span className="berix-disclosure-icon" aria-hidden="true"><Plus className="berix-plus" size={22} /><Minus className="berix-minus" size={22} /></span>
                            </summary>
                            <div className="berix-expertise-detail">
                                <p>{item.description}</p>
                                <ul aria-label={`${item.title} capabilities`}>{item.capabilities.map((capability) => <li key={capability}>{capability}</li>)}</ul>
                            </div>
                        </details>
                    ))}
                </div>
            </div>
        </section>
    );
}

function Applications() {
    return (
        <section className="berix-applications berix-container" id="applications" aria-labelledby="applications-title">
            <div className="berix-applications-heading">
                <p className="berix-eyebrow">Software in practice</p>
                <h2 id="applications-title">Connected systems.<br />Simpler operations.</h2>
                <p>These examples show how software can connect business information to everyday work.</p>
            </div>
            <div className="berix-applications-grid">
                <article className="berix-application">
                    <KnowledgeExample />
                    <div className="berix-application-copy"><span className="berix-category">Data & knowledge</span><h3>Search that leads to answers.</h3><p>Bring documents into a searchable knowledge layer, with clear sources and useful context for your team.</p></div>
                </article>
                <article className="berix-application berix-application-offset">
                    <WorkflowExample />
                    <div className="berix-application-copy"><span className="berix-category">Systems & operations</span><h3>Automation with a human checkpoint.</h3><p>Connect an incoming request to a proposed next step, human review, and a recorded outcome.</p></div>
                </article>
            </div>
        </section>
    );
}

const approach = [
    { title: 'Understand', text: 'Ask better questions. Get close to the work, the constraints, and what a useful outcome looks like.' },
    { title: 'Design', text: 'Make the important decisions together. Agree on a clear scope, a realistic plan, and how we will measure progress.' },
    { title: 'Build', text: 'Deliver in considered steps. Test the system, share the work, and make room for feedback as we go.' },
    { title: 'Stay involved', text: 'Support the handover and the people using it. Keep improving the system as your business changes.' },
];

function Approach() {
    return (
        <section className="berix-approach" id="approach" aria-labelledby="approach-title">
            <div className="berix-container">
                <h2 id="approach-title">A partner in the work.<br /><span>At every step.</span></h2>
                <div className="berix-approach-grid">{approach.map((item) => <article key={item.title}><div className="berix-approach-rule" aria-hidden="true" /><h3>{item.title}</h3><p>{item.text}</p></article>)}</div>
                <p className="berix-approach-note">Clear scope. Honest conversations. Shared ownership.</p>
            </div>
        </section>
    );
}

function CopyEmail() {
    const [status, setStatus] = useState('idle');
    const timer = useRef(null);
    useEffect(() => () => clearTimeout(timer.current), []);

    async function copy() {
        clearTimeout(timer.current);
        try {
            await navigator.clipboard.writeText(EMAIL);
            setStatus('copied');
        } catch {
            setStatus('error');
        }
        timer.current = setTimeout(() => setStatus('idle'), 3500);
    }

    return (
        <div className="berix-copy-wrapper">
            <button className="berix-copy-button" type="button" onClick={copy}>{status === 'copied' ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}{status === 'copied' ? 'Copied' : 'Copy email'}</button>
            <span className="berix-copy-status" role="status">{status === 'copied' ? 'Email address copied.' : status === 'error' ? 'Could not copy. Use the email link.' : ''}</span>
        </div>
    );
}

function Contact({ preference, setPreference }) {
    return (
        <footer className="berix-contact" id="contact" aria-labelledby="contact-title">
            <div className="berix-container">
                <div className="berix-contact-top"><span className="berix-cherry-mark" aria-hidden="true" /><p>A new idea. A complex problem. A better way forward.</p></div>
                <div className="berix-contact-heading"><h2 id="contact-title">Let’s build<br />something <span>that lasts.</span></h2><a href={CONTACT_URL} className="berix-contact-arrow" aria-label="Start a conversation by email"><ArrowUpRight aria-hidden="true" /></a></div>
                <div className="berix-contact-details"><a className="berix-email" href={CONTACT_URL}>{EMAIL}</a><CopyEmail /></div>
                <div className="berix-footer-bottom">
                    <a href="#top" className="berix-brand-link" aria-label="BERIX, back to top"><Wordmark footer /></a>
                    <p>© {new Date().getFullYear()} Berix Systems LLC</p>
                    <label className="berix-appearance">Appearance<select value={preference} onChange={(event) => setPreference(event.target.value)} aria-label="Color theme"><option value="system">System</option><option value="light">Light</option><option value="dark">Dark</option></select></label>
                    <a href="#top" className="berix-back-top">Back to top <ArrowUpRight size={15} aria-hidden="true" /></a>
                </div>
            </div>
        </footer>
    );
}

export default function LandingPage() {
    const { preference, setPreference, theme } = useAppearance();
    return (
        <div className="berix-site" data-theme={theme} id="top">
            <a className="berix-skip-link" href="#main-content">Skip to content</a>
            <Header />
            <main id="main-content" tabIndex={-1}>
                <Hero />
                <About />
                <Expertise />
                <Applications />
                <Approach />
            </main>
            <Contact preference={preference} setPreference={setPreference} />
        </div>
    );
}
