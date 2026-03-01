import { FileSignature, Target } from 'lucide-react';

export default function Contracts() {
    return (
        <div className="space-y-8 animate-fade-in">
            <header className="flex justify-between items-end mb-12 border-b border-cyan-900/30 pb-6">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-widest uppercase flex items-center gap-3">
                        <FileSignature className="w-6 h-6 text-cyan-500" /> Contract Generator
                    </h1>
                    <p className="text-cyan-600 text-[10px] uppercase tracking-widest mt-2">Initialize Legal Parameters for LaTeX Compilation</p>
                </div>
            </header>

            <div className="bg-black/60 border border-cyan-900/50 p-6 relative">
                <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-cyan-500/50"></div>

                <div className="text-center py-24">
                    <Target className="w-12 h-12 text-cyan-500/30 mx-auto mb-4 animate-spin-slow" />
                    <h3 className="text-amber-400 font-mono tracking-widest uppercase mb-2">MODULE OFFLINE</h3>
                    <p className="text-cyan-600/50 text-xs font-mono tracking-widest">
                        Awaiting Contract LaTeX Template injection. Please provide structural .tex file to enable compilation.
                    </p>
                </div>
            </div>
        </div>
    );
}
