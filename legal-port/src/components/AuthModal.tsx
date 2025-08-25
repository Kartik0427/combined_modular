
import React, { useState, useEffect } from 'react';
import { Mail, Lock, Eye, EyeOff, X, Phone } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { auth, db } from '../lib/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
  sendPasswordResetEmail,
  sendEmailVerification,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
  User,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { countries } from '../lib/countries';

declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
  }
}

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: User) => void;
}

const GoogleIcon = () => (
  <svg className="mr-2 h-4 w-4" aria-hidden="true" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12 c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24 s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657 C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36 c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574 c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
  </svg>
);

export default function AuthModal({ isOpen, onClose, onAuthSuccess }: AuthModalProps) {
  const [view, setView] = useState<'signIn' | 'signUp' | 'forgotPassword' | 'phoneSignUp'>('signIn');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [address, setAddress] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [emailOtp, setEmailOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [showEmailOtpInput, setShowEmailOtpInput] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [emailVerificationSent, setEmailVerificationSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createUserDocument = async (user: User, additionalData = {}) => {
    if (!user) return;
    const userRef = doc(db, 'users', user.uid);
    const snapshot = await getDoc(userRef);
    if (!snapshot.exists()) {
      const { displayName, email, photoURL } = user;
      const createdAt = new Date();
      try {
        await setDoc(userRef, {
          displayName,
          email,
          photoURL,
          createdAt,
          emailVerified: user.emailVerified,
          ...additionalData
        });
      } catch (error) {
        console.error('Error creating user document', error);
      }
    }
  };

  useEffect(() => {
    if (isOpen) {
      setView('signIn');
      setName('');
      setEmail('');
      setPassword('');
      setDateOfBirth('');
      setAddress('');
      setCountryCode('+91');
      setPhoneNumber('');
      setOtp('');
      setEmailOtp('');
      setLoading(false);
      setShowOtpInput(false);
      setShowEmailOtpInput(false);
      setConfirmationResult(null);
      setEmailVerificationSent(false);
      setError(null);
      setShowPassword(false);
    }
  }, [isOpen]);

  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: (response: any) => {
          console.log('reCAPTCHA verified');
        }
      });
    }
    return window.recaptchaVerifier;
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      onAuthSuccess(userCredential.user);
    } catch (error: any) {
      setError(error.message);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });
      
      // Send email verification
      await sendEmailVerification(userCredential.user);
      setEmailVerificationSent(true);
      setShowEmailOtpInput(true);
      
      await createUserDocument(userCredential.user, { 
        name, 
        dateOfBirth, 
        address,
        emailVerified: false 
      });
      
      toast.success('Account created! Please check your email for verification.');
    } catch (error: any) {
      setError(error.message);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success('Password reset email sent!');
      setView('signIn');
    } catch (error: any) {
      setError(error.message);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      await createUserDocument(result.user);
      onAuthSuccess(result.user);
    } catch (error: any) {
      setError(error.message);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const recaptchaVerifier = setupRecaptcha();
      const fullPhoneNumber = `${countryCode}${phoneNumber}`;
      const confirmation = await signInWithPhoneNumber(auth, fullPhoneNumber, recaptchaVerifier);
      setConfirmationResult(confirmation);
      setShowOtpInput(true);
      toast.success('Verification code sent to your phone!');
    } catch (error: any) {
      setError(error.message);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmationResult) return;
    setLoading(true);
    setError(null);
    try {
      const result = await confirmationResult.confirm(otp);
      
      // Check if user exists in database
      const userDocRef = doc(db, 'users', result.user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        toast.success('Successfully signed in!');
        onAuthSuccess(result.user);
      } else {
        // User doesn't exist, redirect to phone sign up
        setView('phoneSignUp');
        toast.success('Phone verified! Please complete your profile.');
      }
    } catch (error: any) {
      setError(error.message);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailVerificationCheck = async () => {
    setLoading(true);
    setError(null);
    try {
      const user = auth.currentUser;
      if (user) {
        await user.reload();
        if (user.emailVerified) {
          // Update user document with email verified status
          const userRef = doc(db, 'users', user.uid);
          await setDoc(userRef, { emailVerified: true }, { merge: true });
          
          toast.success('Email verified successfully!');
          onAuthSuccess(user);
        } else {
          setError('Email not verified yet. Please check your email and click the verification link.');
          toast.error('Email not verified yet. Please check your email.');
        }
      }
    } catch (error: any) {
      setError(error.message);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const user = auth.currentUser;
      if (user) {
        await updateProfile(user, { displayName: name });
        await createUserDocument(user, {
          name,
          email,
          dateOfBirth,
          address,
          phoneNumber: user.phoneNumber
        });
        onAuthSuccess(user);
      }
    } catch (error: any) {
      setError(error.message);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md p-8">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X size={24} />
        </button>

        {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}

        {view === 'signIn' && (
          <div>
            <h2 className="text-2xl font-bold text-center">Welcome Back</h2>
            <p className="text-center text-gray-500 mt-1 mb-6">Sign in to your Legal Port account</p>
            
            <Tabs defaultValue="email" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="email">Email</TabsTrigger>
                <TabsTrigger value="phone">Phone</TabsTrigger>
              </TabsList>
              
              <TabsContent value="email" className="mt-6">
                <form onSubmit={handleEmailSignIn} className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative mt-1">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <Input 
                        id="email" 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        required 
                        placeholder="Enter your email" 
                        className="pl-10" 
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="password">Password</Label>
                    <div className="relative mt-1">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <Input 
                        id="password" 
                        type={showPassword ? 'text' : 'password'} 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        required 
                        placeholder="Enter your password" 
                        className="pl-10 pr-10" 
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)} 
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    <div className="text-right mt-1">
                      <button 
                        type="button" 
                        onClick={() => setView('forgotPassword')} 
                        className="text-sm text-gold hover:underline"
                      >
                        Forgot Password?
                      </button>
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    disabled={loading} 
                    className="w-full bg-gold text-white hover:bg-gold/90 h-11 text-base"
                  >
                    {loading ? 'Signing In...' : 'Sign In'}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="phone" className="mt-6">
                {!showOtpInput ? (
                  <form onSubmit={handlePhoneSignIn} className="space-y-4">
                    <div>
                      <Label htmlFor="phone-number-login">Phone Number</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Select onValueChange={setCountryCode} defaultValue={countryCode}>
                          <SelectTrigger className="w-auto">
                            <SelectValue placeholder="Select Country" />
                          </SelectTrigger>
                          <SelectContent>
                            {countries.map(country => (
                              <SelectItem key={country.name} value={country.code}>
                                {country.flag} {country.code}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input 
                          id="phone-number-login" 
                          type="tel" 
                          value={phoneNumber} 
                          onChange={(e) => setPhoneNumber(e.target.value)} 
                          required 
                          placeholder="1234567890" 
                        />
                      </div>
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full bg-gold text-white hover:bg-gold/90 h-11 text-base" 
                      disabled={loading}
                    >
                      {loading ? 'Sending OTP...' : 'Send OTP'}
                    </Button>
                  </form>
                ) : (
                  <form onSubmit={handleOtpVerify} className="space-y-4">
                    <div>
                      <Label htmlFor="otp">Enter OTP</Label>
                      <Input 
                        id="otp" 
                        type="text" 
                        value={otp} 
                        onChange={(e) => setOtp(e.target.value)} 
                        required 
                        placeholder="123456" 
                        className="text-center text-lg tracking-widest"
                        maxLength={6}
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full bg-gold text-white hover:bg-gold/90 h-11 text-base" 
                      disabled={loading}
                    >
                      {loading ? 'Verifying...' : 'Verify OTP'}
                    </Button>
                  </form>
                )}
              </TabsContent>
            </Tabs>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">Or continue with</span>
              </div>
            </div>
            
            <Button 
              onClick={handleGoogleSignIn} 
              variant="outline" 
              className="w-full h-11 mb-3"
            >
              <GoogleIcon /> Continue with Google
            </Button>
            
            <p className="text-center text-sm text-gray-600 mt-6">
              Don't have an account? <button 
                onClick={() => setView('signUp')} 
                className="font-semibold text-gold hover:underline"
              >
                Sign Up
              </button>
            </p>
          </div>
        )}

        {view === 'signUp' && (
          <div>
            <h2 className="text-2xl font-bold text-center">Create Account</h2>
            <p className="text-center text-gray-500 mt-1 mb-6">Get started with Legal Port</p>
            
            {!showEmailOtpInput ? (
              <form onSubmit={handleEmailSignUp} className="space-y-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input 
                    id="name" 
                    type="text" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    required 
                    placeholder="Enter your full name" 
                  />
                </div>
                <div>
                  <Label htmlFor="signup-email">Email Address</Label>
                  <Input 
                    id="signup-email" 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                    placeholder="Enter your email" 
                  />
                </div>
                <div>
                  <Label htmlFor="date-of-birth">Date of Birth</Label>
                  <Input 
                    id="date-of-birth" 
                    type="date" 
                    value={dateOfBirth} 
                    onChange={(e) => setDateOfBirth(e.target.value)} 
                    required 
                  />
                </div>
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input 
                    id="address" 
                    type="text" 
                    value={address} 
                    onChange={(e) => setAddress(e.target.value)} 
                    required 
                    placeholder="Enter your full address" 
                  />
                </div>
                <div>
                  <Label htmlFor="signup-password">Password</Label>
                  <Input 
                    id="signup-password" 
                    type="password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                    placeholder="Create a password" 
                  />
                </div>
                <Button 
                  type="submit" 
                  disabled={loading} 
                  className="w-full bg-gold text-white hover:bg-gold/90 h-11 text-base"
                >
                  {loading ? 'Creating Account...' : 'Sign Up'}
                </Button>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <Mail className="mx-auto mb-2 text-green-600" size={24} />
                  <p className="text-sm text-green-700">
                    Verification email sent to <strong>{email}</strong>
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    Please check your email and click the verification link to continue.
                  </p>
                </div>
                
                <Button 
                  onClick={handleEmailVerificationCheck}
                  disabled={loading} 
                  className="w-full bg-gold text-white hover:bg-gold/90 h-11 text-base"
                >
                  {loading ? 'Checking...' : 'I have verified my email'}
                </Button>
                
                <Button 
                  onClick={async () => {
                    const user = auth.currentUser;
                    if (user) {
                      await sendEmailVerification(user);
                      toast.success('Verification email sent again!');
                    }
                  }}
                  variant="outline"
                  className="w-full h-11 text-base"
                >
                  Resend Verification Email
                </Button>
              </div>
            )}
            
            <p className="text-center text-sm text-gray-600 mt-6">
              Already have an account? <button 
                onClick={() => setView('signIn')} 
                className="font-semibold text-gold hover:underline"
              >
                Sign In
              </button>
            </p>
          </div>
        )}

        {view === 'forgotPassword' && (
          <div>
            <h2 className="text-2xl font-bold text-center">Reset Password</h2>
            <p className="text-center text-gray-500 mt-1 mb-6">Enter your email to get a reset link</p>
            <form onSubmit={handlePasswordReset} className="space-y-4">
              <div>
                <Label htmlFor="reset-email">Email Address</Label>
                <Input 
                  id="reset-email" 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                  placeholder="Enter your email" 
                />
              </div>
              <Button 
                type="submit" 
                disabled={loading} 
                className="w-full bg-gold text-white hover:bg-gold/90 h-11 text-base"
              >
                {loading ? 'Sending Link...' : 'Send Reset Link'}
              </Button>
            </form>
            <p className="text-center text-sm text-gray-600 mt-6">
              Remembered your password? <button 
                onClick={() => setView('signIn')} 
                className="font-semibold text-gold hover:underline"
              >
                Sign In
              </button>
            </p>
          </div>
        )}

        {view === 'phoneSignUp' && (
          <div>
            <h2 className="text-2xl font-bold text-center">Complete Your Profile</h2>
            <p className="text-center text-gray-500 mt-1 mb-6">Please provide your details to complete registration</p>
            <form onSubmit={handlePhoneSignUp} className="space-y-4">
              <div>
                <Label htmlFor="phone-signup-name">Full Name</Label>
                <Input 
                  id="phone-signup-name" 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  required 
                  placeholder="Enter your full name" 
                />
              </div>
              <div>
                <Label htmlFor="phone-signup-email">Email Address</Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <Input 
                    id="phone-signup-email" 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                    placeholder="Enter your email" 
                    className="pl-10" 
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="phone-signup-dob">Date of Birth</Label>
                <Input 
                  id="phone-signup-dob" 
                  type="date" 
                  value={dateOfBirth} 
                  onChange={(e) => setDateOfBirth(e.target.value)} 
                  required 
                />
              </div>
              <div>
                <Label htmlFor="phone-signup-address">Address</Label>
                <Input 
                  id="phone-signup-address" 
                  type="text" 
                  value={address} 
                  onChange={(e) => setAddress(e.target.value)} 
                  required 
                  placeholder="Enter your full address" 
                />
              </div>
              <div>
                <Label htmlFor="phone-signup-password">Password</Label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <Input 
                    id="phone-signup-password" 
                    type={showPassword ? 'text' : 'password'} 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                    placeholder="Create a password" 
                    className="pl-10 pr-10" 
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)} 
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <Button 
                type="submit" 
                disabled={loading} 
                className="w-full bg-gold text-white hover:bg-gold/90 h-11 text-base"
              >
                {loading ? 'Creating Account...' : 'Complete Registration'}
              </Button>
            </form>
          </div>
        )}
      </div>
      <div id="recaptcha-container"></div>
    </div>
  );
}
