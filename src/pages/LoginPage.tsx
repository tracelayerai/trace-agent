import type { ReactNode } from 'react';
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight, Check } from 'lucide-react';
import { useAuth, MOCK_USERS } from '@/context/AuthContext';
import type { Role } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import fullLogo from '@/assets/images/full_logo_text.svg';
import loginBg  from '@/assets/images/login_bg1.jpg';

// ── Demo role config ────────────────────────────────────────────────────────────
const DEMO_ROLES: { key: Role; label: string; color: string; bg: string }[] = [
  { key: 'lead',    label: 'Lead',    color: '#60A5FA', bg: 'rgba(96,165,250,0.12)'  },
  { key: 'analyst', label: 'Analyst', color: '#C6FF00', bg: 'rgba(198,255,0,0.12)'  },
  { key: 'admin',   label: 'Admin',   color: '#A78BFA', bg: 'rgba(167,139,250,0.12)' },
];

// ── Field ───────────────────────────────────────────────────────────────────────
interface FieldProps {
  label: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  suffix?: ReactNode;
}
function Field({ label, type, placeholder, value, onChange, suffix }: FieldProps) {
  return (
    <div className="flex flex-col gap-[6px]">
      <label className="text-[12px] font-medium text-[rgba(255,255,255,0.55)] tracking-[0.01em]">{label}</label>
      <div className="relative">
        <input
          type={type} placeholder={placeholder} value={value} onChange={onChange}
          className={cn(
            'login-field w-full box-border rounded-[10px] text-[13px] text-white outline-none font-[inherit]',
            'bg-[rgba(255,255,255,0.07)] border border-[rgba(255,255,255,0.14)]',
            'transition-[border-color,box-shadow,background] duration-150',
            'focus:bg-[rgba(255,255,255,0.10)] focus:border-[rgba(198,255,0,0.55)] focus:shadow-[0_0_0_3px_rgba(198,255,0,0.08)]',
            '[caret-color:#C6FF00]',
            suffix ? 'py-[11px] pr-[44px] pl-[14px]' : 'px-[14px] py-[11px]',
          )}
        />
        {suffix && (
          <span className="absolute right-[12px] top-1/2 -translate-y-1/2">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

// ── OAuth button ────────────────────────────────────────────────────────────────
interface OAuthBtnProps { children: ReactNode; icon: ReactNode; }
function OAuthBtn({ children, icon }: OAuthBtnProps) {
  return (
    <button className="flex-1 flex items-center justify-center gap-[8px] px-[12px] py-[10px] rounded-[10px] cursor-pointer bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.12)] text-[rgba(255,255,255,0.75)] text-[12px] font-medium font-[inherit] outline-none transition-all duration-150 hover:bg-[rgba(255,255,255,0.10)] hover:border-[rgba(255,255,255,0.22)]">
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

// ── Main ────────────────────────────────────────────────────────────────────────
export default function LoginPage() {
  const navigate       = useNavigate();
  const { login }      = useAuth();

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [demoRole, setDemoRole] = useState<Role>('analyst');

  const canSubmit = !!demoRole;

  const handleSignIn = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!canSubmit) return;
    login(demoRole);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen relative flex font-sans">
      <style>{`.login-field::placeholder { color: rgba(255,255,255,0.28); font-size: 13px; }`}</style>

      {/* Full-page background */}
      <div className="absolute inset-0 z-0 bg-cover bg-center" style={{ backgroundImage: `url(${loginBg})` }} />
      <div className="absolute inset-0 z-[1] bg-[linear-gradient(135deg,rgba(5,14,26,0.82)_0%,rgba(8,22,36,0.76)_50%,rgba(6,16,28,0.70)_100%)]" />

      {/* LEFT — brand panel */}
      <div className="relative z-[2] flex-1 flex flex-col min-w-0" style={{ padding: 'clamp(48px, 6vw, 96px) clamp(56px, 7vw, 112px)' }}>

        <img src={fullLogo} alt="TraceAgent" style={{ height: 'clamp(40px, 3.5vw, 56px)', alignSelf: 'flex-start' }} />

        <div className="flex-1 flex flex-col justify-center" style={{ maxWidth: 'clamp(480px, 50vw, 680px)' }}>
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

          <div className="rounded-[2px]" style={{ width: 'clamp(32px, 3vw, 48px)', height: 3, background: '#C6FF00', opacity: 0.6, marginBottom: 'clamp(18px, 2vw, 28px)' }} />

          <p className="m-0" style={{ fontSize: 'clamp(14px, 1.2vw, 18px)', lineHeight: 1.7, color: 'rgba(255,255,255,0.45)', maxWidth: 'clamp(360px, 36vw, 560px)' }}>
            An agentic AI that turns raw on-chain activity into real-time, defensible intelligence —
            {' '}<span className="text-[rgba(255,255,255,0.75)] font-medium">minutes, not hours.</span>
          </p>
        </div>

        <p className="m-0 leading-relaxed" style={{ fontSize: 'clamp(11px, 0.8vw, 13px)', color: 'rgba(255,255,255,0.18)' }}>
          © {new Date().getFullYear()} TraceLayer, Inc. All rights reserved.
        </p>
      </div>

      {/* RIGHT — sign-in */}
      <div className="relative z-[2] w-[520px] shrink-0 flex flex-col items-center justify-center px-[56px] py-[48px]">
        <div className="w-full max-w-[380px]">

          {/* Panel — elevated dark glass */}
          <div className="rounded-[18px] border-t border-t-[rgba(255,255,255,0.20)] border border-[rgba(255,255,255,0.12)] p-[32px_28px] mb-[14px]"
            style={{
              background: 'rgba(12,22,45,0.82)',
              backdropFilter: 'blur(32px) saturate(140%)', WebkitBackdropFilter: 'blur(32px) saturate(140%)',
              boxShadow: '0 32px 80px rgba(0,0,0,0.60), 0 8px 32px rgba(0,0,0,0.30)',
            }}>
            <div className="mb-[24px]">
              <h2 className="text-[19px] font-bold text-white m-0 mb-[5px]">Sign in</h2>
              <p className="text-[12px] text-[rgba(255,255,255,0.40)] m-0 leading-relaxed">
                Welcome back. Enter your credentials to continue.
              </p>
            </div>

            <form onSubmit={handleSignIn} className="flex flex-col gap-[14px]">
              <Field label="Work email" type="email" placeholder="you@company.com"
                value={email} onChange={e => setEmail(e.target.value)} />

              <Field label="Password" type={showPass ? 'text' : 'password'} placeholder="Enter your password"
                value={password} onChange={e => setPassword(e.target.value)}
                suffix={
                  <button type="button" onClick={() => setShowPass(v => !v)}
                    className="bg-transparent border-none p-0 cursor-pointer flex items-center">
                    {showPass
                      ? <EyeOff size={15} color="rgba(255,255,255,0.35)" />
                      : <Eye    size={15} color="rgba(255,255,255,0.35)" />}
                  </button>
                }
              />

              <div className="flex justify-end -mt-[6px]">
                <button type="button" className="bg-transparent border-none p-0 cursor-pointer text-[12px] text-[rgba(255,255,255,0.35)] font-[inherit]">
                  Forgot password?
                </button>
              </div>

              <button
                type="submit" disabled={!canSubmit}
                className={cn(
                  'w-full py-[12px] rounded-[10px] border-none text-[13px] mt-[4px]',
                  'flex items-center justify-center gap-[6px] transition-colors duration-150',
                  canSubmit
                    ? 'bg-[#C6FF00] text-[#0A0A0F] cursor-pointer hover:bg-[#B8E600]'
                    : 'bg-[rgba(255,255,255,0.06)] text-[rgba(255,255,255,0.2)] cursor-not-allowed',
                )}
                style={{ fontWeight: 700, fontFamily: 'inherit' }}
              >
                Sign In
                <ArrowRight size={14} strokeWidth={2.5} />
              </button>
            </form>

            <div className="flex items-center gap-[10px] my-[20px]">
              <div className="flex-1 h-px bg-[rgba(255,255,255,0.10)]" />
              <span className="text-[11px] text-[rgba(255,255,255,0.25)] whitespace-nowrap">or continue with</span>
              <div className="flex-1 h-px bg-[rgba(255,255,255,0.10)]" />
            </div>

            <div className="flex gap-[10px]">
              <OAuthBtn icon={<GoogleIcon />}>Google</OAuthBtn>
              <OAuthBtn icon={<MicrosoftIcon />}>Microsoft</OAuthBtn>
            </div>

            <p className="text-[11px] text-[rgba(255,255,255,0.25)] text-center mt-[18px] mb-0 leading-relaxed">
              Access is by invitation only. Check your email for a sign-in link.
            </p>
          </div>

          {/* Demo role switcher */}
          <div className="rounded-[12px] border border-[rgba(255,255,255,0.07)] px-[14px] py-[10px] flex items-center gap-[10px]"
            style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}>
            <span className="text-[10px] text-[rgba(255,255,255,0.2)] shrink-0 tracking-[0.06em] uppercase font-semibold">
              Demo
            </span>
            <div className="w-px h-[12px] bg-[rgba(255,255,255,0.08)] shrink-0" />
            <div className="flex gap-[6px] flex-1">
              {DEMO_ROLES.map(r => {
                const isActive = demoRole === r.key;
                return (
                  <button key={r.key}
                    onClick={() => setDemoRole(r.key)}
                    className="px-[10px] py-[3px] rounded-full text-[11px] cursor-pointer font-[inherit] flex items-center gap-[5px] transition-all duration-150 outline-none tracking-[0.02em]"
                    style={{
                      border: `1px solid ${isActive ? r.color + '55' : 'rgba(255,255,255,0.08)'}`,
                      background: isActive ? r.bg : 'transparent',
                      color: isActive ? r.color : 'rgba(255,255,255,0.3)',
                      fontWeight: isActive ? 700 : 500,
                    }}
                  >
                    {isActive && <Check size={9} strokeWidth={3} />}
                    {r.label}
                  </button>
                );
              })}
            </div>
            <span className="text-[10px] text-[rgba(255,255,255,0.15)] shrink-0">
              {MOCK_USERS[demoRole]?.name}
            </span>
          </div>

          {/* Design System link */}
          <div className="text-center mt-[12px]">
            <Link to="/design-system"
              className="text-[11px] text-[rgba(255,255,255,0.18)] no-underline border-b border-b-[rgba(255,255,255,0.10)] pb-px transition-colors duration-150 hover:text-[rgba(255,255,255,0.4)]"
            >
              Design System
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
