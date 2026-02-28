import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { supabase } from './lib/supabase';
import type { Session } from '@supabase/supabase-js';
import { AuthForm } from './components/AuthForm';
import { DashboardView } from './components/DashboardView';
import { AdminView } from './components/AdminView';
import { PlansPage } from './components/PlansPage';
import { TrendingUp, LogOut, ShieldCheck } from 'lucide-react';
import './index.css';

// Navbar Component
const Navbar = ({ session, profile }: { session: any; profile: any }) => (
  <nav className="glass" style={{ position: 'sticky', top: 0, zIndex: 100, padding: '1.5rem 0' }}>
    <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none', color: 'inherit' }}>
        <div className="btn-primary flex-center" style={{ width: '44px', height: '44px', borderRadius: '12px' }}>
          <TrendingUp size={26} />
        </div>
        <span style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.7px' }}>
          Digital <span className="gradient-text">Trade</span>
        </span>
      </Link>

      <div style={{ display: 'flex', gap: '2.5rem', alignItems: 'center' }}>
        <Link to="/plans" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: 500, transition: 'color 0.2s' }}>Plans</Link>
        <a href="#" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: 500 }}>Markets</a>

        {!session ? (
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Link to="/signin" className="btn btn-ghost">Login</Link>
            <Link to="/signup" className="btn btn-primary" style={{ padding: '0.6rem 1.5rem' }}>Get Started</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            {profile?.is_admin && (
              <Link to="/admin" className="btn btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)' }}>
                <ShieldCheck size={18} /> Admin
              </Link>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              <span style={{ color: 'var(--text-primary)', fontSize: '0.9rem', fontWeight: 600 }}>{profile?.full_name || 'User'}</span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{session.user.email}</span>
            </div>
            <button className="btn btn-ghost" style={{ padding: '0.5rem', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} onClick={() => supabase.auth.signOut()}>
              <LogOut size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  </nav>
);

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }: any) => {
      const session = data.session;
      setSession(session);
      if (session) fetchProfile(session.user.id);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: string, session: any) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
      else setProfile(null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
    setProfile(data);
  };

  return (
    <Router>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar session={session} profile={profile} />
        <Routes>
          <Route path="/" element={session ? <DashboardView session={session} /> : <Navigate to="/plans" />} />
          <Route path="/plans" element={<PlansPage />} />
          <Route path="/admin" element={session && profile?.is_admin ? <AdminView session={session} /> : <Navigate to="/" />} />
          <Route path="/signin" element={!session ? <AuthForm mode="signin" /> : <Navigate to="/" />} />
          <Route path="/signup" element={!session ? <AuthForm mode="signup" /> : <Navigate to="/" />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}
