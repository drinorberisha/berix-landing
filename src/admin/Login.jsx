import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Target, Lock } from 'lucide-react';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const { error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            navigate('/admin/dashboard');
        }
    };

    return (
        <div className="min-h-screen bg-[#000810] flex items-center justify-center p-4 font-mono relative overflow-hidden">
            <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0),rgba(255,255,255,0)_50%,rgba(0,0,0,0.1)_50%,rgba(0,0,0,0.1))] bg-[length:100%_4px] pointer-events-none z-0" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-cyan-900/10 rounded-full opacity-20 pointer-events-none animate-[spin_60s_linear_infinite]" />

            <div className="w-full max-w-md bg-black/60 border border-cyan-900/50 p-8 shadow-[0_0_30px_rgba(0,243,255,0.05)] relative z-10 backdrop-blur-md">
                <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-amber-400"></div>
                <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-amber-400"></div>

                <div className="flex flex-col items-center mb-8">
                    <Target className="w-12 h-12 text-cyan-500 mb-4 animate-spin-slow" />
                    <h1 className="text-2xl font-bold text-white tracking-widest uppercase">Admin Uplink</h1>
                    <p className="text-cyan-600 text-[10px] mt-2 tracking-widest">[ SECURE AUTHENTICATION REQUIRED ]</p>
                </div>

                {error && (
                    <div className="bg-red-950/30 border border-red-500/50 p-4 text-red-400 text-[10px] uppercase tracking-wide mb-6">
                        [!] ERROR: {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-cyan-500 text-[10px] tracking-widest uppercase mb-2">OPERATOR EMAIL</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-cyan-950/20 border border-cyan-900/50 p-3 text-cyan-50 text-sm focus:outline-none focus:border-cyan-400 transition-colors"
                        />
                    </div>
                    <div>
                        <label className="block text-cyan-500 text-[10px] tracking-widest uppercase mb-2 flex items-center gap-2">
                            <Lock className="w-3 h-3" /> DECRYPTION KEY (PASSWORD)
                        </label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-cyan-950/20 border border-cyan-900/50 p-3 text-cyan-50 text-sm focus:outline-none focus:border-cyan-400 transition-colors"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full mt-4 bg-cyan-950/50 hover:bg-cyan-900/80 border border-cyan-500/50 hover:border-cyan-400 text-cyan-400 py-4 text-xs font-bold uppercase tracking-[0.2em] transition-all disabled:opacity-50"
                    >
                        {loading ? 'AUTHENTICATING...' : 'INITIALIZE LOGIN'}
                    </button>
                </form>
            </div>
        </div>
    );
}
