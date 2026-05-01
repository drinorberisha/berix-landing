import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ArrowRight, Lock } from 'lucide-react';

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
        <div className="min-h-screen bg-paper text-ink flex">
            {/* Left pane: editorial title block */}
            <div className="hidden md:flex flex-col justify-between w-[42%] border-r border-ink/12 bg-paperdeep/50 p-12">
                <Link
                    to="/"
                    className="font-display text-[24px] leading-none tracking-tightest text-ink hover:text-ember transition-colors"
                >
                    Berix
                    <span className="font-display italic font-light text-ember"> Systems</span>
                </Link>

                <div>
                    <div className="font-mono text-[11px] uppercase tracking-[0.28em] text-inkmute mb-6">
                        § Internal · Admin
                    </div>
                    <h1 className="font-display text-[64px] leading-[0.95] tracking-tightest text-ink">
                        Sign in to <span className="italic font-light">continue</span>.
                    </h1>
                    <p className="mt-7 max-w-md text-[14.5px] text-ink/75 leading-relaxed">
                        Restricted area. Authenticate with your Berix Systems
                        operator credentials. Sessions are managed by Supabase
                        and held only on this device.
                    </p>
                </div>

                <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-inkmute">
                    © {new Date().getFullYear()} Berix Systems LLC
                </div>
            </div>

            {/* Right pane: form */}
            <div className="flex-1 flex items-center justify-center p-6 md:p-12">
                <form onSubmit={handleLogin} className="w-full max-w-sm">
                    <div className="md:hidden mb-12 text-center">
                        <Link to="/" className="font-display text-[22px] tracking-tightest">
                            Berix<span className="italic font-light text-ember"> Systems</span>
                        </Link>
                        <div className="mt-3 font-mono text-[10px] uppercase tracking-[0.24em] text-inkmute">
                            Internal · Admin
                        </div>
                    </div>

                    <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-inkmute mb-2.5">
                        01 — Operator email
                    </div>
                    <input
                        type="email"
                        required
                        autoFocus
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@berixsystems.com"
                        className="w-full border-b-2 border-ink/20 bg-transparent pb-2.5 text-[16px] text-ink placeholder:text-ink/30 focus:outline-none focus:border-ink transition-colors"
                    />

                    <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-inkmute mt-10 mb-2.5">
                        02 — Password
                    </div>
                    <input
                        type="password"
                        required
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full border-b-2 border-ink/20 bg-transparent pb-2.5 text-[16px] text-ink placeholder:text-ink/30 focus:outline-none focus:border-ink transition-colors"
                    />

                    {error && (
                        <div
                            role="alert"
                            className="mt-8 border-l-2 border-ember bg-ember/5 px-4 py-3 text-[13px] text-emberdeep"
                        >
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="mt-12 w-full bg-ink text-paper py-4 font-mono text-[12px] uppercase tracking-[0.22em] hover:bg-ember transition-colors disabled:opacity-50 disabled:cursor-wait flex items-center justify-center gap-2 group"
                    >
                        {loading ? (
                            'Authenticating…'
                        ) : (
                            <>
                                Sign in
                                <ArrowRight
                                    className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5"
                                    strokeWidth={2}
                                />
                            </>
                        )}
                    </button>

                    <div className="mt-8 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-inkmute">
                        <Lock className="w-3 h-3" strokeWidth={2} />
                        Encrypted via Supabase Auth
                    </div>
                </form>
            </div>
        </div>
    );
}
