import React, { useState } from 'react';
import { Mail, Lock, Scale, Eye, EyeOff } from 'lucide-react';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase';

const LoginPage = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [resetSent, setResetSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // onLogin is called automatically by the auth state listener in App.jsx
      // but we can still call it for immediate UI updates if needed
      if (onLogin) {
        onLogin(userCredential.user);
      }
    } catch (error) {
      const errorMessage = 
        error.code === 'auth/user-not-found' ? 'No account found with this email.' :
        error.code === 'auth/wrong-password' ? 'Invalid password.' :
        error.code === 'auth/invalid-email' ? 'Invalid email format.' :
        'An error occurred during login. Please try again.';
      setError(errorMessage);
      console.error('Login error:', error);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Please enter your email address first.');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      setResetSent(true);
      setError('');
    } catch (error) {
      setError('Could not send reset email. Please check your email address.');
      console.error('Reset password error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#22223B] via-[#4A4E69] to-[#9A8C98] flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#C9ADA7]/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#F2E9E4]/20 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl shadow-2xl p-8 space-y-8">
          <div className="text-center">
            <div className="inline-block bg-gradient-to-br from-cyan-400 to-purple-500 p-4 rounded-2xl mb-6 shadow-lg">
              <Scale className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">Advocate Portal</h2>
            <p className="text-white/70">Sign in to access your dashboard</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm">
                {error}
              </div>
            )}
            {resetSent && (
              <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-green-500 text-sm">
                Password reset link has been sent to your email.
              </div>
            )}
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/60" />
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#C9ADA7] transition-all text-white placeholder-white/60"
              />
            </div>
            
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/60" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-12 pr-12 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#C9ADA7] transition-all text-white placeholder-white/60"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-white/70">
                <input type="checkbox" className="rounded border-white/20 bg-white/10" />
                Remember me
              </label>
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-sm text-[#F2E9E4] hover:text-[#C9ADA7] transition-colors"
              >
                Forgot password?
              </button>
            </div>
            
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-[#9A8C98] to-[#C9ADA7] text-[#22223B] py-4 rounded-2xl font-semibold hover:shadow-lg hover:scale-[1.02] transition-all duration-300"
            >
              Sign In
            </button>
          </form>
          
          <div className="text-center">
            <p className="text-white/60 text-sm">
              Don't have an account? 
              <a href="#" className="text-[#F2E9E4] hover:text-[#C9ADA7] ml-1 transition-colors">
                Contact Admin
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;