import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Users, CreditCard, Settings, Check, X, Search, DollarSign, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const AdminView = ({ session }: { session: any }) => {
    const [activeTab, setActiveTab] = useState<'users' | 'withdrawals' | 'settings'>('users');
    const [users, setUsers] = useState<any[]>([]);
    const [withdrawals, setWithdrawals] = useState<any[]>([]);
    const [settings, setSettings] = useState<any>({});
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        try {
            if (activeTab === 'users') {
                const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
                setUsers(data || []);
            } else if (activeTab === 'withdrawals') {
                const { data } = await supabase.from('transactions')
                    .select('*, profiles(email, full_name)')
                    .eq('type', 'withdrawal')
                    .order('created_at', { ascending: false });
                setWithdrawals(data || []);
            } else if (activeTab === 'settings') {
                const { data } = await supabase.from('settings').select('*');
                const settingsObj = data?.reduce((acc: any, curr: any) => ({ ...acc, [curr.key]: curr.value }), {});
                setSettings(settingsObj || {});
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleUpdateUser = async (userId: string, updates: any) => {
        try {
            const { error } = await supabase.from('profiles').update(updates).eq('id', userId);
            if (error) throw error;
            setUsers(users.map(u => u.id === userId ? { ...u, ...updates } : u));
        } catch (err: any) {
            alert(err.message);
        }
    };

    const handleWithdrawalAction = async (txId: string, status: 'completed' | 'failed', userId: string, amount: number) => {
        try {
            const { error } = await supabase.from('transactions').update({ status }).eq('id', txId);
            if (error) throw error;

            if (status === 'failed') {
                // Refund user if withdrawal is denied
                const { data: profile } = await supabase.from('profiles').select('balance').eq('id', userId).single();
                await supabase.from('profiles').update({ balance: (Number(profile?.balance || 0) + Number(amount)) }).eq('id', userId);
            }

            setWithdrawals(withdrawals.map(w => w.id === txId ? { ...w, status } : w));
        } catch (err: any) {
            alert(err.message);
        }
    };

    const handleSaveSetting = async (key: string, value: string) => {
        try {
            const { error } = await supabase.from('settings').upsert({ key, value });
            if (error) throw error;
            alert('Setting updated!');
        } catch (err: any) {
            alert(err.message);
        }
    };

    const filteredUsers = users.filter(u =>
        u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div style={{ display: 'flex', flex: 1, minHeight: 'calc(100vh - 80px)' }}>
            {/* Admin Sidebar */}
            <div className="glass" style={{ width: '280px', margin: '1rem', borderRadius: 'var(--radius-lg)', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h3 style={{ marginBottom: '1rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <ShieldCheck size={20} /> Admin Core
                </h3>
                {[
                    { id: 'users', icon: <Users size={20} />, label: 'User Management' },
                    { id: 'withdrawals', icon: <CreditCard size={20} />, label: 'Withdrawal Requests' },
                    { id: 'settings', icon: <Settings size={20} />, label: 'Global Settings' },
                ].map(tab => (
                    <button
                        key={tab.id}
                        className={activeTab === tab.id ? 'btn-primary' : 'btn-ghost'}
                        style={{ width: '100%', justifyContent: 'flex-start', gap: '1rem', border: 'none' }}
                        onClick={() => setActiveTab(tab.id as any)}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}

                <div style={{ marginTop: 'auto', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <p>Logged in as Admin</p>
                    <p>{session.user.email}</p>
                </div>
            </div>

            {/* Admin Main Content */}
            <main style={{ flex: 1, padding: '2rem' }}>
                <header style={{ marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.8rem' }}>Admin / <span className="gradient-text">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</span></h2>
                </header>

                <AnimatePresence mode="wait">
                    {activeTab === 'users' && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                            <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem' }}>
                                <div style={{ flex: 1, position: 'relative' }}>
                                    <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                    <input
                                        type="text"
                                        placeholder="Search users by name or email..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        style={{ width: '100%', background: 'var(--bg-dark)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '0.75rem 0.75rem 0.75rem 3rem', color: 'white' }}
                                    />
                                </div>
                            </div>

                            <div className="card glass" style={{ overflow: 'hidden', padding: 0 }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)' }}>
                                            <th style={{ padding: '1.25rem' }}>User</th>
                                            <th style={{ padding: '1.25rem' }}>Balance</th>
                                            <th style={{ padding: '1.25rem' }}>Total Profit</th>
                                            <th style={{ padding: '1.25rem' }}>Joined</th>
                                            <th style={{ padding: '1.25rem' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredUsers.map((user) => (
                                            <tr key={user.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                                <td style={{ padding: '1.25rem' }}>
                                                    <div style={{ fontWeight: 600 }}>{user.full_name || 'N/A'}</div>
                                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{user.email}</div>
                                                    {user.is_admin && <span style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 'bold' }}>ADMIN</span>}
                                                </td>
                                                <td style={{ padding: '1.25rem' }}>${user.balance?.toLocaleString()}</td>
                                                <td style={{ padding: '1.25rem', color: 'var(--success)' }}>+${user.profit?.toLocaleString()}</td>
                                                <td style={{ padding: '1.25rem', fontSize: '0.85rem' }}>{new Date(user.created_at).toLocaleDateString()}</td>
                                                <td style={{ padding: '1.25rem' }}>
                                                    <button
                                                        className="btn btn-ghost"
                                                        style={{ padding: '0.5rem', height: 'auto' }}
                                                        onClick={() => {
                                                            const amountText = prompt(`Adjustment for ${user.email} (e.g., 500 or -200):`);
                                                            if (amountText) {
                                                                const newBalance = Number(user.balance) + parseFloat(amountText);
                                                                handleUpdateUser(user.id, { balance: newBalance });
                                                            }
                                                        }}
                                                    >
                                                        <DollarSign size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'withdrawals' && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                            <div className="card glass" style={{ overflow: 'hidden', padding: 0 }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)' }}>
                                            <th style={{ padding: '1.25rem' }}>User</th>
                                            <th style={{ padding: '1.25rem' }}>Amount</th>
                                            <th style={{ padding: '1.25rem' }}>Date</th>
                                            <th style={{ padding: '1.25rem' }}>Status</th>
                                            <th style={{ padding: '1.25rem' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {withdrawals.map((tx) => (
                                            <tr key={tx.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                                <td style={{ padding: '1.25rem' }}>
                                                    <div style={{ fontWeight: 600 }}>{tx.profiles?.full_name}</div>
                                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{tx.profiles?.email}</div>
                                                </td>
                                                <td style={{ padding: '1.25rem', fontWeight: 700 }}>${tx.amount.toLocaleString()}</td>
                                                <td style={{ padding: '1.25rem', fontSize: '0.85rem' }}>{new Date(tx.created_at).toLocaleString()}</td>
                                                <td style={{ padding: '1.25rem' }}>
                                                    <span style={{
                                                        fontSize: '0.75rem',
                                                        padding: '0.25rem 0.75rem',
                                                        borderRadius: '10px',
                                                        background: tx.status === 'pending' ? 'rgba(234, 179, 8, 0.1)' : tx.status === 'completed' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                                        color: tx.status === 'pending' ? '#eab308' : tx.status === 'completed' ? 'var(--success)' : 'var(--error)'
                                                    }}>
                                                        {tx.status}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '1.25rem' }}>
                                                    {tx.status === 'pending' && (
                                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                            <button onClick={() => handleWithdrawalAction(tx.id, 'completed', tx.user_id, tx.amount)} className="btn btn-ghost" style={{ color: 'var(--success)', padding: '0.5rem' }}>
                                                                <Check size={18} />
                                                            </button>
                                                            <button onClick={() => handleWithdrawalAction(tx.id, 'failed', tx.user_id, tx.amount)} className="btn btn-ghost" style={{ color: 'var(--error)', padding: '0.5rem' }}>
                                                                <X size={18} />
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'settings' && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} style={{ maxWidth: '600px' }}>
                            <div className="card glass">
                                <h3 style={{ marginBottom: '1.5rem' }}>System Configurations</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>BTC Deposit Address</label>
                                        <div style={{ display: 'flex', gap: '1rem' }}>
                                            <input
                                                type="text"
                                                defaultValue={settings.deposit_address}
                                                onBlur={(e) => handleSaveSetting('deposit_address', e.target.value)}
                                                style={{ flex: 1, background: 'var(--bg-dark)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '0.75rem', color: 'white' }}
                                            />
                                        </div>
                                    </div>
                                    <div style={{ padding: '1rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: 'var(--radius-md)', border: '1px solid var(--primary-glow)', fontSize: '0.85rem' }}>
                                        <p>Changing these settings will reflect instantly across all user dashboards.</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
};
