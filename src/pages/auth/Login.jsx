import React, { useState, useEffect } from 'react';
import { LoginForm } from '../../components/login-form';
import supabase from '../../lib/supabase';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';

// --- Left Info Panel for CollegeCanteen ---
const InfoPanel = () => (
  <div className="hidden lg:flex w-2/5 text-white flex-col justify-between p-0 shadow-2xl" style={{borderTopRightRadius: '1rem', borderBottomRightRadius: '1rem', minWidth: '340px', height: '100%', background: 'none'}}>
    <div className="flex flex-col items-center justify-center h-full w-full relative">
      <img src="/dish.png" alt="Delicious Dish" className="absolute inset-0 w-full h-full object-cover rounded-tr-[1rem] rounded-br-[1rem]" style={{zIndex: 0, opacity: 1}} />
    </div>
  </div>
);

export default function Login() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showSignup, setShowSignup] = useState(false);

  // Shared form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [profileInserted, setProfileInserted] = useState(false);

  // Show signup if the URL is /auth/sign-up
  useEffect(() => {
    if (location.pathname === '/auth/sign-up') {
      setShowSignup(true);
      setName('');
      setEmail('');
      setPhone('');
      setPassword('');
      setConfirmPassword('');
      setError('');
      setSuccess('');
      setEmailError('');
      setProfileInserted(false);
    } else {
      setShowSignup(false);
    }
  }, [location.pathname]);

  // Handle magic link errors in the URL hash and redirect
  useEffect(() => {
    if (window.location.hash.includes('error=access_denied') || window.location.hash.includes('otp_expired')) {
      setError('Your email confirmation link has expired or is invalid. Please request a new confirmation.');
      setTimeout(() => {
        navigate('/auth/sign-up', { replace: true });
        window.location.hash = '';
      }, 3000);
    }
  }, [navigate]);

  // Switch to signup/login and update URL
  const handleSwitch = (signup) => {
    if (signup) {
      navigate('/auth/sign-up');
    } else {
      navigate('/auth/login');
    }
  };

  // Helper function to extract email_name from email
  const getEmailName = (email) => {
    return email.split('@')[0];
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (showSignup) {
      // Validate required fields
      if (!name || !email || !phone || !password || !confirmPassword) {
        setError('All fields are required');
        setLoading(false);
        return;
      }

      // Validate password length
      if (password.length < 8) {
        setError('Password must be at least 8 characters long');
        setLoading(false);
        return;
      }

      // Validate password match
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        setLoading(false);
        return;
      }

      // Validate email domain
      if (!/@(gmail\.com|mite\.ac\.in)$/i.test(email)) {
        setError('Only gmail.com or mite.ac.in emails are allowed');
        setLoading(false);
        return;
      }

      try {
        // Check if profile already exists
        const { data: existingProfile, error: fetchError } = await supabase
          .from('profiles')
          .select('id, email, email_name')
          .or(`email.eq.${email},email_name.eq.${getEmailName(email)}`)
          .maybeSingle();

        if (fetchError && fetchError.code !== 'PGRST116') {
          setError('Failed to check for existing profile: ' + fetchError.message);
          setLoading(false);
          return;
        }

        if (existingProfile) {
          setError('A profile with this email already exists. Please login or use a different email.');
          setLoading(false);
          return;
        }

        // Store signup data in localStorage for later use after email confirmation
        localStorage.setItem('signup_name', name);
        localStorage.setItem('signup_email', email);
        localStorage.setItem('signup_email_name', getEmailName(email));
        localStorage.setItem('signup_phone', phone);
        localStorage.setItem('signup_password', password);

        // Send magic link for email confirmation
        const { error: magicLinkError } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: window.location.origin + '/auth/sign-up',
          },
        });

        if (magicLinkError) {
          setError(magicLinkError.message);
          setLoading(false);
          return;
        }

        setSuccess('📧 Email confirmation sent! Please check your inbox and click the confirmation link to complete your signup for CollegeCanteen.');
        setLoading(false);
        
        // Clear form after sending magic link
        setName('');
        setEmail('');
        setPhone('');
        setPassword('');
        setConfirmPassword('');
        
      } catch (err) {
        setError('An unexpected error occurred: ' + err.message);
        setLoading(false);
      }
    } else {
      // Login logic
      if (!email || !password) {
        setError('Email and password are required');
        setLoading(false);
        return;
      }

      try {
        // First, check if user exists in profiles table
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id, email, email_name, password, role')
          .or(`email.eq.${email},email_name.eq.${getEmailName(email)}`)
          .maybeSingle();

        if (profileError) {
          setError('Failed to fetch user profile: ' + profileError.message);
          setLoading(false);
          return;
        }

        if (!profile) {
          setError('No account found with this email. Please sign up first.');
          setLoading(false);
          return;
        }

        // Verify password (simple comparison for now - in production, use proper hashing)
        if (profile.password !== password) {
          setError('Invalid email or password');
          setLoading(false);
          return;
        }

        // Set the user in Supabase auth so RLS policies work
        // We'll use the profile ID as the user ID in Supabase auth
        const { error: authError } = await supabase.auth.signInWithPassword({
          email: profile.email,
          password: profile.password,
        });

        // If Supabase auth fails (which it will since we're not using it for signup),
        // we'll create a session manually and use a workaround for RLS
        if (authError) {
          console.log('Supabase auth not available, using custom session');
        }

        // Create a session manually since we're not using Supabase Auth for login
        // We'll store the user info in localStorage for session management
        localStorage.setItem('user_session', JSON.stringify({
          id: profile.id,
          email: profile.email,
          email_name: profile.email_name,
          role: profile.role,
          name: profile.name
        }));

        setSuccess('Login successful!');
        setLoading(false);

        // Redirect based on role
        if (profile.role === 'staff') {
          setTimeout(() => {
            navigate('/staff/dashboard');
          }, 1000);
        } else {
          // Default to user dashboard for all other roles
          setTimeout(() => {
            navigate('/user/dashboard');
          }, 1000);
        }

      } catch (err) {
        setError('An unexpected error occurred: ' + err.message);
        setLoading(false);
      }
    }
  };

  // Detect session after email confirmation and insert profile
  useEffect(() => {
    if (!showSignup || profileInserted) return;
    
    const checkSessionAndInsertProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || !session.user || !session.user.id) return; // Wait for session

      // Get signup data from localStorage
      const localName = localStorage.getItem('signup_name');
      const localEmail = localStorage.getItem('signup_email');
      const localEmailName = localStorage.getItem('signup_email_name');
      const localPhone = localStorage.getItem('signup_phone');
      const localPassword = localStorage.getItem('signup_password');

      // Only insert if all fields are present
      if (!localName || !localEmail || !localPhone || !localPassword) {
        setError('Your signup information is missing. Please re-enter your details and request a new confirmation.');
        return;
      }

      // Check if profile already exists
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('id, email, email_name')
        .or(`email.eq.${localEmail},email_name.eq.${localEmailName}`)
        .maybeSingle();

      if (fetchError && fetchError.code !== 'PGRST116') {
        setError('Failed to check for existing profile: ' + fetchError.message);
        return;
      }

      if (existingProfile) {
        setError('A profile with this email already exists. Please login or use a different email.');
        setProfileInserted(true);
        localStorage.removeItem('signup_name');
        localStorage.removeItem('signup_email');
        localStorage.removeItem('signup_email_name');
        localStorage.removeItem('signup_phone');
        localStorage.removeItem('signup_password');
        return;
      }

      // Determine role based on email
      const userRole = localEmail === 'nishalpoojary66@gmail.com' ? 'staff' : 'user';
      
      // Insert profile data after email confirmation
      const { error: profileError } = await supabase.from('profiles').insert([
        {
          id: session.user.id,
          name: localName,
          email_name: localEmailName,
          email: localEmail,
          phone: localPhone,
          password: localPassword,
          role: userRole,
          profile_image_url: null,
        },
      ]);

      if (profileError) {
        setError('Failed to save profile: ' + profileError.message);
        return;
      }

      setProfileInserted(true);
      setSuccess('🎉 Signup complete! Your email has been confirmed and your account is now active. You can now login!');
      
      // Clear localStorage
      localStorage.removeItem('signup_name');
      localStorage.removeItem('signup_email');
      localStorage.removeItem('signup_email_name');
      localStorage.removeItem('signup_phone');
      localStorage.removeItem('signup_password');
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        setSuccess('');
        handleSwitch(false);
      }, 3000);
    };

    const interval = setInterval(checkSessionAndInsertProfile, 1000);
    return () => clearInterval(interval);
  }, [showSignup, profileInserted]);

  return (
    <div className="bg-black min-h-screen flex items-center justify-center" style={{minHeight: '100vh'}}>
      <div className="flex flex-col lg:flex-row items-center justify-center" style={{height: '99vh', width: '100vw'}}>
        <InfoPanel />
        <div className="hidden lg:flex w-7/12 items-center justify-center p-0" style={{height: '100%'}}>
          <div className="bg-white rounded-3xl shadow-2xl w-full h-full flex items-center justify-center border-4 border-black">
            <div className="w-full max-w-lg p-6">
              <LoginForm
                mode={showSignup ? 'signup' : 'login'}
                onSignupClick={() => handleSwitch(true)}
                onLoginClick={() => handleSwitch(false)}
                onSubmit={handleSubmit}
                loading={loading}
                error={error}
                success={success}
                form={{ 
                  name, 
                  setName, 
                  email, 
                  setEmail, 
                  phone, 
                  setPhone, 
                  password,
                  setPassword,
                  confirmPassword,
                  setConfirmPassword,
                  emailError, 
                  setEmailError 
                }}
              />
            </div>
          </div>
        </div>
        {/* Mobile view: show login only */}
        <div className="w-full flex lg:hidden items-center justify-center p-6" style={{height: '100%'}}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg h-auto p-6 border-4 border-black">
            <LoginForm
              mode={showSignup ? 'signup' : 'login'}
              onSignupClick={() => handleSwitch(true)}
              onLoginClick={() => handleSwitch(false)}
              onSubmit={handleSubmit}
              loading={loading}
              error={error}
              success={success}
              form={{ 
                name, 
                setName, 
                email, 
                setEmail, 
                phone, 
                setPhone, 
                password,
                setPassword,
                confirmPassword,
                setConfirmPassword,
                emailError, 
                setEmailError 
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
} 