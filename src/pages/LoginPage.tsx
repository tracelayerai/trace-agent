import type { ReactNode } from 'react';
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight, Check } from 'lucide-react';
import { useAuth, MOCK_USERS } from '@/context/AuthContext';
import type { Role } from '@/context/AuthContext';
import { COLORS } from '@/tokens/designTokens';
import fullLogo from '@/assets/images/full_logo_text.svg';
import loginBg  from '@/assets/images/login_bg1.jpg';

// ── Demo role config ───────────────────────────────────────────────────────────
const DEMO_ROLES: { key: Role; label: string; color: string; bg: string }[] = [
  { key: 'lead',    label: 'Lead',    color: COLORS.role.lead.color,    bg: COLORS.role.lead.bg    },
  { key: 'analyst', label: 'Analyst', color: COLORS.accent.lime,        bg: 'rgba(198,255,0,0.12)' },
  { key: 'admin',   label: 'Admin',   color: COLORS.role.admin.color,   bg: COLORS.role.admin.bg   },
];

// ── Field ──────────────────────────────────────────────────────────────────────
interface FieldProps {
  label: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  suffix?: ReactNode;
}
function Field({ label, type, placeholder, value, onChange, suffix }: FieldProps) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.01em' }}>{label}</label>
      <div style={{ position: 'relative' }}>
        <input
          type={type} placeholder={placeholder} value={value} onChange={onChange}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          className="login-field"
          style={{
            width: '100%', boxSizing: 'border-box',
            padding: suffix ? '11px 44px 11px 14px' : '11px 14px',
            background: focused ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.07)',
            border: `1px solid ${focused ? 'rgba(198,255,0,0.55)' : 'rgba(255,255,255,0.14)'}`,
            borderRadius: 10, color: '#FFFFFF', fontSize: 13,
            outline: 'none', fontFamily: 'inherit',
            boxShadow: focused ? '0 0 0 3px rgba(198,255,0,0.08)' : 'none',
            transition: 'border-color 0.15s, box-shadow 0.15s, background 0.15s',
            caretColor: '#C6FF00',
          }}
        />
        {suffix && (
          <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)' }}>
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

// ── OAuth button ───────────────────────────────────────────────────────────────
interface OAuthBtnProps { children: ReactNode; icon: ReactNode; }
function OAuthBtn({ children, icon }: OAuthBtnProps) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        padding: '10px 12px', borderRadius: 10, cursor: 'pointer',
        background: hov ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.06)',
        border: `1px solid ${hov ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.12)'}`,
        color: 'rgba(255,255,255,0.75)', fontSize: 12, fontWeight: 500,
        fontFamily: 'inherit', transition: 'all 0.15s', outline: 'none',
      }}
    >
      {icon}{children}
    </button>
  );
}

const GoogleIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const MicrosoftIcon = () => (
  <svg width="14" height="14" viewBox="0 0 21 21">
    <rect x="1" y="1" width="9" height="9" fill="#f25022"/>
    <rect x="11" y="1" width="9" height="9" fill="#7fba00"/>
    <rect x="1" y="11" width="9" height="9" fill="#00a4ef"/>
    <rect x="11" y="11" width="9" height="9" fill="#ffb900"/>
  </svg>
);

// ── Main ───────────────────────────────────────────────────────────────────────
export default function LoginPage() {
  const navigate       = useNavigate();
  const { login }      = useAuth();

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [demoRole, setDemoRole] = useState<Role>('analyst');
  const [roleHov,  setRoleHov]  = useState<Role | null>(null);
  const [btnHov,   setBtnHov]   = useState(false);

  const canSubmit = !!demoRole;

  const handleSignIn = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!canSubmit) return;
    login(demoRole);
    navigate('/dashboard');
  };

  return (
    <div style={{
      minHeight: '100vh', position: 'relative',
      display: 'flex',
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    }}>
      <style>{`.login-field::placeholder { color: rgba(255,255,255,0.28); font-size: 13px; }`}</style>

      {/* ── Full-page background ─────────────────────────────────────────────── */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 0,
        backgroundImage: `url(${loginBg})`,
        backgroundSize: 'cover', backgroundPosition: 'center',
      }} />
      <div style={{
        position: 'absolute', inset: 0, zIndex: 1,
        background: 'linear-gradient(135deg, rgba(5,14,26,0.82) 0%, rgba(8,22,36,0.76) 50%, rgba(6,16,28,0.70) 100%)',
      }} />

      {/* ── LEFT — brand panel ───────────────────────────────────────────────── */}
      <div style={{
        position: 'relative', zIndex: 2,
        flex: 1, display: 'flex', flexDirection: 'column',
        padding: 'clamp(48px, 6vw, 96px) clamp(56px, 7vw, 112px)',
        minWidth: 0,
      }}>

        <img src={fullLogo} style={{ height: 'clamp(40px, 3.5vw, 56px)', alignSelf: 'flex-start' }} alt="TraceAgent" />

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', maxWidth: 'clamp(480px, 50vw, 680px)' }}>
          <h1 style={{
            fontSize: 'clamp(48px, 4.5vw, 72px)', lineHeight: 1.06, color: '#fff', margin: '0 0 4px',
            fontFamily: '"Instrument Serif", serif', fontWeight: 400, fontStyle: 'italic',
            letterSpacing: '-0.01em',
          }}>
            Blockchain Forensics
          </h1>
          <h1 style={{
            fontSize: 'clamp(48px, 4.5vw, 72px)', lineHeight: 1.06, margin: '0 0 clamp(24px, 2.5vw, 36px)',
            fontFamily: '"Instrument Serif", serif', fontWeight: 400, fontStyle: 'italic',
            letterSpacing: '-0.01em',
            background: 'linear-gradient(90deg, #C6FF00 0%, #9EE000 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>
            at Machine Speed
          </h1>

          <div style={{ width: 'clamp(32px, 3vw, 48px)', height: 3, borderRadius: 2, background: '#C6FF00', opacity: 0.6, marginBottom: 'clamp(18px, 2vw, 28px)' }} />

          <p style={{ fontSize: 'clamp(14px, 1.2vw, 18px)', lineHeight: 1.7, color: 'rgba(255,255,255,0.45)', margin: 0, maxWidth: 'clamp(360px, 36vw, 560px)' }}>
            An agentic AI that turns raw on-chain activity into real-time, defensible intelligence —
            {' '}<span style={{ color: 'rgba(255,255,255,0.75)', fontWeight: 500 }}>minutes, not hours.</span>
          </p>
        </div>

        <p style={{ fontSize: 'clamp(11px, 0.8vw, 13px)', color: 'rgba(255,255,255,0.18)', margin: 0, lineHeight: 1.6 }}>
          © {new Date().getFullYear()} TraceLayer, Inc. All rights reserved.
        </p>
      </div>

      {/* ── RIGHT — sign-in ──────────────────────────────────────────────────── */}
      <div style={{
        position: 'relative', zIndex: 2,
        width: 520, flexShrink: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '48px 56px',
      }}>
        <div style={{ width: '100%', maxWidth: 380 }}>

          {/* Panel — elevated dark glass */}
          <div style={{
            background: 'rgba(12,22,45,0.82)',
            backdropFilter: 'blur(32px) saturate(140%)', WebkitBackdropFilter: 'blur(32px) saturate(140%)',
            borderRadius: 18,
            border: '1px solid rgba(255,255,255,0.12)',
            borderTop: '1px solid rgba(255,255,255,0.20)',
            padding: '32px 28px',
            boxShadow: '0 32px 80px rgba(0,0,0,0.60), 0 8px 32px rgba(0,0,0,0.30)',
            marginBottom: 14,
          }}>
            <div style={{ marginBottom: 24 }}>
              <h2 style={{ fontSize: 19, fontWeight: 700, color: '#FFFFFF', margin: '0 0 5px' }}>Sign in</h2>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.40)', margin: 0, lineHeight: 1.5 }}>
                Welcome back. Enter your credentials to continue.
              </p>
            </div>

            <form onSubmit={handleSignIn} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <Field label="Work email" type="email" placeholder="you@company.com"
                value={email} onChange={e => setEmail(e.target.value)} />

              <Field label="Password" type={showPass ? 'text' : 'password'} placeholder="Enter your password"
                value={password} onChange={e => setPassword(e.target.value)}
                suffix={
                  <button type="button" onClick={() => setShowPass(v => !v)}
                    style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                    {showPass
                      ? <EyeOff size={15} color="rgba(255,255,255,0.35)" />
                      : <Eye    size={15} color="rgba(255,255,255,0.35)" />}
                  </button>
                }
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: -6 }}>
                <button type="button" style={{
                  background: 'none', border: 'none', padding: 0, cursor: 'pointer',
                  fontSize: 12, color: 'rgba(255,255,255,0.35)', fontFamily: 'inherit',
                }}>Forgot password?</button>
              </div>

              <button
                type="submit" disabled={!canSubmit}
                onMouseEnter={() => setBtnHov(true)} onMouseLeave={() => setBtnHov(false)}
                style={{
                  width: '100%', padding: '12px 0', borderRadius: 10, border: 'none',
                  background: canSubmit ? (btnHov ? '#B8E600' : '#C6FF00') : 'rgba(255,255,255,0.06)',
                  color: canSubmit ? '#0A0A0F' : 'rgba(255,255,255,0.2)',
                  fontSize: 13, fontWeight: 700, cursor: canSubmit ? 'pointer' : 'not-allowed',
                  fontFamily: 'inherit', marginTop: 4,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  transition: 'background 0.15s',
                }}
              >
                Sign In
                <ArrowRight size={14} strokeWidth={2.5} />
              </button>
            </form>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '20px 0' }}>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.10)' }} />
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', whiteSpace: 'nowrap' }}>or continue with</span>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.10)' }} />
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <OAuthBtn icon={<GoogleIcon />}>Google</OAuthBtn>
              <OAuthBtn icon={<MicrosoftIcon />}>Microsoft</OAuthBtn>
            </div>

            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', textAlign: 'center', margin: '18px 0 0', lineHeight: 1.5 }}>
              Access is by invitation only. Check your email for a sign-in link.
            </p>
          </div>

          {/* Demo role switcher */}
          <div style={{
            background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
            border: `1px solid rgba(255,255,255,0.07)`,
            borderRadius: 12, padding: '10px 14px',
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', flexShrink: 0, letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 600 }}>
              Demo
            </span>
            <div style={{ width: 1, height: 12, background: 'rgba(255,255,255,0.08)', flexShrink: 0 }} />
            <div style={{ display: 'flex', gap: 6, flex: 1 }}>
              {DEMO_ROLES.map(r => {
                const isActive = demoRole === r.key;
                return (
                  <button key={r.key}
                    onClick={() => setDemoRole(r.key)}
                    onMouseEnter={() => setRoleHov(r.key)}
                    onMouseLeave={() => setRoleHov(null)}
                    style={{
                      padding: '3px 10px', borderRadius: 20,
                      border: `1px solid ${isActive ? r.color + '55' : 'rgba(255,255,255,0.08)'}`,
                      background: isActive ? r.bg : roleHov === r.key ? 'rgba(255,255,255,0.04)' : 'transparent',
                      color: isActive ? r.color : 'rgba(255,255,255,0.3)',
                      fontSize: 11, fontWeight: isActive ? 700 : 500,
                      cursor: 'pointer', fontFamily: 'inherit',
                      display: 'flex', alignItems: 'center', gap: 5,
                      transition: 'all 0.15s', outline: 'none', letterSpacing: '0.02em',
                    }}
                  >
                    {isActive && <Check size={9} strokeWidth={3} />}
                    {r.label}
                  </button>
                );
              })}
            </div>
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.15)', flexShrink: 0 }}>
              {MOCK_USERS[demoRole]?.name}
            </span>
          </div>

          {/* Design System link */}
          <div style={{ textAlign: 'center', marginTop: 12 }}>
            <Link to="/design-system" style={{
              fontSize: 11, color: 'rgba(255,255,255,0.18)',
              textDecoration: 'none', borderBottom: '1px solid rgba(255,255,255,0.10)',
              paddingBottom: 1, transition: 'color 0.15s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.4)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.18)'; }}
            >
              Design System
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
