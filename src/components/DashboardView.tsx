import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Layout, PieChart, TrendingUp, Wallet, Bell, Settings, Award, ShieldCheck, DollarSign, Activity } from 'lucide-react';
import { CryptoChart } from './CryptoChart';
import { InvestmentPlan } from './InvestmentPlan';
import { WalletModal } from './WalletModal';
import { TransactionHistory } from './TransactionHistory';
import { motion, AnimatePresence } from 'framer-motion';

export const DashboardView = ({ session }: { session: any }) => {
    const [profile, setProfile] = useState<any>(null);
    const [investments, setInvestments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isWalletOpen, setIsWalletOpen] = useState(false);

    // Real-time Simulation State
    const [simBalance, setSimBalance] = useState<number>(0);
    const [simProfit, setSimProfit] = useState<number>(0);
    const isDemo = session?.user?.email?.endsWith('@demo.com');

    const plans = [
        { name: 'Bronze', min: '$100', max: '$499', roi: '10%', duration: '5 Days' },
        { name: 'Starter Plan', min: '$500', max: '$4,999', roi: '15%', duration: '7 Days' },
        { name: 'Professional', min: '$5,000', max: '$19,999', roi: '25%', duration: '14 Days', isPopular: true },
        { name: 'Platinum', min: '$20,000', max: '$99,999', roi: '40%', duration: '30 Days' },
        { name: 'VIP Diamond', min: '$100,000', max: 'Unlimited', roi: '60%', duration: '60 Days' },
    ];

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data: profileData, error: profileError } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', session.user.id)
                    .single();

                if (profileError) throw profileError;
                setProfile(profileData);
                setSimBalance(Number(profileData.balance || 0));
                setSimProfit(Number(profileData.profit || 0));

                const { data: investmentData, error: investmentError } = await supabase
                    .from('investments')
                    .select('*')
                    .eq('user_id', session.user.id);

                if (investmentError) throw investmentError;
                setInvestments(investmentData || []);
            } catch (err) {
                console.error('Error fetching dashboard data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();

        const profileSubscription = supabase
            .channel('profile-changes')
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${session.user.id}` }, (payload: any) => {
                setProfile(payload.new);
                // Only sync if not in active demo simulation or if it's a major update
                if (!isDemo) {
                    setSimBalance(Number(payload.new.balance || 0));
                    setSimProfit(Number(payload.new.profit || 0));
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(profileSubscription);
        };
    }, [session.user.id, isDemo]);

    // Profit Simulation Hook
    useEffect(() => {
        if (!isDemo || investments.length === 0) return;

        const interval = setInterval(() => {
            const increment = Math.random() * 0.15; // Random tiny increment
            setSimBalance(prev => prev + increment);
            setSimProfit(prev => prev + increment);
        }, 3000);

        return () => clearInterval(interval);
    }, [isDemo, investments.length]);

    const handleInvest = async (plan: any) => {
        const amountStr = prompt(`Enter amount to invest in ${plan.name} (Min: ${plan.min})`);
        if (!amountStr) return;

        const amount = parseFloat(amountStr.replace(/[^0-9.]/g, ''));
        if (isNaN(amount) || amount <= 0) {
            alert('Invalid amount');
            return;
        }

        if (amount > (profile?.balance || 0)) {
            alert('Insufficient balance');
            return;
        }

        try {
            const { error } = await supabase.from('investments').insert({
                user_id: session.user.id,
                plan_name: plan.name,
                amount: amount,
                expected_roi: parseFloat(plan.roi),
                status: 'active'
            });

            if (error) throw error;

            const { error: balanceError } = await supabase.from('profiles').update({
                balance: (profile.balance - amount)
            }).eq('id', session.user.id);

            if (balanceError) throw balanceError;

            alert('Investment successful!');
        } catch (err: any) {
            alert('Investment failed: ' + err.message);
        }
    };

    if (loading) return <div className="flex-center" style={{ flex: 1 }}>Loading Dashboard...</div>;

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    const sidebarItems = [
        { icon: <Layout size={20} />, label: 'Dashboard', active: true },
        { icon: <TrendingUp size={20} />, label: 'Plans', active: false, onClick: () => window.location.href = '/plans' },
        { icon: <PieChart size={20} />, label: 'Portfolio', active: false },
        { icon: <Wallet size={20} />, label: 'Wallet', active: false, onClick: () => setIsWalletOpen(true) },
        { icon: <Bell size={20} />, label: 'Activity', active: false },
        ...(profile?.is_admin ? [{ icon: <ShieldCheck size={20} />, label: 'Admin Panel', active: false, onClick: () => window.location.href = '/admin', special: true }] : []),
        { icon: <Settings size={20} />, label: 'Settings', active: false },
    ];

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            style={{ display: 'flex', flex: 1 }}
        >
            {/* Sidebar */}
            <motion.div variants={itemVariants} className="glass" style={{ width: '280px', height: 'calc(100vh - 80px)', margin: '1rem', borderRadius: 'var(--radius-lg)', padding: '1.5rem', position: 'sticky', top: '80px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {sidebarItems.map((item, idx) => (
                        <motion.div
                            key={idx}
                            whileHover={{ x: 4 }}
                            className={item.active ? 'btn-primary' : 'btn-ghost'}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem',
                                padding: '0.75rem 1rem',
                                borderRadius: 'var(--radius-md)',
                                cursor: 'pointer',
                                color: (item as any).special ? 'var(--primary)' : (item.active ? 'white' : 'var(--text-secondary)'),
                                border: item.active ? 'none' : 'transparent'
                            }}
                            onClick={(item as any).onClick}
                        >
                            {item.icon}
                            <span style={{ fontWeight: 600 }}>{item.label}</span>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* Main Content */}
            <main style={{ flex: 1, padding: '2rem' }}>
                <motion.header variants={itemVariants} style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                            <h1 style={{ fontSize: '2rem', margin: 0 }}>Welcome back, <span className="gradient-text">{profile?.full_name?.split(' ')[0] || 'Trader'}</span></h1>
                            {isDemo && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid var(--success)' }}
                                >
                                    <Activity size={12} /> LIVE TRADING ACTIVE
                                </motion.div>
                            )}
                        </div>
                        <p style={{ color: 'var(--text-secondary)' }}>Observe your portfolio performance and active trades.</p>
                    </div>
                    <button className="btn btn-primary" onClick={() => setIsWalletOpen(true)}>
                        <DollarSign size={20} /> Manage Wallet
                    </button>
                </motion.header>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
                    {[
                        { icon: <Wallet size={20} />, label: 'Total Balance', value: simBalance, isCurrency: true, sub: '+12.5% this month', color: 'var(--primary)', bg: 'rgba(59, 130, 246, 0.1)' },
                        { icon: <Award size={20} />, label: 'Active Investments', value: investments.reduce((acc, inv) => acc + (inv.status === 'active' ? (Number(inv.amount) || 0) : 0), 0), isCurrency: true, sub: `${investments.length} Active Plans`, color: '#eab308', bg: 'rgba(234, 179, 8, 0.1)' },
                        { icon: <ShieldCheck size={20} />, label: 'Total Profit', value: simProfit, isCurrency: true, sub: 'Lifetime earnings', color: 'var(--success)', bg: 'rgba(16, 185, 129, 0.1)' }
                    ].map((stat, idx) => (
                        <motion.div key={idx} variants={itemVariants} className="card glass-hover" onClick={idx === 0 ? () => setIsWalletOpen(true) : undefined} style={{ cursor: idx === 0 ? 'pointer' : 'default' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                <div className="flex-center" style={{ width: '40px', height: '40px', borderRadius: '10px', background: stat.bg, color: stat.color }}>
                                    {stat.icon}
                                </div>
                            </div>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>{stat.label}</p>
                            <AnimatePresence mode="wait">
                                <motion.h2
                                    key={stat.value}
                                    initial={{ opacity: 0.8, y: -2 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    style={{ fontSize: '1.75rem' }}
                                >
                                    {stat.isCurrency ? `$${stat.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : stat.value}
                                </motion.h2>
                            </AnimatePresence>
                            <p style={{ color: idx === 1 ? 'var(--text-muted)' : 'var(--success)', fontSize: '0.8rem', marginTop: '0.5rem' }}>{stat.sub}</p>
                        </motion.div>
                    ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                    <motion.div variants={itemVariants} className="card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3>Bitcoin / USD</h3>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button className="btn btn-ghost" style={{ padding: '0.25rem 0.75rem' }}>1H</button>
                                <button className="btn btn-primary" style={{ padding: '0.25rem 0.75rem' }}>1D</button>
                                <button className="btn btn-ghost" style={{ padding: '0.25rem 0.75rem' }}>1W</button>
                            </div>
                        </div>
                        <CryptoChart />
                    </motion.div>

                    <motion.div variants={itemVariants}>
                        <TransactionHistory userId={session.user.id} />
                    </motion.div>
                </div>

                <motion.section variants={itemVariants} style={{ marginTop: '4rem' }}>
                    <header style={{ textAlign: 'center', marginBottom: '3rem' }}>
                        <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Choose Your <span className="gradient-text">Profit Potential</span></h2>
                        <p style={{ color: 'var(--text-secondary)' }}>Secure investment plans designed for every tier of trader.</p>
                    </header>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
                        {plans.map((plan, idx) => (
                            <InvestmentPlan key={idx} {...plan} onSelect={() => handleInvest(plan)} />
                        ))}
                    </div>
                </motion.section>
            </main>

            <WalletModal
                isOpen={isWalletOpen}
                onClose={() => setIsWalletOpen(false)}
                userId={session.user.id}
                balance={profile?.balance || 0}
            />
        </motion.div>
    );
};
