import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { X, Copy, Check } from 'lucide-react';

export const WalletModal = ({ isOpen, onClose, userId, balance }: { isOpen: boolean; onClose: () => void; userId: string; balance: number }) => {
    const [tab, setTab] = useState<'deposit' | 'withdraw'>('deposit');
    const [amount, setAmount] = useState('');
    const [address, setAddress] = useState('Loading...');
    const [copied, setCopied] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchDepositAddress();
        }
    }, [isOpen]);

    const fetchDepositAddress = async () => {
        const { data } = await supabase.from('settings').select('value').eq('key', 'deposit_address').single();
        if (data) setAddress(data.value);
        else setAddress('bc1qxy2kgdyrjrsqz7u6u67js8yp5z2n5a5fs4af32'); // Fallback
    };

    const copyAddress = () => {
        navigator.clipboard.writeText(address);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleWithdraw = async (e: React.FormEvent) => {
        e.preventDefault();
        const withdrawAmount = parseFloat(amount);
        if (isNaN(withdrawAmount) || withdrawAmount <= 0) return alert('Invalid amount');
        if (withdrawAmount > balance) return alert('Insufficient balance');

        setLoading(true);
        try {
            const { error } = await supabase.from('transactions').insert({
                user_id: userId,
                type: 'withdrawal',
                amount: withdrawAmount,
                status: 'pending',
                description: 'Withdrawal to external wallet'
            });
            if (error) throw error;

            alert('Withdrawal request submitted!');
            onClose();
        } catch (err: any) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="flex-center" style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)' }}>
            <div className="card glass" style={{ width: '100%', maxWidth: '450px', position: 'relative' }}>
                <button onClick={onClose} style={{ position: 'absolute', right: '1.5rem', top: '1.5rem', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                    <X size={24} />
                </button>

                <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
                    <button
                        className={`btn ${tab === 'deposit' ? 'btn-primary' : 'btn-ghost'}`}
                        style={{ flex: 1, border: 'none' }}
                        onClick={() => setTab('deposit')}
                    >
                        Deposit
                    </button>
                    <button
                        className={`btn ${tab === 'withdraw' ? 'btn-primary' : 'btn-ghost'}`}
                        style={{ flex: 1, border: 'none' }}
                        onClick={() => setTab('withdraw')}
                    >
                        Withdraw
                    </button>
                </div>

                {tab === 'deposit' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div style={{ textAlign: 'center' }}>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>Send BTC to the address below</p>
                            <div style={{ background: 'var(--bg-dark)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <code style={{ flex: 1, fontSize: '0.85rem', wordBreak: 'break-all' }}>{address}</code>
                                <button onClick={copyAddress} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer' }}>
                                    {copied ? <Check size={18} /> : <Copy size={18} />}
                                </button>
                            </div>
                        </div>
                        <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--primary-glow)' }}>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                <strong>Note:</strong> Deposits are credited after 2 network confirmations. Ensure you send only BTC to this address.
                            </p>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleWithdraw} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Amount to Withdraw</label>
                            <input
                                type="number"
                                placeholder="0.00"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                style={{ background: 'var(--bg-dark)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '0.75rem', color: 'white' }}
                            />
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Available: ${balance.toLocaleString()}</p>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Wallet Address</label>
                            <input
                                type="text"
                                placeholder="External BTC/USDT Address"
                                style={{ background: 'var(--bg-dark)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '0.75rem', color: 'white' }}
                            />
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
                            {loading ? 'Processing...' : 'Request Withdrawal'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};
