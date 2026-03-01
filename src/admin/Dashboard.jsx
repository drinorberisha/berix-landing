import { useAuth } from './AuthContext';
import { Target, Activity, FileText, Server } from 'lucide-react';

export default function Dashboard() {
    const { user } = useAuth();

    return (
        <div className="space-y-8 animate-fade-in">
            <header className="flex items-center gap-4 mb-12">
                <Target className="w-8 h-8 text-cyan-500 animate-pulse" />
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-widest uppercase">Admin Dashboard</h1>
                    <p className="text-cyan-600 text-[10px] uppercase tracking-widest mt-1">Operational Overview for {user.email}</p>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-black/60 border border-cyan-900/50 p-6 relative group">
                    <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-cyan-500/50"></div>
                    <div className="flex items-center gap-4 mb-4">
                        <Activity className="text-amber-400 w-6 h-6" />
                        <h3 className="text-white font-bold tracking-widest uppercase text-sm">System Status</h3>
                    </div>
                    <div className="text-3xl font-bold text-cyan-400 font-mono">ONLINE</div>
                    <p className="text-cyan-600/50 text-[10px] uppercase mt-2">All API nodes operational</p>
                </div>

                <div className="bg-black/60 border border-cyan-900/50 p-6 relative group hover:border-cyan-500/50 transition-colors">
                    <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-cyan-500/50"></div>
                    <div className="flex items-center gap-4 mb-4">
                        <FileText className="text-cyan-400 w-6 h-6" />
                        <h3 className="text-white font-bold tracking-widest uppercase text-sm">Invoices Generated</h3>
                    </div>
                    <div className="text-3xl font-bold text-cyan-400 font-mono">--</div>
                    <p className="text-cyan-600/50 text-[10px] uppercase mt-2">Ready to generate</p>
                </div>

                <div className="bg-black/60 border border-cyan-900/50 p-6 relative group hover:border-cyan-500/50 transition-colors">
                    <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-cyan-500/50"></div>
                    <div className="flex items-center gap-4 mb-4">
                        <Server className="text-cyan-400 w-6 h-6" />
                        <h3 className="text-white font-bold tracking-widest uppercase text-sm">Cloud Run Nodes</h3>
                    </div>
                    <div className="text-3xl font-bold text-cyan-400 font-mono">1</div>
                    <p className="text-cyan-600/50 text-[10px] uppercase mt-2">LaTeX Compiler Microservice</p>
                </div>
            </div>

            <div className="mt-12 border border-cyan-900/30 bg-cyan-950/10 p-8">
                <h3 className="text-cyan-400 uppercase tracking-widest text-xs mb-4 flex items-center gap-2">
                    <Target className="w-3 h-3" /> Quick Actions
                </h3>
                <div className="flex gap-4">
                    <a href="/admin/invoices" className="px-6 py-3 bg-cyan-950/40 border border-cyan-800 hover:border-cyan-400 text-cyan-50 text-[10px] uppercase tracking-widest transition-colors">
                        Generate Invoice
                    </a>
                    <a href="/admin/contracts" className="px-6 py-3 bg-cyan-950/40 border border-cyan-800 hover:border-cyan-400 text-cyan-50 text-[10px] uppercase tracking-widest transition-colors">
                        Draft Contract
                    </a>
                </div>
            </div>
        </div>
    );
}
