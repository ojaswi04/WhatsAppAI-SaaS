import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

export default function LoginPage() {
  const { user, signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('login');

  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Signup state
  const [signupBusinessName, setSignupBusinessName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirm, setSignupConfirm] = useState('');
  const [signupWhatsapp, setSignupWhatsapp] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // If already logged in, redirect to dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  async function handleLogin(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(loginEmail, loginPassword);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to log in');
    } finally {
      setLoading(false);
    }
  }

  async function handleSignup(e) {
    e.preventDefault();
    setError('');

    if (signupPassword !== signupConfirm) {
      return setError('Passwords do not match');
    }
    if (!signupBusinessName.trim()) {
      return setError('Business name is required');
    }

    setLoading(true);

    try {
      await signUp(signupEmail, signupPassword, signupBusinessName, '₹', signupWhatsapp);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to sign up');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="landing-shell" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '90vh' }}>
      <div className="panel" style={{ maxWidth: '400px', width: '100%', padding: '32px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div className="brand-mark" style={{ justifyContent: 'center', marginBottom: '8px' }}>
            <span className="brand-dot" aria-hidden="true" />
            <span>WhatsAppAI</span>
          </div>
          <p className="status-muted">Manage your WhatsApp business</p>
        </div>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
          <button
            className={activeTab === 'login' ? 'primary-btn' : 'secondary-btn'}
            style={{ flex: 1, padding: '10px' }}
            onClick={() => { setActiveTab('login'); setError(''); }}
          >
            Log In
          </button>
          <button
            className={activeTab === 'signup' ? 'primary-btn' : 'secondary-btn'}
            style={{ flex: 1, padding: '10px' }}
            onClick={() => { setActiveTab('signup'); setError(''); }}
          >
            Sign Up
          </button>
        </div>

        {error && (
          <div className="status-error" style={{ marginBottom: '16px', padding: '12px', background: '#fef2f2', borderRadius: '8px', border: '1px solid #fecaca' }}>
            {error}
          </div>
        )}

        {activeTab === 'login' ? (
          <form onSubmit={handleLogin} className="stacked-form">
            <label>
              Email
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </label>
            <label>
              Password
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
              />
            </label>
            <button className="primary-btn" type="submit" disabled={loading} style={{ marginTop: '8px' }}>
              {loading ? 'Logging in...' : 'Log In'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSignup} className="stacked-form">
            <label>
              Business Name
              <input
                type="text"
                required
                value={signupBusinessName}
                onChange={(e) => setSignupBusinessName(e.target.value)}
                placeholder="UrbanWear Store"
              />
            </label>
            <label>
              Email
              <input
                type="email"
                required
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
              />
            </label>
            <label>
              WhatsApp Number
              <input
                type="tel"
                required
                value={signupWhatsapp}
                onChange={(e) => setSignupWhatsapp(e.target.value)}
                placeholder="1234567890"
              />
            </label>
            <label>
              Password
              <input
                type="password"
                required
                value={signupPassword}
                onChange={(e) => setSignupPassword(e.target.value)}
              />
            </label>
            <label>
              Confirm Password
              <input
                type="password"
                required
                value={signupConfirm}
                onChange={(e) => setSignupConfirm(e.target.value)}
              />
            </label>
            <button className="primary-btn" type="submit" disabled={loading} style={{ marginTop: '8px' }}>
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
