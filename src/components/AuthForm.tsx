import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { TrendingUp, Mail, Lock, User, AlertCircle, ShieldCheck, UserCheck } from 'lucide-react';

export const AuthForm = ({ mode }: { mode: 'signin' | 'signup' }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e?: React.FormEvent, demoCreds?: { email: string; pass: string }) => {
        if (e) e.preventDefault();
        setLoading(true);
        setError(null);

        const targetEmail = demoCreds ? demoCreds.email : email;
        const targetPass = demoCreds ? demoCreds.pass : password;

        try {
            if (mode === 'signup') {
                const { error } = await supabase.auth.signUp({
                    email: targetEmail,
                    password: targetPass,
                    options: {
                        data: { full_name: fullName },
                    },
                });
                if (error) throw error;
                alert('Success! You can now sign in.');
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email: targetEmail,
                    password: targetPass,
                });
                if (error) throw error;
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDemo = async (role: 'user' | 'admin') => {
        const creds = {
            email: role === 'admin' ? 'admin@demo.com' : 'user@demo.com',
            pass: 'password123'
        };
        setEmail(creds.email);
        setPassword(creds.pass);
        handleSubmit(undefined, creds);
    };

    return (
        <div className="flex-center" style={{ minHeight: '100vh', padding: '2rem' }}>
            <div className="card glass" style={{ width: '100%', maxWidth: '400px', padding: '2.5rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div className="btn-primary flex-center" style={{ width: '48px', height: '48px', borderRadius: '12px', margin: '0 auto 1rem' }}>
                        <TrendingUp size={28} />
                    </div>
                    <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>
                        {mode === 'signin' ? 'Welcome Back' : 'Create Account'}
                    </h2>
                    <p style={{ color: 'var(--text-secondary)' }}>
                        {mode === 'signin' ? 'Log in to manage your trades' : 'Start your investment journey today'}
                    </p>
                </div>

                {error && (
                    <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--error)', borderRadius: 'var(--radius-md)', padding: '0.75rem', marginBottom: '1.5rem', display: 'flex', gap: '0.75rem', alignItems: 'center', color: 'var(--error)', fontSize: '0.9rem' }}>
                        <AlertCircle size={18} />
                        {error}
                    </div>
                )}

                <form onSubmit={(e) => handleSubmit(e)} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {mode === 'signup' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Full Name</label>
                            <div style={{ position: 'relative' }}>
                                <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input
                                    type="text"
                                    required
                                    placeholder="John Doe"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    style={{ width: '100%', background: 'var(--bg-dark)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '0.75rem 0.75rem 0.75rem 2.5rem', color: 'white' }}
                                />
                            </div>
                        </div>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Email Address</label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                type="email"
                                required
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                style={{ width: '100%', background: 'var(--bg-dark)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '0.75rem 0.75rem 0.75rem 2.5rem', color: 'white' }}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Password</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                type="password"
                                required
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                style={{ width: '100%', background: 'var(--bg-dark)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '0.75rem 0.75rem 0.75rem 2.5rem', color: 'white' }}
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem', justifyContent: 'center' }} disabled={loading}>
                        {loading ? 'Processing...' : mode === 'signin' ? 'Sign In' : 'Sign Up'}
                    </button>
                </form>

                {mode === 'signin' && (
                    <div style={{ marginTop: '2rem', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
                        <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>OR EXPLORE OUR DEMO</p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <button onClick={() => handleDemo('user')} className="btn btn-ghost" style={{ fontSize: '0.8rem', gap: '0.5rem', border: '1px solid var(--border)' }}>
                                <UserCheck size={16} /> Demo User
                            </button>
                            <button onClick={() => handleDemo('admin')} className="btn btn-ghost" style={{ fontSize: '0.8rem', gap: '0.5rem', border: '1px solid var(--border)' }}>
                                <ShieldCheck size={16} /> Demo Admin
                            </button>
                        </div>
                    </div>
                )}

                <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>
                        {mode === 'signin' ? "Don't have an account? " : "Already have an account? "}
                    </span>
                    <button
                        onClick={() => window.location.href = mode === 'signin' ? '/signup' : '/signin'}
                        style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 600, cursor: 'pointer', padding: 0 }}
                    >
                        {mode === 'signin' ? 'Sign Up' : 'Sign In'}
                    </button>
                </div>
            </div>
        </div>
    );
};
