import { useState, useEffect } from 'react';
import {
    Navigate,
    Outlet,
    NavLink,
    Link,
    useNavigate,
    useLocation,
} from 'react-router-dom';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';
import {
    LayoutGrid,
    Receipt,
    FileText,
    ScrollText,
    LogOut,
    ArrowUpRight,
    Menu,
    X,
} from 'lucide-react';

export default function AdminLayout() {
    const { user, loading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [open, setOpen] = useState(false);

    /* Auto-close drawer on route change */
    useEffect(() => {
        setOpen(false);
    }, [location.pathname]);

    /* Lock body scroll while drawer is open */
    useEffect(() => {
        if (open) {
            const prev = document.body.style.overflow;
            document.body.style.overflow = 'hidden';
            return () => {
                document.body.style.overflow = prev;
            };
        }
    }, [open]);

    /* Close on Escape */
    useEffect(() => {
        if (!open) return;
        const onKey = (e) => e.key === 'Escape' && setOpen(false);
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [open]);

    if (loading) {
        return (
            <div className="min-h-screen bg-paper text-ink flex items-center justify-center px-6">
                <div className="font-mono text-[11px] uppercase tracking-[0.28em] text-inkmute">
                    Authenticating session…
                </div>
            </div>
        );
    }

    if (!user) return <Navigate to="/admin/login" replace />;

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/admin/login');
    };

    const linkClass = ({ isActive }) =>
        `flex items-center gap-3 px-6 py-3.5 text-[13px] tracking-[0.02em] border-l-2 transition-colors ${
            isActive
                ? 'border-ember text-ink bg-paper'
                : 'border-transparent text-ink/65 hover:text-ink hover:bg-paper/60'
        }`;

    const SidebarBody = () => (
        <>
            <div className="px-6 pt-8 pb-7 flex items-start justify-between gap-3">
                <Link to="/" className="block min-w-0">
                    <div className="font-display text-[24px] sm:text-[26px] leading-none tracking-tightest text-ink truncate">
                        Berix
                        <span className="font-display italic font-light text-ember"> Systems</span>
                    </div>
                    <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.28em] text-inkmute">
                        Internal Admin · v1
                    </div>
                </Link>

                {/* Drawer close — mobile only */}
                <button
                    type="button"
                    onClick={() => setOpen(false)}
                    aria-label="Close menu"
                    className="md:hidden -mr-2 p-2 text-ink/60 hover:text-ink transition-colors"
                >
                    <X className="w-5 h-5" strokeWidth={1.8} />
                </button>
            </div>

            <div className="border-t border-ink/12 px-6 py-4">
                <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-inkmute mb-1.5">
                    Operator
                </div>
                <div className="text-[13px] text-ink truncate" title={user.email}>
                    {user.email}
                </div>
            </div>

            <nav className="border-t border-ink/12 py-3">
                <NavLink to="/admin/dashboard" className={linkClass}>
                    <LayoutGrid className="w-4 h-4" strokeWidth={1.6} /> Dashboard
                </NavLink>
                <NavLink to="/admin/invoices" className={linkClass}>
                    <Receipt className="w-4 h-4" strokeWidth={1.6} /> Invoices
                </NavLink>
                <NavLink to="/admin/proposals" className={linkClass}>
                    <FileText className="w-4 h-4" strokeWidth={1.6} /> Proposals
                </NavLink>
                <NavLink to="/admin/contracts" className={linkClass}>
                    <ScrollText className="w-4 h-4" strokeWidth={1.6} /> Contracts
                </NavLink>
            </nav>

            <div className="mt-auto border-t border-ink/12 p-6 space-y-4">
                <Link
                    to="/"
                    className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-inkmute hover:text-ink transition-colors"
                >
                    <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={2} /> Public site
                </Link>
                <button
                    type="button"
                    onClick={handleLogout}
                    className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-inkmute hover:text-ember transition-colors"
                >
                    <LogOut className="w-3.5 h-3.5" strokeWidth={2} /> Sign out
                </button>
            </div>
        </>
    );

    return (
        <div className="min-h-screen bg-paper text-ink md:flex">
            {/* ── Mobile top bar ───────────────────────────────────────────── */}
            <header className="md:hidden sticky top-0 z-40 flex items-center justify-between gap-3 px-4 h-14 bg-paper/90 backdrop-blur-md border-b border-ink/12">
                <button
                    type="button"
                    onClick={() => setOpen(true)}
                    aria-label="Open menu"
                    aria-expanded={open}
                    className="p-2 -ml-2 text-ink hover:text-ember transition-colors"
                >
                    <Menu className="w-5 h-5" strokeWidth={1.8} />
                </button>

                <Link to="/admin/dashboard" className="font-display text-[18px] leading-none tracking-tightest text-ink">
                    Berix
                    <span className="font-display italic font-light text-ember"> Systems</span>
                </Link>

                {/* spacer to balance the menu button */}
                <span className="w-9" aria-hidden />
            </header>

            {/* ── Backdrop (mobile drawer) ─────────────────────────────────── */}
            <div
                onClick={() => setOpen(false)}
                aria-hidden
                className={`md:hidden fixed inset-0 z-40 bg-ink/40 backdrop-blur-[2px] transition-opacity duration-300 ${
                    open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                }`}
            />

            {/* ── Sidebar / drawer ────────────────────────────────────────── */}
            <aside
                aria-hidden={!open}
                className={`
                    fixed md:static inset-y-0 left-0 z-50
                    w-[80vw] max-w-[18rem] md:w-72 shrink-0
                    border-r border-ink/12 bg-paperdeep/95 md:bg-paperdeep/40
                    backdrop-blur-md md:backdrop-blur-0
                    flex flex-col overflow-y-auto
                    transition-transform duration-300 ease-out
                    ${open ? 'translate-x-0' : '-translate-x-full'}
                    md:translate-x-0
                `}
            >
                <SidebarBody />
            </aside>

            {/* ── Main ────────────────────────────────────────────────────── */}
            <main className="flex-1 min-w-0 overflow-y-auto">
                <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-12 py-8 sm:py-10 lg:py-14">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
