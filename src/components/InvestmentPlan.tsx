import { Check } from 'lucide-react';

interface PlanProps {
    name: string;
    min: string;
    max: string;
    roi: string;
    duration: string;
    isPopular?: boolean;
    onSelect?: () => void;
}

export const InvestmentPlan = ({ name, min, max, roi, duration, isPopular, onSelect }: PlanProps) => {
    return (
        <div className="card glass-hover" style={{
            position: 'relative',
            border: isPopular ? '2px solid var(--primary)' : '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
        }}>
            {isPopular && (
                <span style={{
                    position: 'absolute',
                    top: '-12px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'var(--primary)',
                    color: 'white',
                    padding: '2px 12px',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    fontWeight: 700
                }}>POPULAR</span>
            )}
            <h4 style={{ fontSize: '1.25rem' }}>{name}</h4>
            <div>
                <h2 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>{roi}</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>After {duration}</p>
            </div>

            <div style={{ padding: '1rem 0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Min Deposit:</span>
                    <span>{min}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Max Deposit:</span>
                    <span>{max}</span>
                </div>
            </div>

            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <li style={{ display: 'flex', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    <Check size={16} style={{ color: 'var(--success)' }} /> 24/7 Support
                </li>
                <li style={{ display: 'flex', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    <Check size={16} style={{ color: 'var(--success)' }} /> Instant Withdrawals
                </li>
                <li style={{ display: 'flex', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    <Check size={16} style={{ color: 'var(--success)' }} /> Secure Platform
                </li>
            </ul>

            <button
                className={`btn ${isPopular ? 'btn-primary' : 'btn-ghost'}`}
                style={{ width: '100%', marginTop: 'auto' }}
                onClick={onSelect}
            >
                Select Plan
            </button>
        </div>
    );
};
