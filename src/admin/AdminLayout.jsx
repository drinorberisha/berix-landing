import { Navigate, Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';
import { LayoutDashboard, FileText, FileSignature, LogOut, Cpu } from 'lucide-react';

export default function AdminLayout() {
    const { user, loading } = useAuth();
    const navigate = useNavigate();

    if (loading) return <div className="min-h-screen bg-[#000810] text-cyan-500 flex items-center justify-center font-mono tracking-widest animate-pulse">LOADING_AUTH_STATE...</div>;

    if (!user) {
        return <Navigate to="/admin/login" replace />;
    }

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/admin/login');
    };

    return (
        <div className="min-h-screen bg-[#000810] text-white font-mono flex">
            {/* Sidebar */}
            <aside className="w-64 border-r border-cyan-900/50 bg-black/50 p-6 flex flex-col">
                <div className="mb-10 flex items-center gap-3">
                    <Cpu className="w-6 h-6 text-cyan-400" />
                    <div>
                        <h2 className="text-lg font-bold text-cyan-500 tracking-widest uppercase leading-none">Berix Admin</h2>
                        <p className="text-[9px] text-cyan-600 tracking-widest mt-1 truncate" title={user.email}>[ USER: {user.email} ]</p>
                    </div>
                </div>

                <nav className="flex-1 space-y-2">
                    <Link to="/admin/dashboard" className="flex items-center gap-3 p-3 text-cyan-100/70 hover:text-amber-400 hover:bg-cyan-950/30 border border-transparent hover:border-cyan-900/50 transition-colors uppercase text-xs tracking-widest">
                        <LayoutDashboard className="w-4 h-4" /> Dashboard
                    </Link>
                    <Link to="/admin/invoices" className="flex items-center gap-3 p-3 text-cyan-100/70 hover:text-amber-400 hover:bg-cyan-950/30 border border-transparent hover:border-cyan-900/50 transition-colors uppercase text-xs tracking-widest">
                        <FileText className="w-4 h-4" /> Invoices
                    </Link>
                    <Link to="/admin/contracts" className="flex items-center gap-3 p-3 text-cyan-100/70 hover:text-amber-400 hover:bg-cyan-950/30 border border-transparent hover:border-cyan-900/50 transition-colors uppercase text-xs tracking-widest">
                        <FileSignature className="w-4 h-4" /> Contracts
                    </Link>
                </nav>

                <button onClick={handleLogout} className="mt-auto flex items-center gap-3 p-3 text-red-500 hover:text-red-400 hover:bg-red-950/20 border border-transparent hover:border-red-900/50 transition-colors uppercase text-xs tracking-widest w-full">
                    <LogOut className="w-4 h-4" /> Terminate Session
                </button>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 lg:p-12 overflow-y-auto custom-scrollbar relative">
                <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0),rgba(255,255,255,0)_50%,rgba(0,0,0,0.1)_50%,rgba(0,0,0,0.1))] bg-[length:100%_4px] pointer-events-none z-0 opacity-20" />
                <div className="relative z-10">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
