import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { ArrowDownLeft, ArrowUpRight, Clock } from 'lucide-react';

interface Transaction {
    id: string;
    user_id: string;
    type: string;
    amount: number;
    status: string;
    created_at: string;
    description: string;
}

export const TransactionHistory = ({ userId }: { userId: string }) => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTransactions();

        const subscription = supabase
            .channel('tx-changes')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'transactions', filter: `user_id=eq.${userId}` }, (payload: any) => {
                setTransactions(prev => [payload.new, ...prev]);
            })
            .subscribe();

        return () => {
            supabase.removeChannel(subscription);
        };
    }, [userId]);

    const fetchTransactions = async () => {
        try {
            const { data } = await supabase
                .from('transactions')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            setTransactions(data || []);
        } catch (err) {
            console.error('Error fetching transactions:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Loading activity...</div>;

    return (
        <div className="card glass" style={{ height: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <Clock size={20} style={{ color: 'var(--primary)' }} />
                <h3 style={{ margin: 0 }}>Recent Activity</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {transactions.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0' }}>No transactions yet.</p>
                ) : (
                    transactions.map((tx) => (
                        <div key={tx.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)' }}>
                            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                <div className="flex-center" style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '8px',
                                    background: tx.type === 'withdrawal' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                                    color: tx.type === 'withdrawal' ? 'var(--error)' : 'var(--success)'
                                }}>
                                    {tx.type === 'withdrawal' ? <ArrowUpRight size={16} /> : <ArrowDownLeft size={16} />}
                                </div>
                                <div>
                                    <p style={{ fontSize: '0.9rem', fontWeight: 600, margin: 0 }}>{tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}</p>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>{new Date(tx.created_at).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <p style={{ fontSize: '0.9rem', fontWeight: 700, margin: 0, color: tx.type === 'withdrawal' ? 'var(--error)' : 'var(--success)' }}>
                                    {tx.type === 'withdrawal' ? '-' : '+'}${tx.amount.toLocaleString()}
                                </p>
                                <p style={{ fontSize: '0.7rem', color: tx.status === 'pending' ? '#eab308' : 'var(--text-muted)', margin: 0 }}>{tx.status}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
