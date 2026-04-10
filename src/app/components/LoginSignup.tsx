import { useEffect, useRef, useState } from 'react';
import { Mail, Lock, User, Phone, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { BrandLogo } from './BrandLogo';
import { googleAuth, login, signup, type AuthResponse } from '../api';

type GoogleCredentialResponse = {
  credential?: string;
};

type GoogleIdentityApi = {
  accounts: {
    id: {
      initialize: (config: {
        client_id: string;
        callback: (response: GoogleCredentialResponse) => void;
      }) => void;
      prompt: () => void;
    };
  };
};

declare global {
  interface Window {
    google?: GoogleIdentityApi;
  }
}

interface LoginSignupProps {
  onClose: () => void;
  onLogin: (session: AuthResponse) => void;
}

export function LoginSignup({ onClose, onLogin }: LoginSignupProps) {
  const googleClientId = String(import.meta.env.VITE_GOOGLE_CLIENT_ID || '').trim();
  const googleInitRef = useRef(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleReady, setIsGoogleReady] = useState(false);
  const [googleError, setGoogleError] = useState('');
  const [loginError, setLoginError] = useState('');
  const [signupError, setSignupError] = useState('');

  const [loginData, setLoginData] = useState({
    identifier: '',
    password: ''
  });

  const [signupData, setSignupData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const normalizePhone = (value: string) => value.replace(/\D/g, '');

  useEffect(() => {
    if (!googleClientId) {
      return;
    }

    let cancelled = false;

    const initializeGoogle = () => {
      if (cancelled || googleInitRef.current || !window.google?.accounts?.id) {
        return;
      }

      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: async (response) => {
          const idToken = String(response?.credential || '').trim();
          if (!idToken) {
            const message = 'Google authentication failed. Please try again.';
            setGoogleError(message);
            setLoginError(message);
            setSignupError(message);
            return;
          }

          setIsSubmitting(true);
          setGoogleError('');
          setLoginError('');
          setSignupError('');

          try {
            const session = await googleAuth({
              idToken,
              role: 'buyer',
            });
            onLogin(session);
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Google login failed.';
            setGoogleError(message);
            setLoginError(message);
            setSignupError(message);
          } finally {
            setIsSubmitting(false);
          }
        },
      });

      googleInitRef.current = true;
      setIsGoogleReady(true);
    };

    if (window.google?.accounts?.id) {
      initializeGoogle();
      return () => {
        cancelled = true;
      };
    }

    const existingScript = document.querySelector('script[data-google-gsi="true"]');
    if (existingScript) {
      existingScript.addEventListener('load', initializeGoogle, { once: true });
      return () => {
        cancelled = true;
      };
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.dataset.googleGsi = 'true';
    script.onload = initializeGoogle;
    script.onerror = () => {
      if (!cancelled) {
        setGoogleError('Unable to load Google sign-in.');
      }
    };
    document.head.appendChild(script);

    return () => {
      cancelled = true;
    };
  }, [googleClientId, onLogin]);

  const handleGoogleLogin = () => {
    setGoogleError('');
    setLoginError('');
    setSignupError('');

    if (!googleClientId) {
      const message = 'Google sign-in is not configured.';
      setGoogleError(message);
      setLoginError(message);
      setSignupError(message);
      return;
    }

    if (!isGoogleReady || !window.google?.accounts?.id) {
      const message = 'Google sign-in is still loading. Please try again.';
      setGoogleError(message);
      setLoginError(message);
      setSignupError(message);
      return;
    }

    window.google.accounts.id.prompt();
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setSignupError('');
    setGoogleError('');
    setIsSubmitting(true);

    try {
      const identifier = loginData.identifier.trim();
      const password = loginData.password;
      if (!identifier || !password) {
        setLoginError('Email/phone and password are required.');
        return;
      }

      const session = await login({
        identifier,
        password,
      });
      onLogin(session);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed.';
      setLoginError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError('');
    setLoginError('');
    setIsSubmitting(true);

    try {
      const name = signupData.name.trim();
      const email = signupData.email.trim().toLowerCase();
      const phone = normalizePhone(signupData.phone);
      const password = signupData.password;
      const confirmPassword = signupData.confirmPassword;

      if (!name || !email || !phone || !password || !confirmPassword) {
        setSignupError('All signup fields are required.');
        return;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setSignupError('Enter a valid email address.');
        return;
      }

      if (phone.length < 6) {
        setSignupError('Enter a valid phone number.');
        return;
      }

      if (password !== confirmPassword) {
        setSignupError('Passwords do not match.');
        return;
      }

      const session = await signup({
        name,
        email,
        phone,
        password,
        confirmPassword,
        role: 'buyer',
      });
      onLogin(session);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Signup failed.';
      setSignupError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background">
        <div className="h-full overflow-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-border">
          <div className="max-w-[1400px] mx-auto px-4 py-4 flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={onClose}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <BrandLogo size="sm" />
            <div className="w-10" />
          </div>
        </div>

        <div className="max-w-md mx-auto px-4 py-8">
          {/* Welcome Section */}
          <div className="text-center mb-8">
            <div className="mx-auto mb-4">
              <BrandLogo size="lg" showTagline />
            </div>
            <h2 className="text-2xl font-bold mb-2">Welcome to BYNDIO</h2>
            <p className="text-muted-foreground">
              Your hyperlocal delivery marketplace
            </p>
          </div>

          {/* Login/Signup Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            {/* Login Form */}
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email or Phone</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="login-email"
                      type="text"
                      placeholder="Enter email or phone number"
                      value={loginData.identifier}
                      onChange={(e) => setLoginData({ ...loginData, identifier: e.target.value })}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter password"
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      className="pl-10 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    className="text-sm text-primary hover:underline"
                    onClick={() => alert('Forgot password flow')}
                  >
                    Forgot Password?
                  </button>
                </div>

                <Button type="submit" className="w-full" size="lg">
                  {isSubmitting ? 'Logging in...' : 'Login'}
                </Button>

                {loginError ? <p className="text-sm text-red-600">{loginError}</p> : null}

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button type="button" variant="outline" onClick={handleGoogleLogin} disabled={isSubmitting}>
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Google
                  </Button>
                  <Button type="button" variant="outline" onClick={() => alert('OTP login')}>
                    <Phone className="w-5 h-5 mr-2" />
                    OTP
                  </Button>
                </div>

                {googleError ? <p className="text-sm text-red-600">{googleError}</p> : null}
              </form>
            </TabsContent>

            {/* Signup Form */}
            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="Enter your full name"
                      value={signupData.name}
                      onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="signup-phone"
                      type="tel"
                      placeholder="Enter 10-digit mobile number"
                      value={signupData.phone}
                      onChange={(e) => setSignupData({ ...signupData, phone: e.target.value })}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="Enter email address"
                      value={signupData.email}
                      onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="signup-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Create a strong password"
                      value={signupData.password}
                      onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                      className="pl-10 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Minimum 8 characters with uppercase, lowercase, and number
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-confirm-password">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="signup-confirm-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Re-enter password"
                      value={signupData.confirmPassword}
                      onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                      className="pl-10 pr-10"
                      required
                    />
                  </div>
                </div>

                <div className="bg-accent/10 border border-accent rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold">₹50</span>
                    </div>
                    <div>
                      <p className="font-medium text-sm">Welcome Bonus!</p>
                      <p className="text-xs text-muted-foreground">Get ₹50 rewards on signup</p>
                    </div>
                  </div>
                </div>

                <Button type="submit" className="w-full" size="lg">
                  {isSubmitting ? 'Creating account...' : 'Create Account'}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleGoogleLogin}
                  disabled={isSubmitting}
                >
                  Continue with Google
                </Button>

                {signupError ? <p className="text-sm text-red-600">{signupError}</p> : null}
                {googleError ? <p className="text-sm text-red-600">{googleError}</p> : null}

                <p className="text-xs text-center text-muted-foreground">
                  By signing up, you agree to our{' '}
                  <button type="button" className="text-primary hover:underline">
                    Terms of Service
                  </button>{' '}
                  and{' '}
                  <button type="button" className="text-primary hover:underline">
                    Privacy Policy
                  </button>
                </p>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
