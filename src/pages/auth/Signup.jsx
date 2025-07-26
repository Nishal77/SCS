import React, { useState } from 'react';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Button } from '../../components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    // Here you would add your signup logic (e.g., Supabase, API call)
    setTimeout(() => {
      setLoading(false);
      navigate('/auth/login');
    }, 1200);
  };

  return (
    <div className="bg-black min-h-screen flex items-center justify-center" style={{minHeight: '100vh'}}>
      <div className="flex flex-col items-center justify-center w-full" style={{height: '99vh', width: '100vw'}}>
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-8 border-4 border-black flex flex-col items-center">
          <h1 className="text-3xl font-extrabold text-center mb-2 text-orange-500 drop-shadow-lg">Create your Canteen Account</h1>
          <p className="text-gray-600 text-center mb-8">Sign up to order food, track your meals, and enjoy a smarter canteen experience!</p>
          <form className="w-full flex flex-col gap-6" onSubmit={handleSignup}>
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" type="text" placeholder="Your Name" value={name} onChange={e => setName(e.target.value)} required className="bg-gray-50" />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required className="bg-gray-50" />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" type="tel" placeholder="9876543210" value={phone} onChange={e => setPhone(e.target.value)} required className="bg-gray-50" />
            </div>
            <Button type="submit" className="w-full bg-gradient-to-r from-orange-400 to-yellow-400 text-white font-bold text-lg shadow-lg hover:from-orange-500 hover:to-yellow-500 transition-all" disabled={loading}>
              {loading ? 'Signing up...' : 'Sign Up'}
            </Button>
          </form>
          <p className="mt-6 text-sm text-gray-600 text-center">
            Already have an account?{' '}
            <span className="text-orange-500 font-bold cursor-pointer hover:underline" onClick={() => navigate('/auth/login')}>Login</span>
          </p>
        </div>
      </div>
    </div>
  );
} 