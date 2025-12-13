import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight, Mail, Lock, Sparkles, CheckCircle2, Cpu, ShieldCheck, Globe } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const COLORS = {
  bg: '#050505',
  card: '#141414',
  primary: '#FFE066',
  ai: '#8B5CF6',
  textMuted: '#888888',
};

const styles = `
  @keyframes orbit-rotate { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
  @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-20px); } }
  .orbit-ring { animation: orbit-rotate 60s linear infinite; }
  .orbit-ring-reverse { animation: orbit-rotate 80s linear infinite reverse; }
  .floating-card { animation: float 6s ease-in-out infinite; }
  .bg-grid-pattern {
    background-size: 40px 40px;
    background-image: linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
                      linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
  }
  /* Login → Dashboard playful transition */
  @keyframes burstGrow { 0% { transform: scale(0.2); opacity: 0.9; } 60% { transform: scale(35); opacity: 0.8; } 100% { transform: scale(60); opacity: 0; } }
  .login-transition-overlay { position: fixed; inset: 0; z-index: 1000; display: flex; align-items: center; justify-content: center; pointer-events: none; }
  .login-transition-burst { width: 32px; height: 32px; border-radius: 9999px; background: radial-gradient(circle at 30% 30%, #FFE066 0%, #8B5CF6 60%, #050505 100%); box-shadow: 0 0 80px rgba(255,224,102,0.4), 0 0 120px rgba(139,92,246,0.15); animation: burstGrow 900ms ease-in forwards; }
`;

const InputField = ({ label, type, placeholder, icon, value, onChange }) => (
  <div className="space-y-2 group">
    <label className="text-xs font-bold text-[#666] uppercase tracking-wider group-focus-within:text-[#FFE066] transition-colors">
      {label}
    </label>
    <div className="relative">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#666] group-focus-within:text-white transition-colors">
        {icon}
      </div>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full bg-[#0A0A0A] border border-[#222] rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-[#444] focus:outline-none focus:border-[#FFE066] focus:ring-1 focus:ring-[#FFE066]/20 transition-all font-medium"
      />
    </div>
  </div>
);

const Login = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [busy, setBusy] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const { user, login, register, resetPassword, loginWithGoogle, loginWithTwitter, loginWithGithub } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  useEffect(() => { setIsLoaded(true); }, []);

  const startTransitionAndNavigate = (to) => {
    setIsTransitioning(true);
    // Navigate after the burst animation completes
    setTimeout(() => {
      navigate(to, { replace: true });
    }, 900);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErrorMsg('');
    console.info('[Login] submit', { mode, email });
    try {
      if (mode === 'login') {
        await login(email, password);
        console.info('[Login] login success, animating & navigating', { to: from });
        startTransitionAndNavigate(from);
      } else {
        await register(email, password);
        console.info('[Login] register success, animating & navigating', { to: from });
        startTransitionAndNavigate(from);
      }
    } catch (err) {
      console.error('[Login] auth error', { code: err?.code, message: err?.message });
      const msg = (() => {
        const code = err?.code || '';
        if (code.includes('wrong-password') || code.includes('invalid-credential')) return 'Incorrect email or password.';
        if (code.includes('user-not-found')) return 'No account found for this email.';
        if (code.includes('network-request-failed')) return mode === 'login' ? 'Incorrect email or password.' : 'Network error. Check internet and Firebase Authorized Domains.';
        return err?.message || 'Authentication error';
      })();
      setErrorMsg(msg);
    } finally {
      setBusy(false);
    }
  };

  const handleReset = async () => {
    if (!email) {
      setErrorMsg('Enter your email to reset your password.');
      return;
    }
    setBusy(true);
    try { await resetPassword(email); setErrorMsg('Password reset email sent.'); }
    catch (err) { console.error('[Login] reset error', { code: err?.code, message: err?.message }); setErrorMsg(err?.message || 'Reset error'); }
    finally { setBusy(false); }
  };

  const handleGoogle = async () => {
    setBusy(true);
    setErrorMsg('');
    console.info('[Login] Google sign-in click');
    try {
      await loginWithGoogle();
      console.info('[Login] Google success, animating & navigating', { to: from });
      startTransitionAndNavigate(from);
    } catch (err) {
      console.error('[Login] Google error', { code: err?.code, message: err?.message });
      setErrorMsg(err?.message || 'Google sign-in failed');
    } finally {
      setBusy(false);
    }
  };

  const handleTwitter = async () => {
    setBusy(true);
    setErrorMsg('');
    console.info('[Login] Twitter sign-in click');
    try {
      await loginWithTwitter();
      console.info('[Login] Twitter success, animating & navigating', { to: from });
      startTransitionAndNavigate(from);
    } catch (err) {
      console.error('[Login] Twitter error', { code: err?.code, message: err?.message });
      setErrorMsg(err?.message || 'X sign-in failed');
    } finally {
      setBusy(false);
    }
  };

  const handleGithub = async () => {
    setBusy(true);
    setErrorMsg('');
    console.info('[Login] GitHub sign-in click');
    try {
      await loginWithGithub();
      console.info('[Login] GitHub success, animating & navigating', { to: from });
      startTransitionAndNavigate(from);
    } catch (err) {
      console.error('[Login] GitHub error', { code: err?.code, message: err?.message });
      setErrorMsg(err?.message || 'GitHub sign-in failed');
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    if (user) {
      console.info('[Login] user detected, auto-navigate', { to: from, uid: user?.uid });
      navigate(from, { replace: true });
    }
  }, [user, from, navigate]);

  return (
    <div className="min-h-screen w-full flex bg-[#050505] text-white font-sans overflow-hidden relative selection:bg-[#FFE066] selection:text-black">
      <style>{styles}</style>
      {isTransitioning && (
        <div className="login-transition-overlay">
          <div className="login-transition-burst" />
        </div>
      )}

      <div className="absolute inset-0 bg-grid-pattern opacity-50 z-0 pointer-events-none"></div>

      <div className="w-full lg:w-[45%] xl:w-[40%] flex flex-col justify-center items-center relative z-20 p-8 lg:p-16 border-r border-[#111] bg-[#050505]/95 backdrop-blur-sm">
        <div className={`w-full max-w-md space-y-8 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="mb-12">
            <img src="/web-app-manifest-512x512.png" alt="Orbit Logo" className="w-12 h-12 rounded-2xl mb-6 shadow-[0_0_30px_rgba(255,224,102,0.2)]" />
            <h1 className="text-4xl font-bold tracking-tight mb-2">Dive into the Orbit.</h1>
            <p className="text-[#888]">Your command center for DeFi yields, looping strategies, and cross-chain risk management.</p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <InputField label="Email Address" type="email" placeholder="commander@orbit.fi" icon={<Mail size={18} />} value={email} onChange={(e) => setEmail(e.target.value)} />
            <div className="space-y-2">
              <InputField label="Password" type="password" placeholder="••••••••••••" icon={<Lock size={18} />} value={password} onChange={(e) => setPassword(e.target.value)} />
              <div className="flex justify-between text-xs">
                <button type="button" onClick={handleReset} className="text-[#666] hover:text-[#FFE066] transition-colors">Forgot Password?</button>
                <button type="button" onClick={() => setMode(mode === 'login' ? 'register' : 'login')} className="text-[#666] hover:text-[#FFE066] transition-colors">
                  {mode === 'login' ? 'Create Account' : 'Have an account? Sign In'}
                </button>
              </div>
            </div>

            <button disabled={busy} className="w-full py-4 rounded-xl bg-[#FFE066] text-black font-bold text-lg hover:bg-[#FFD633] transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-[#FFE066]/20 flex items-center justify-center gap-2 group">
              <span>{mode === 'login' ? 'Initialize Session' : 'Create Account'}</span>
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
            {errorMsg && (
              <div className="mt-3 text-sm text-red-400">{errorMsg}</div>
            )}
          </form>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={handleGoogle} className="px-3 py-2 rounded-lg bg-[#0A0A0A] border border-[#222] text-sm hover:border-[#FFE066]">Sign in with Google</button>
            <button type="button" onClick={handleTwitter} className="px-3 py-2 rounded-lg bg-[#0A0A0A] border border-[#222] text-sm hover:border-[#FFE066]">Sign in with X</button>
            <button type="button" onClick={handleGithub} className="px-3 py-2 rounded-lg bg-[#0A0A0A] border border-[#222] text-sm hover:border-[#FFE066]">Sign in with GitHub</button>
          </div>

          <div className="pt-8 border-t border-[#222] flex items-center justify-between text-sm text-[#666]">
            <span>Don&apos;t have access?</span>
            <button type="button" onClick={() => navigate('/request-access')} className="text-white font-medium hover:text-[#FFE066] transition-colors">Request Access</button>
          </div>

          <div className="flex gap-6 pt-4">
            <div className="flex items-center gap-2 text-[10px] text-[#444] uppercase tracking-wider">
              <ShieldCheck size={14} className="text-[#33FFCC]" />
              <span>Local Encryption</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-[#444] uppercase tracking-wider">
              <Cpu size={14} className="text-[#8B5CF6]" />
              <span>AI Powered</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-[#444] uppercase tracking-wider">
              <Globe size={14} />
              <span>No IP Logging</span>
            </div>
          </div>
        </div>
      </div>

      <div className="hidden lg:flex flex-1 relative items-center justify-center overflow-hidden bg-gradient-to-br from-[#050505] via-[#0A0A0A] to-[#111]">
        <div className="absolute top-1/4 right-1/4 w-[600px] h-[600px] bg-[#8B5CF6] rounded-full blur-[180px] opacity-[0.1] animate-pulse"></div>
        <div className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] bg-[#FFE066] rounded-full blur-[180px] opacity-[0.08]"></div>

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[800px] h-[800px] rounded-full border border-[#222] absolute orbit-ring opacity-30">
            <div className="absolute top-1/2 -right-1.5 w-3 h-3 bg-[#333] rounded-full"></div>
          </div>
          <div className="w-[600px] h-[600px] rounded-full border border-[#222] absolute orbit-ring-reverse opacity-40">
            <div className="absolute bottom-1/2 -left-1.5 w-3 h-3 bg-[#444] rounded-full"></div>
          </div>
          <div className="w-[400px] h-[400px] rounded-full border border-[#333] absolute orbit-ring opacity-50">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1.5 w-3 h-3 bg-[#FFE066] rounded-full shadow-[0_0_15px_rgba(255,224,102,0.5)]"></div>
          </div>
        </div>

        <div className={`relative z-30 transform transition-all duration-1000 delay-300 floating-card ${isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
          <div className="w-[420px] bg-[#141414]/80 backdrop-blur-xl border border-[#333] p-8 rounded-[32px] shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#FFE066] to-[#8B5CF6]"></div>
            <div className="flex justify-between items-start mb-8">
              <div>
                <p className="text-[#888] text-xs uppercase tracking-wider mb-1">Total Net Worth</p>
                <h2 className="text-4xl font-bold text-white">$158,240.00</h2>
              </div>
              <div className="w-10 h-10 rounded-full bg-[#FFE066]/10 flex items-center justify-center text-[#FFE066]">
                <Sparkles size={20} />
              </div>
            </div>
            <div className="flex items-end gap-2 h-16 mb-8 opacity-50">
              <div className="w-1/6 bg-[#333] h-[40%] rounded-t-sm"></div>
              <div className="w-1/6 bg-[#333] h-[60%] rounded-t-sm"></div>
              <div className="w-1/6 bg-[#333] h-[50%] rounded-t-sm"></div>
              <div className="w-1/6 bg-[#333] h-[80%] rounded-t-sm"></div>
              <div className="w-1/6 bg-[#FFE066] h-[95%] rounded-t-sm shadow-[0_0_15px_rgba(255,224,102,0.3)]"></div>
              <div className="w-1/6 bg-[#333] h-[70%] rounded-t-sm"></div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#0A0A0A] border border-[#222]">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#33FFCC] animate-pulse"></div>
                  <span className="text-sm font-medium">Loop Strategy #1</span>
                </div>
                <span className="text-[#33FFCC] text-sm">+18.5% APY</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#0A0A0A] border border-[#222]">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#8B5CF6]"></div>
                  <span className="text-sm font-medium">AI Risk Check</span>
                </div>
                <span className="text-white text-sm flex items-center gap-1">
                  <CheckCircle2 size={12} className="text-[#8B5CF6]" /> Optimized
                </span>
              </div>
            </div>
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-[#FFE066] rounded-full blur-[60px] opacity-10"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;