import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { Input, Button } from '../components/ui';
import logo from '../assets/images/ta_bw_logo.svg';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSignIn = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-page flex items-center justify-center px-4">
      <div className="bg-surface border border-border rounded-[16px] shadow-md p-12 w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-2">
          <img src={logo} alt="TraceAgent" className="h-10" />
        </div>

        {/* App Name */}
        <h1 className="text-xl font-600 text-text-primary text-center mb-1">
          TraceAgent
        </h1>

        {/* Subtitle */}
        <p className="text-sm text-text-secondary text-center mb-8">
          Compliance Intelligence Platform
        </p>

        {/* Divider */}
        <div className="border-b border-border mb-8" />

        {/* Email Input */}
        <div className="mb-6">
          <Input
            label="Work Email"
            placeholder="analyst@institution.com"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {/* Password Input with Toggle */}
        <div className="mb-6">
          <label className="block text-sm font-500 text-text-primary mb-1.5">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-xl text-base bg-surface text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-accent focus:ring-opacity-20 focus:border-accent transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* Sign In Button */}
        <Button
          variant="primary"
          fullWidth
          onClick={handleSignIn}
          className="mt-6"
        >
          Sign In
        </Button>

        {/* Forgot Password Link */}
        <div className="text-center mt-3">
          <button
            type="button"
            className="text-sm text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
          >
            Forgot password?
          </button>
        </div>
      </div>
    </div>
  );
}
