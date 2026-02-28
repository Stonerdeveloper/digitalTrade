import { motion } from 'framer-motion';
import { ArrowRight, Zap, Target, Crown, Diamond } from 'lucide-react';
import { InvestmentPlan } from './InvestmentPlan';

export const PlansPage = () => {
    const allPlans = [
        { name: 'Bronze', min: '$100', max: '$499', roi: '10%', duration: '5 Days', icon: <Zap size={24} /> },
        { name: 'Starter Plan', min: '$500', max: '$4,999', roi: '15%', duration: '7 Days', icon: <Target size={24} /> },
        { name: 'Professional', min: '$5,000', max: '$19,999', roi: '25%', duration: '14 Days', isPopular: true, icon: <Crown size={24} /> },
        { name: 'Platinum', min: '$20,000', max: '$99,999', roi: '40%', duration: '30 Days', icon: <Diamond size={24} /> },
        { name: 'VIP Diamond', min: '$100,000', max: 'Unlimited', roi: '60%', duration: '60 Days', icon: <Diamond size={24} /> },
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-dark)', paddingTop: '4rem', paddingBottom: '6rem' }}>
            <div className="container">
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={containerVariants}
                    style={{ textAlign: 'center', marginBottom: '5rem' }}
                >
                    <motion.h1 variants={itemVariants} style={{ fontSize: '3.5rem', marginBottom: '1.5rem', fontWeight: 900 }}>
                        Maximum <span className="gradient-text">Profit Potential</span>
                    </motion.h1>
                    <motion.p variants={itemVariants} style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', maxWidth: '700px', margin: '0 auto' }}>
                        Choose a plan that fits your ambition. From entry-level growth to institutional-grade returns.
                    </motion.p>
                </motion.div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
                    {allPlans.map((plan, idx) => (
                        <motion.div key={idx} variants={itemVariants}>
                            <InvestmentPlan {...plan} onSelect={() => window.location.href = '/signup'} />
                        </motion.div>
                    ))}
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    className="card glass"
                    style={{ marginTop: '6rem', padding: '4rem', textAlign: 'center' }}
                >
                    <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>Ready to start earning?</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem', maxWidth: '600px', margin: '0 auto 2.5rem' }}>
                        Join over 50,000+ traders scaling their wealth with OnxTrades. 24/7 support and instant withdrawals guaranteed.
                    </p>
                    <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center' }}>
                        <button className="btn btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1.1rem' }} onClick={() => window.location.href = '/signup'}>
                            Create Free Account <ArrowRight size={20} style={{ marginLeft: '10px' }} />
                        </button>
                        <button className="btn btn-ghost" style={{ padding: '1rem 2.5rem', fontSize: '1.1rem' }} onClick={() => window.location.href = '/signin'}>
                            Explore Demo
                        </button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};
